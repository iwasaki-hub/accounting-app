import { Pressable, Text, View } from "react-native";
import { styles } from "../../styles/entry.styles";

type TransactionType = "income" | "expense";

type Props = {
  type: TransactionType;
  value: string;
  onChange: (value: string) => void;
};

const EXPENSE_OPTIONS = [
  "ガソリン代",
  "高速道路料金",
  "駐車場代",
  "車両整備費",
  "車両保険料",
  "通信費",
  "消耗品費",
  "その他",
];

const INCOME_OPTIONS = ["配達売上", "その他売上", "その他の収入"];

export default function TransactionDescriptionPicker({
  type,
  value,
  onChange,
}: Props) {
  const options = type === "expense" ? EXPENSE_OPTIONS : INCOME_OPTIONS;

  return (
    <>
      <Text style={styles.label}>取引内容</Text>
      <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>
        よく使う項目を選ぶか、下の欄に直接入力してください。
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 9,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: selected ? "#2563EB" : "#CBD5E1",
                backgroundColor: selected ? "#DBEAFE" : "#FFFFFF",
              }}
            >
              <Text
                style={{
                  color: selected ? "#1D4ED8" : "#334155",
                  fontSize: 13,
                  fontWeight: selected ? "700" : "500",
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
