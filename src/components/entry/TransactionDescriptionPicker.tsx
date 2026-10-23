import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { supabase } from "../../lib/supabase";
import { styles } from "../../styles/entry.styles";

type TransactionType = "income" | "expense";

type Category = {
  id: string;
  name: string;
  icon: string;
};

type Props = {
  type: TransactionType;
  value: string;
  onChange: (value: string) => void;
};

export default function TransactionDescriptionPicker({
  type,
  value,
  onChange,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setCategories([]);
        setLoadError(true);
        return;
      }

      const { data, error } = await supabase
        .from("transaction_categories")
        .select("id, name, icon")
        .eq("user_id", user.id)
        .eq("transaction_type", type)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("取引項目の取得エラー:", error);
        setCategories([]);
        setLoadError(true);
        return;
      }

      setCategories((data ?? []) as Category[]);
    } catch (error) {
      console.error("取引項目の取得エラー:", error);
      setCategories([]);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  // 仕訳入力画面に戻るたびに最新の項目を取得する
  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories]),
  );

  return (
    <>
      <Text style={styles.label}>取引内容</Text>

      <Text
        style={{
          color: "#64748B",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        よく使う項目を選択できます。直接入力することもできます。
      </Text>

      {isLoading ? (
        <ActivityIndicator color="#2563EB" style={{ marginVertical: 16 }} />
      ) : loadError ? (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: "#DC2626", fontSize: 13 }}>
            取引項目を読み込めませんでした。
          </Text>

          <Pressable
            onPress={() => void loadCategories()}
            style={{
              paddingVertical: 10,
              alignSelf: "flex-start",
            }}
          >
            <Text
              style={{
                color: "#2563EB",
                fontWeight: "700",
              }}
            >
              再読み込み
            </Text>
          </Pressable>
        </View>
      ) : categories.length === 0 ? (
        <Text
          style={{
            color: "#64748B",
            fontSize: 13,
            marginBottom: 12,
            lineHeight: 20,
          }}
        >
          まだ項目がありません。「取引項目の管理」から追加してください。
        </Text>
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {categories.map((category) => {
            const selected = value === category.name;

            return (
              <Pressable
                key={category.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => onChange(category.name)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: selected ? "#2563EB" : "#CBD5E1",
                  backgroundColor: selected ? "#DBEAFE" : "#FFFFFF",
                }}
              >
                <Text style={{ fontSize: 16 }}>{category.icon}</Text>

                <Text
                  style={{
                    color: selected ? "#1D4ED8" : "#334155",
                    fontSize: 13,
                    fontWeight: selected ? "700" : "500",
                  }}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </>
  );
}
