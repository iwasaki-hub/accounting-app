import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  content: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",
    borderRadius: 16,
    padding: 10,
    marginBottom: 20,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonText: {
    color: "#1D4ED8",
    fontSize: 30,
    fontWeight: "600",
    lineHeight: 34,
  },
  disabledButton: {
    opacity: 0.35,
  },
  monthTitle: {
    color: "#172033",
    fontSize: 19,
    fontWeight: "800",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    padding: 22,
    marginBottom: 28,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#172033",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionDescription: {
    color: "#718096",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 18,
  },
  summaryItem: {
    gap: 8,
  },
  summaryLabel: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  summaryAmount: {
    fontSize: 25,
    fontWeight: "800",
  },
  incomeText: {
    color: "#059669",
  },
  expenseText: {
    color: "#DC2626",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 18,
  },
  profitCard: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 18,
    marginTop: 2,
  },
  profitLabel: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  profitAmount: {
    color: "#0F766E",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8,
  },
  negativeProfit: {
    color: "#DC2626",
  },
  profitNote: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 8,
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",
    borderRadius: 16,
    padding: 18,
    gap: 24,
  },
  breakdownItem: {
    gap: 10,
  },
  breakdownHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  breakdownLabel: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
  breakdownAmount: {
    color: "#172033",
    fontSize: 14,
    fontWeight: "800",
  },
  barBackground: {
    height: 10,
    width: "100%",
    borderRadius: 5,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#EA580C",
  },
  breakdownPercentage: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "right",
  },
  countCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",
    borderRadius: 16,
    padding: 20,
  },
  countItem: {
    gap: 8,
  },
  countLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  countValue: {
    color: "#172033",
    fontSize: 22,
    fontWeight: "800",
  },
  messageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  messageText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyTitle: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "700",
  },
  footerNote: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 4,
  },
});
