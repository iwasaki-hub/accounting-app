import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  pageTitle: {
    color: "#172033",
    fontSize: 28,
    fontWeight: "800",
  },
  description: {
    color: "#718096",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    padding: 20,
    gap: 12,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
  },
  incomeSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#2563EB",
  },
  expenseSelected: {
    backgroundColor: "#FFEDD5",
    borderColor: "#EA580C",
  },
  typeText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  selectedText: {
    color: "#172033",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#172033",
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
    padding: 16,
    marginTop: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  backButton: {
    alignItems: "center",
    padding: 12,
  },
  backButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});
