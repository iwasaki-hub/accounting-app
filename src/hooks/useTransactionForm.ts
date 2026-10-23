import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";

export type TransactionType = "income" | "expense";

const MIN_YEAR = 2026;
const MAX_YEAR = 2030;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useTransactionForm() {
  const [type, setType] = useState<TransactionType>("expense");
  const [date, setDate] = useState(formatDate(new Date()));
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveTransaction(
    onSuccessAcknowledge?: () => void,
  ) {
    if (isSaving) return;

    const trimmedTitle = title.trim();
    const numericAmount = Number(amount);

    // 必須項目の確認
    if (!date.trim() || !trimmedTitle || !amount.trim()) {
      Alert.alert(
        "入力内容を確認してください",
        "日付・取引内容・金額を入力してください。",
      );
      return;
    }

    // 日付形式の確認
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

    if (!dateMatch) {
      Alert.alert(
        "日付を確認してください",
        "日付は YYYY-MM-DD の形式で入力してください。",
      );
      return;
    }

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    const parsedDate = new Date(year, month - 1, day);

    if (
      year < MIN_YEAR ||
      year > MAX_YEAR ||
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      Alert.alert(
        "日付を確認してください",
        "取引日は2026年1月1日から2030年12月31日の間で選択してください。",
      );
      return;
    }

    // 金額の確認
    if (!Number.isSafeInteger(numericAmount) || numericAmount <= 0) {
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
        Alert.alert(
          "ログインが必要です",
          "ログインし直してから、もう一度お試しください。",
        );
        return;
      }

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        transaction_date: date,
        transaction_type: type,
        description: trimmedTitle,
        amount: numericAmount,
      });

      if (error) {
        console.error("仕訳の保存エラー:", error);

        Alert.alert(
          "保存に失敗しました",
          "データを保存できませんでした。通信状態やログイン状態を確認してください。",
        );
        return;
      }

      // 保存成功後、次の仕訳を入力できる状態にする
      setTitle("");
      setAmount("");

      Alert.alert(
        "保存しました",
        `${type === "income" ? "売上・収入" : "経費・支出"}を保存しました。\n\n${trimmedTitle}：${numericAmount.toLocaleString("ja-JP")}円\n\n次の仕訳を入力できます。`,
        [
          {
            text: "OK",
            onPress: onSuccessAcknowledge,
          },
        ],
      );
    } catch (error) {
      console.error("仕訳の保存エラー:", error);

      Alert.alert(
        "エラー",
        "保存中に問題が発生しました。通信状態を確認してください。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    type,
    setType,
    date,
    setDate,
    title,
    setTitle,
    amount,
    setAmount,
    isSaving,
    saveTransaction,
  };
}
