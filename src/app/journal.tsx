import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/journal.styles";

type Transaction = {
  id: string;
  transaction_date: string;
  transaction_type: "income" | "expense";
  description: string;
  amount: number;
};

export default function JournalScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTransactions = useCallback(async () => {
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

      const { data, error } = await supabase
        .from("transactions")
        .select("id, transaction_date, transaction_type, description, amount")
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("仕訳の取得エラー:", error);
        setErrorMessage("仕訳を読み込めませんでした。もう一度お試しください。");
        return;
      }

      setTransactions((data ?? []) as Transaction[]);
    } catch (error) {
      console.error("仕訳の取得エラー:", error);
      setErrorMessage("通信エラーが発生しました。接続を確認してください。");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions]),
  );

  const totalIncome = transactions
    .filter((item) => item.transaction_type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpense = transactions
    .filter((item) => item.transaction_type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  function formatAmount(amount: number) {
    return `${Number(amount).toLocaleString("ja-JP")}円`;
  }

  function openEditor(item: Transaction) {
    setEditingTransaction(item);
    setEditDate(item.transaction_date);
    setEditType(item.transaction_type);
    setEditDescription(item.description);
    setEditAmount(String(item.amount));
  }

  function isValidDate(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
      return false;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  async function saveEdit() {
    if (!editingTransaction || isSaving) {
      return;
    }

    const description = editDescription.trim();
    const amount = Number(editAmount);

    if (!isValidDate(editDate)) {
      Alert.alert(
        "日付を確認してください",
        "日付は正しい YYYY-MM-DD 形式で入力してください。",
      );
      return;
    }

    if (!description || description.length > 100) {
      Alert.alert(
        "取引内容を確認してください",
        "取引内容を1〜100文字で入力してください。",
      );
      return;
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      Alert.alert(
        "金額を確認してください",
        "金額は1円以上の整数で入力してください。",
      );
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("ログインが必要です", "再度ログインしてください。");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .update({
          transaction_date: editDate,
          transaction_type: editType,
          description,
          amount,
        })
        .eq("id", editingTransaction.id)
        .eq("user_id", user.id)
        .select("id");

      if (error) {
        console.error("仕訳の更新エラー:", error);
        Alert.alert("更新に失敗しました", "通信状態を確認してください。");
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert(
          "更新できませんでした",
          "対象の仕訳が見つからないか、更新する権限がありません。",
        );
        return;
      }

      setEditingTransaction(null);
      await loadTransactions();
      Alert.alert("更新しました", "仕訳を保存しました。");
    } catch (error) {
      console.error("仕訳の更新エラー:", error);
      Alert.alert("エラー", "仕訳を更新できませんでした。");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTransaction || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("ログインが必要です", "再度ログインしてください。");
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", deletingTransaction.id)
        .eq("user_id", user.id)
        .select("id");

      if (error) {
        console.error("仕訳の削除エラー:", error);
        Alert.alert("削除に失敗しました", "通信状態を確認してください。");
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert(
          "削除できませんでした",
          "対象の仕訳が見つからないか、削除する権限がありません。",
        );
        return;
      }

      setDeletingTransaction(null);
      await loadTransactions();
      Alert.alert("削除しました", "仕訳を削除しました。");
    } catch (error) {
      console.error("仕訳の削除エラー:", error);
      Alert.alert("エラー", "仕訳を削除できませんでした。");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            void loadTransactions();
          }}
        />
      }
    >
      <AppHeader title="仕訳帳" subtitle="登録した売上・経費を確認できます。" />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>登録済みの仕訳</Text>
        <Text style={styles.countValue}>
          {transactions.length.toLocaleString("ja-JP")}件
        </Text>

        <View style={styles.summaryDivider} />

        <Text style={styles.summaryLabel}>売上・収入の合計</Text>
        <Text style={styles.incomeValue}>{formatAmount(totalIncome)}</Text>

        <Text style={[styles.summaryLabel, { marginTop: 16 }]}>
          経費・支出の合計
        </Text>
        <Text style={styles.expenseValue}>{formatAmount(totalExpense)}</Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>取引履歴</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setIsRefreshing(true);
            void loadTransactions();
          }}
          disabled={isLoading || isRefreshing}
        >
          <Text style={styles.refreshText}>再読み込み</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.messageCard}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.messageText}>仕訳を読み込んでいます...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.messageCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              void loadTransactions();
            }}
          >
            <Text style={styles.retryButtonText}>もう一度試す</Text>
          </Pressable>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.messageCard}>
          <Text style={styles.emptyTitle}>仕訳はまだありません</Text>
          <Text style={styles.messageText}>
            「仕訳入力」から売上や経費を登録してみましょう。
          </Text>
        </View>
      ) : (
        <View style={styles.transactionList}>
          {transactions.map((item) => {
            const isIncome = item.transaction_type === "income";

            return (
              <View key={item.id} style={styles.transactionCard}>
                <View style={styles.transactionTopRow}>
                  <Text style={styles.transactionDate}>
                    {item.transaction_date}
                  </Text>

                  <View
                    style={[
                      styles.typeBadge,
                      isIncome ? styles.incomeBadge : styles.expenseBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        isIncome
                          ? styles.incomeBadgeText
                          : styles.expenseBadgeText,
                      ]}
                    >
                      {isIncome ? "売上・収入" : "経費・支出"}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionBottomRow}>
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <Text
                    style={[
                      styles.amount,
                      isIncome ? styles.incomeValue : styles.expenseValue,
                    ]}
                  >
                    {isIncome ? "+" : "-"}
                    {formatAmount(Number(item.amount))}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openEditor(item)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>編集</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setDeletingTransaction(item)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>削除</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal
        visible={editingTransaction !== null}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!isSaving) {
            setEditingTransaction(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>仕訳を編集</Text>

              <Text style={styles.fieldLabel}>取引区分</Text>
              <View style={styles.typeRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditType("income")}
                  style={[
                    styles.typeChoice,
                    editType === "income" && styles.incomeChoiceSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChoiceText,
                      editType === "income" && styles.choiceSelectedText,
                    ]}
                  >
                    売上・収入
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditType("expense")}
                  style={[
                    styles.typeChoice,
                    editType === "expense" && styles.expenseChoiceSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChoiceText,
                      editType === "expense" && styles.choiceSelectedText,
                    ]}
                  >
                    経費・支出
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>取引日</Text>
              <TextInput
                value={editDate}
                onChangeText={setEditDate}
                placeholder="YYYY-MM-DD"
                style={styles.editInput}
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>取引内容</Text>
              <TextInput
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="例：ガソリン代"
                style={styles.editInput}
                maxLength={100}
              />

              <Text style={styles.fieldLabel}>金額（円）</Text>
              <TextInput
                value={editAmount}
                onChangeText={setEditAmount}
                placeholder="例：5000"
                style={styles.editInput}
                keyboardType="numeric"
              />

              <Pressable
                accessibilityRole="button"
                onPress={() => void saveEdit()}
                disabled={isSaving}
                style={[
                  styles.modalPrimaryButton,
                  isSaving && { opacity: 0.6 },
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryButtonText}>変更を保存</Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => setEditingTransaction(null)}
                disabled={isSaving}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelButtonText}>キャンセル</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deletingTransaction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) {
            setDeletingTransaction(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.modalTitle}>仕訳を削除しますか？</Text>
            <Text style={styles.confirmDescription}>
              「{deletingTransaction?.description}」の仕訳を削除します。
              この操作は取り消せません。
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => void confirmDelete()}
              disabled={isDeleting}
              style={[styles.modalDeleteButton, isDeleting && { opacity: 0.6 }]}
            >
              {isDeleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalPrimaryButtonText}>削除する</Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setDeletingTransaction(null)}
              disabled={isDeleting}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelButtonText}>キャンセル</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
