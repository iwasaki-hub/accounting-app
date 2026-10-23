import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import AppHeader from "../components/AppHeader";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/reports.styles";

type Transaction = {
  transaction_date: string;
  transaction_type: "income" | "expense";
  description: string;
  amount: number | string;
};

type ExpenseBreakdown = {
  description: string;
  amount: number;
};

function formatYen(amount: number): string {
  return `${Math.round(amount).toLocaleString("ja-JP")}円`;
}

function formatMonth(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ReportsScreen() {
  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartTransactions, setChartTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorMessage(
          "ログイン状態を確認できません。再度ログインしてください。",
        );
        return;
      }

      const startDate = getDateString(selectedMonth);
      const endDate = getDateString(
        new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1),
      );

      const { data, error } = await supabase
        .from("transactions")
        .select("transaction_date, transaction_type, description, amount")
        .eq("user_id", user.id)
        .gte("transaction_date", startDate)
        .lt("transaction_date", endDate)
        .order("transaction_date", { ascending: true });

      if (error) {
        console.error("会計レポートの取得エラー:", error);
        setErrorMessage(
          "レポートを読み込めませんでした。もう一度お試しください。",
        );
        return;
      }

      setTransactions((data ?? []) as Transaction[]);

      // グラフ用に過去6か月分の取引を取得
      const chartStartDate = getDateString(
        new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 5, 1),
      );

      const { data: chartData, error: chartError } = await supabase
        .from("transactions")
        .select("transaction_date, transaction_type, description, amount")
        .eq("user_id", user.id)
        .gte("transaction_date", chartStartDate)
        .lt("transaction_date", endDate)
        .order("transaction_date", { ascending: true });

      if (chartError) {
        console.error("グラフデータの取得エラー:", chartError);
        setChartTransactions([]);
      } else {
        setChartTransactions((chartData ?? []) as Transaction[]);
      }
    } catch (error) {
      console.error("会計レポートの取得エラー:", error);
      setErrorMessage("通信エラーが発生しました。接続を確認してください。");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions]),
  );

  const incomeTransactions = transactions.filter(
    (item) => item.transaction_type === "income",
  );

  const expenseTransactions = transactions.filter(
    (item) => item.transaction_type === "expense",
  );

  const totalIncome = incomeTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  const totalExpense = expenseTransactions.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  const profit = totalIncome - totalExpense;

  const monthlyChartData = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() - 5 + index,
      1,
    );

    const year = month.getFullYear();
    const monthNumber = month.getMonth();

    const monthTransactions = chartTransactions.filter((item) => {
      const date = new Date(`${item.transaction_date}T00:00:00`);

      return date.getFullYear() === year && date.getMonth() === monthNumber;
    });

    const income = monthTransactions
      .filter((item) => item.transaction_type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expense = monthTransactions
      .filter((item) => item.transaction_type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      label: `${monthNumber + 1}月`,
      income,
      expense,
      profit: income - expense,
    };
  });

  const chartMax = Math.max(
    1,
    ...monthlyChartData.flatMap((item) => [
      item.income,
      item.expense,
      Math.max(0, item.profit),
    ]),
  );

  const expenseBreakdown: ExpenseBreakdown[] = Object.values(
    expenseTransactions.reduce<Record<string, ExpenseBreakdown>>(
      (result, item) => {
        const description = item.description.trim() || "未分類";
        const amount = Number(item.amount);

        if (!result[description]) {
          result[description] = {
            description,
            amount: 0,
          };
        }

        result[description].amount += amount;

        return result;
      },
      {},
    ),
  ).sort((a, b) => b.amount - a.amount);

  const maxExpense = Math.max(
    ...expenseBreakdown.map((item) => item.amount),
    1,
  );

  const isCurrentOrFutureMonth =
    selectedMonth.getFullYear() > new Date().getFullYear() ||
    (selectedMonth.getFullYear() === new Date().getFullYear() &&
      selectedMonth.getMonth() >= new Date().getMonth());

  function changeMonth(offset: number) {
    setSelectedMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <AppHeader
        title="会計レポート"
        subtitle="月ごとの売上・経費・利益を確認しましょう。"
      />

      <View style={styles.monthSelector}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="前の月"
          onPress={() => changeMonth(-1)}
          style={styles.monthButton}
        >
          <Text style={styles.monthButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.monthTitle}>{formatMonth(selectedMonth)}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="次の月"
          disabled={isCurrentOrFutureMonth}
          onPress={() => changeMonth(1)}
          style={[
            styles.monthButton,
            isCurrentOrFutureMonth && styles.disabledButton,
          ]}
        >
          <Text style={styles.monthButtonText}>›</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.messageCard}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.messageText}>収支を集計しています...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.messageCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => void loadTransactions()}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>再読み込み</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>月間収支</Text>
            <Text style={styles.sectionDescription}>
              {formatMonth(selectedMonth)}の取引集計
            </Text>

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>売上・収入</Text>
              <Text style={[styles.summaryAmount, styles.incomeText]}>
                {formatYen(totalIncome)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>経費・支出</Text>
              <Text style={[styles.summaryAmount, styles.expenseText]}>
                {formatYen(totalExpense)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.profitCard}>
              <Text style={styles.profitLabel}>差引利益</Text>
              <Text
                style={[
                  styles.profitAmount,
                  profit < 0 && styles.negativeProfit,
                ]}
              >
                {formatYen(profit)}
              </Text>
              <Text style={styles.profitNote}>売上・収入 − 経費・支出</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>月別の収支推移</Text>

            <Text style={styles.sectionDescription}>
              過去6か月の売上・経費・差引利益
            </Text>

            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {[
                  { label: "売上", color: "#16A34A" },
                  { label: "経費", color: "#DC2626" },
                  { label: "差引利益", color: "#2563EB" },
                ].map((item) => (
                  <View
                    key={item.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        backgroundColor: item.color,
                      }}
                    />
                    <Text style={{ fontSize: 12, color: "#475569" }}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              {monthlyChartData.map((item, index) => (
                <View
                  key={`${item.label}-${index}`}
                  style={{ marginBottom: index === 5 ? 0 : 20 }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    {new Date(
                      selectedMonth.getFullYear(),
                      selectedMonth.getMonth() - 5 + index,
                      1,
                    ).getFullYear()}
                    年 {item.label}
                  </Text>

                  {[
                    { label: "売上", value: item.income, color: "#16A34A" },
                    { label: "経費", value: item.expense, color: "#DC2626" },
                    { label: "差引", value: item.profit, color: "#2563EB" },
                  ].map((bar) => (
                    <View
                      key={bar.label}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 5,
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          width: 36,
                          fontSize: 11,
                          color: "#64748B",
                        }}
                      >
                        {bar.label}
                      </Text>

                      <View
                        style={{
                          flex: 1,
                          height: 12,
                          borderRadius: 4,
                          backgroundColor: "#F1F5F9",
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(
                              100,
                              (Math.abs(bar.value) / chartMax) * 100,
                            )}%`,
                            height: "100%",
                            backgroundColor: bar.color,
                            borderRadius: 4,
                          }}
                        />
                      </View>

                      <Text
                        style={{
                          width: 90,
                          textAlign: "right",
                          fontSize: 11,
                          color: bar.value < 0 ? "#DC2626" : "#334155",
                        }}
                        numberOfLines={1}
                      >
                        {formatYen(bar.value)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>経費の内訳</Text>
            <Text style={styles.sectionDescription}>
              取引内容ごとの経費合計
            </Text>

            {expenseBreakdown.length === 0 ? (
              <View style={styles.messageCard}>
                <Text style={styles.emptyTitle}>経費の登録はありません</Text>
                <Text style={styles.messageText}>
                  この月に登録した経費がここに表示されます。
                </Text>
              </View>
            ) : (
              <View style={styles.breakdownCard}>
                {expenseBreakdown.map((item) => (
                  <View key={item.description} style={styles.breakdownItem}>
                    <View style={styles.breakdownHeading}>
                      <Text style={styles.breakdownLabel}>
                        {item.description}
                      </Text>
                      <Text style={styles.breakdownAmount}>
                        {formatYen(item.amount)}
                      </Text>
                    </View>

                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${(item.amount / maxExpense) * 100}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.breakdownPercentage}>
                      経費全体の
                      {totalExpense > 0
                        ? ((item.amount / totalExpense) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>取引の概要</Text>

            <View style={styles.countCard}>
              <View style={styles.countItem}>
                <Text style={styles.countLabel}>売上・収入の件数</Text>
                <Text style={styles.countValue}>
                  {incomeTransactions.length}件
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.countItem}>
                <Text style={styles.countLabel}>経費・支出の件数</Text>
                <Text style={styles.countValue}>
                  {expenseTransactions.length}件
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.countItem}>
                <Text style={styles.countLabel}>取引合計</Text>
                <Text style={styles.countValue}>{transactions.length}件</Text>
              </View>
            </View>
          </View>

          {transactions.length === 0 ? (
            <Text style={styles.footerNote}>
              仕訳入力から取引を登録すると、月間レポートに反映されます。
            </Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
