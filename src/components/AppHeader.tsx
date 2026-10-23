import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function AppHeader({ title, subtitle }: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setIsLoggedIn(Boolean(session));
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active) {
          setIsLoggedIn(error ? false : Boolean(data.session));
        }
      })
      .catch(() => {
        if (active) {
          setIsLoggedIn(false);
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleAuthPress() {
    if (isLoggedIn === null || isLoggingOut) {
      return;
    }

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setIsLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("ログアウトに失敗しました", error.message);
        return;
      }

      router.replace("/");
    } catch {
      Alert.alert(
        "エラー",
        "ログアウトできませんでした。通信状態を確認してください。",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  const buttonLabel =
    isLoggedIn === null
      ? "確認中..."
      : isLoggingOut
        ? "ログアウト中..."
        : isLoggedIn
          ? "ログアウト"
          : "ログイン";

  return (
    <View
      style={{
        marginHorizontal: -24,
        paddingTop: Math.max(insets.top, 12) + 8,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: "#F5F7FB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#2563EB",
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          ACCOUNTING
        </Text>

        <Text
          style={{
            color: "#172033",
            fontSize: 26,
            fontWeight: "800",
          }}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={{
              color: "#718096",
              fontSize: 14,
              marginTop: 8,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
        disabled={isLoggedIn === null || isLoggingOut}
        onPress={handleAuthPress}
        style={{
          backgroundColor: "#2563EB",
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          opacity: isLoggedIn === null || isLoggingOut ? 0.7 : 1,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}
