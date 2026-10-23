import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  brand: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: "#172033",
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  description: {
    color: "#718096",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
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
  message: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 4,
  },
  primaryButton: {
    minHeight: 48,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    padding: 12,
  },
  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  backButton: {
    alignItems: "center",
    padding: 10,
  },
  backButtonText: {
    color: "#64748B",
    fontSize: 13,
  },
});
