import { Text, View } from "react-native";

export default function ReportsScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "700" }}>会計レポート</Text>
      <Text style={{ marginTop: 8, color: "#64748B" }}>
        売上・経費・利益を確認する画面です。
      </Text>
    </View>
  );
}
