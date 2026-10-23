import { Pressable, Text, View } from "react-native";
import { styles } from "../../styles/entry.styles";

type TransactionType = "income" | "expense";

type Props = {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
};

export default function TransactionTypeSelector({ value, onChange }: Props) {
  return (
    <>
      <Text style={styles.label}>取引区分</Text>
      <View style={styles.typeRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: value === "income" }}
          onPress={() => onChange("income")}
          style={[styles.typeButton, value === "income" && styles.incomeSelected]}
        >
          <Text style={[styles.typeText, value === "income" && styles.selectedText]}>
            売上・収入
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: value === "expense" }}
          onPress={() => onChange("expense")}
          style={[styles.typeButton, value === "expense" && styles.expenseSelected]}
        >
          <Text style={[styles.typeText, value === "expense" && styles.selectedText]}>
            経費・支出
          </Text>
        </Pressable>
      </View>
    </>
  );
}
