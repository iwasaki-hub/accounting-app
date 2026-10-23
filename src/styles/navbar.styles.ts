import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: Platform.OS === "web" ? 0 : 1,
    borderBottomWidth: Platform.OS === "web" ? 1 : 0,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  navIcon: {
    fontSize: 22,
    color: "#64748B",
  },
  navLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  activeText: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
