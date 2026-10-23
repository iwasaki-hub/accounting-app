import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import AppHeader from "../components/AppHeader";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/dashboard.styles";

const menuItems = [
  {
    icon: "＋",
    title: "仕訳を登録",
    description: "日々の収入・支出を記録",
    color: "#2563EB",
  },
  {
    icon: "帳",
    title: "仕訳帳",
    description: "登録した取引を確認",
    color: "#0D9488",
  },
  {
    icon: "表",
    title: "会計レポート",
    description: "売上・経費・利益を確認",
    color: "#7C3AED",
  },
];

type MonthlyTransaction = {
  transaction_type: "income" | "expense";
  amount: number;
};

export default function Index() {
  const router = useRouter();

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  const loadMonthlySummary = useCallback(async () => {
    setIsSummaryLoading(true);
    setSummaryError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSummaryError("ログイン状態を確認できません。");
        return;
      }

      // 今月の開始日と翌月の開始日を計算
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const startDate = [year, String(month + 1).padStart(2, "0"), "01"].join(
        "-",
      );

      const nextMonth = new Date(year, month + 1, 1);

      const endDate = [
        nextMonth.getFullYear(),
        String(nextMonth.getMonth() + 1).padStart(2, "0"),
        "01",
      ].join("-");

      // 今月の仕訳だけをSupabaseから取得
      const { data, error } = await supabase
        .from("transactions")
        .select("transaction_type, amount")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate);

      if (error) {
        console.error("月別集計の取得エラー:", error);
        setSummaryError("集計を読み込めませんでした。");
        return;
      }

      const transactions = (data ?? []) as MonthlyTransaction[];

      const income = transactions
        .filter((item) => item.transaction_type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const expense = transactions
        .filter((item) => item.transaction_type === "expense")
        .reduce((sum, item) => sum + Number(item.amount), 0);

      setMonthlyIncome(income);
      setMonthlyExpense(expense);
    } catch (error) {
      console.error("月別集計の取得エラー:", error);
      setSummaryError("通信エラーが発生しました。");
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMonthlySummary();
    }, [loadMonthlySummary]),
  );

  const formatYen = (amount: number) => `¥${amount.toLocaleString("ja-JP")}`;

  const summaryText = isSummaryLoading
    ? "集計中..."
    : summaryError
      ? "取得できません"
      : "";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppHeader title="ダッシュボード" subtitle="日々の会計を、シンプルに。" />

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeLabel}>MY BUSINESS</Text>
        <Text style={styles.welcomeTitle}>今日も会計を整理しましょう</Text>
        <Text style={styles.welcomeDescription}>
          取引を記録して、事業のお金の流れを把握しましょう。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>今月の収支</Text>
        <Text style={styles.sectionDescription}>
          {summaryError
            ? summaryError
            : "Supabaseに保存された今月の仕訳を集計しています"}
        </Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeading}>
              <View style={styles.salesDot} />
              <Text style={styles.summaryLabel}>売上</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {summaryText || formatYen(monthlyIncome)}
            </Text>
            <Text style={styles.summaryNote}>今月の収入合計</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeading}>
              <View style={styles.expenseDot} />
              <Text style={styles.summaryLabel}>経費</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {summaryText || formatYen(monthlyExpense)}
            </Text>
            <Text style={styles.summaryNote}>今月の支出合計</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeading}>
              <View style={styles.profitDot} />
              <Text style={styles.summaryLabel}>差引</Text>
            </View>
            <Text style={styles.summaryAmount}>
              {summaryText || formatYen(monthlyIncome - monthlyExpense)}
            </Text>
            <Text style={styles.summaryNote}>売上 − 経費</Text>
          </View>
        </View>

        {summaryError ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadMonthlySummary()}
            style={{
              alignSelf: "flex-start",
              marginTop: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: "#DBEAFE",
            }}
          >
            <Text style={{ color: "#1D4ED8", fontWeight: "700" }}>
              再読み込み
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>会計メニュー</Text>
        <Text style={styles.sectionDescription}>よく使う機能</Text>

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              onPress={() => {
                if (item.title === "仕訳を登録") {
                  router.push("/entry");
                } else if (item.title === "仕訳帳") {
                  router.push("/journal");
                } else if (item.title === "会計レポート") {
                  router.push("/reports");
                }
              }}
              style={styles.menuCard}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>

              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>

              <Text style={styles.menuArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>次のステップ</Text>
        <Text style={styles.noticeText}>
          仕訳データを活用して、日々の会計管理をさらに便利にしていきましょう。
        </Text>
      </View>

      <Text style={styles.footer}>ACCOUNTING APP · DEVELOPMENT VERSION</Text>
    </ScrollView>
  );
}
