import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/navbar.styles";

const menuItems = [
  { label: "ホーム", icon: "⌂", href: "/" as const },
  { label: "仕訳入力", icon: "＋", href: "/entry" as const },
  { label: "仕訳帳", icon: "▤", href: "/journal" as const },
  { label: "レポート", icon: "▥", href: "/reports" as const },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <View style={styles.navbar}>
      {menuItems.map((item) => {
        const active = pathname === item.href;

        return (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            onPress={() => router.push(item.href)}
            style={styles.navItem}
          >
            <Text style={[styles.navIcon, active && styles.activeText]}>
              {item.icon}
            </Text>

            <Text style={[styles.navLabel, active && styles.activeText]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
