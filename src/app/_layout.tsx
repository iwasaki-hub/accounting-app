import { Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Supabaseのログイン状態を取得・監視
  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsAuthenticated(Boolean(session));
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active) {
          setIsAuthenticated(error ? false : Boolean(data.session));
        }
      })
      .catch(() => {
        if (active) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // ログインが必要な画面へのアクセスを制御
  useEffect(() => {
    if (isAuthenticated === null) {
      return;
    }

    const protectedRoutes = ["/entry", "/journal", "/reports"];

    if (!isAuthenticated && protectedRoutes.includes(pathname)) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/");
    }
  }, [isAuthenticated, pathname, router]);

  // 認証状態の確認中は画面遷移を行わない
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#64748B",
        tabBarActiveBackgroundColor: "transparent",

        tabBarItemStyle: {
          marginHorizontal: 3,
          marginVertical: 2,
          paddingTop: 2,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 8,
        },

        tabBarStyle: {
          height: 72 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: "#F1F5F9",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarLabel: "ホーム",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 56,
                height: 42,
                borderRadius: 21,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? "#DBEAFE" : "transparent",
              }}
            >
              <Ionicons name="home-outline" size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="entry"
        options={{
          title: "仕訳入力",
          tabBarLabel: "仕訳入力",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 56,
                height: 42,
                borderRadius: 21,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? "#DBEAFE" : "transparent",
              }}
            >
              <Ionicons name="add-circle-outline" size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: "仕訳帳",
          tabBarLabel: "仕訳帳",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 56,
                height: 42,
                borderRadius: 21,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? "#DBEAFE" : "transparent",
              }}
            >
              <Ionicons name="book-outline" size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "レポート",
          tabBarLabel: "レポート",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                width: 56,
                height: 42,
                borderRadius: 21,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? "#DBEAFE" : "transparent",
              }}
            >
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
