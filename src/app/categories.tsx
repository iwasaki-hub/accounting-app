import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AppHeader from "../components/AppHeader";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/categories.styles";

type TransactionType = "income" | "expense";

type Category = {
  id: string;
  name: string;
  transaction_type: TransactionType;
  icon: string;
  sort_order: number;
};

const ICONS = [
  "⛽",
  "🚗",
  "🛣️",
  "🅿️",
  "🔧",
  "🛡️",
  "📱",
  "🧾",
  "💻",
  "📦",
  "🍱",
  "🏠",
  "💰",
  "📈",
  "🚚",
  "🛒",
  "✏️",
  "⭐",
];

export default function CategoriesScreen() {
  const router = useRouter();

  const [type, setType] = useState<TransactionType>("expense");
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🧾");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("ログインが必要です", "ログインし直してください。");
        return;
      }

      const { data, error } = await supabase
        .from("transaction_categories")
        .select("id, name, transaction_type, icon, sort_order")
        .eq("user_id", user.id)
        .eq("transaction_type", type)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("項目取得エラー:", error);
        Alert.alert("読み込みエラー", "取引項目を取得できませんでした。");
        return;
      }

      setCategories((data ?? []) as Category[]);
    } catch (error) {
      console.error("項目取得エラー:", error);
      Alert.alert("通信エラー", "取引項目を読み込めませんでした。");
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function resetForm() {
    setName("");
    setIcon("🧾");
    setEditingId(null);
  }

  async function saveCategory() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("項目名を入力してください");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("ログインが必要です", "ログインし直してください。");
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("transaction_categories")
          .update({
            name: trimmedName,
            icon,
          })
          .eq("id", editingId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("transaction_categories").insert({
          user_id: user.id,
          name: trimmedName,
          icon,
          transaction_type: type,
          sort_order: categories.length,
        });

        if (error) throw error;
      }

      resetForm();
      await loadCategories();

      Alert.alert("保存しました", "取引項目を保存しました。");
    } catch (error) {
      console.error("項目保存エラー:", error);
      Alert.alert(
        "保存できませんでした",
        "同じ名前の項目がないか、通信状態をご確認ください。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function editCategory(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setIcon(category.icon);
  }

  function deleteCategory(category: Category) {
    Alert.alert(
      "項目を削除しますか？",
      `「${category.name}」を項目一覧から削除します。過去の仕訳データは削除されません。`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: () => {
            void performDelete(category.id);
          },
        },
      ],
    );
  }

  async function performDelete(id: string) {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("ログインが必要です", "ログインし直してください。");
        return;
      }

      const { error } = await supabase
        .from("transaction_categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      if (editingId === id) resetForm();

      await loadCategories();
    } catch (error) {
      console.error("項目削除エラー:", error);
      Alert.alert("削除できませんでした", "通信状態をご確認ください。");
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader
        title="取引項目の管理"
        subtitle="よく使う収入・支出の項目を登録しましょう。"
      />

      <View style={styles.typeSelector}>
        {(["income", "expense"] as const).map((item) => {
          const selected = type === item;

          return (
            <Pressable
              key={item}
              onPress={() => {
                setType(item);
                resetForm();
              }}
              style={[styles.typeButton, selected && styles.typeButtonSelected]}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selected && styles.typeButtonTextSelected,
                ]}
              >
                {item === "expense" ? "支出・経費" : "収入・売上"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {editingId ? "項目を編集" : "新しい項目を追加"}
        </Text>

        <Text style={styles.label}>項目名</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="例：ガソリン代"
          maxLength={50}
          style={styles.input}
        />

        <Text style={styles.label}>アイコンを選択</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`アイコン ${item}`}
              accessibilityState={{ selected: icon === item }}
              onPress={() => setIcon(item)}
              style={[
                styles.iconButton,
                icon === item && styles.iconButtonSelected,
              ]}
            >
              <Text style={styles.iconText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => void saveCategory()}
          disabled={isSaving}
          style={[styles.primaryButton, isSaving && { opacity: 0.6 }]}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {editingId ? "変更を保存" : "項目を追加"}
            </Text>
          )}
        </Pressable>

        {editingId && (
          <Pressable onPress={resetForm} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>編集をキャンセル</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.cardTitle}>登録済みの項目</Text>

        {isLoading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 20 }} />
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>
            項目がありません。上のフォームから追加してください。
          </Text>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.categoryRow}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryIconText}>{category.icon}</Text>
              </View>

              <Text style={styles.categoryName}>{category.name}</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${category.name}を編集`}
                onPress={() => editCategory(category)}
                style={styles.actionButton}
              >
                <Ionicons name="pencil-outline" size={20} color="#2563EB" />
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${category.name}を削除`}
                onPress={() => deleteCategory(category)}
                style={styles.actionButton}
              >
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
              </Pressable>
            </View>
          ))
        )}

        <Pressable
          onPress={() => router.replace("/")}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>ホームに戻る</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
