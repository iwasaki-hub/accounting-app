import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { styles } from "../styles/auth.styles";

export default function LoginScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage("メールアドレスとパスワードを入力してください。");
      return;
    }

    if (password.length < 8) {
      setMessage("パスワードは8文字以上にしてください。");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });

        if (error) {
          setMessage(`登録できませんでした：${error.message}`);
          return;
        }

        if (data.session) {
          router.replace("/");
          return;
        }

        setMessage(
          "登録リクエストを受け付けました。メールを確認し、認証リンクを開いてください。認証後、ログインしてください。",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          setMessage(`ログインできませんでした：${error.message}`);
          return;
        }

        router.replace("/");
      }
    } catch {
      setMessage(
        "通信に失敗しました。インターネット接続とSupabaseの設定を確認してください。",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "アカウント" }} />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.brand}>ACCOUNTING</Text>

          <Text style={styles.title}>
            {mode === "login" ? "ログイン" : "アカウント登録"}
          </Text>

          <Text style={styles.description}>
            {mode === "login"
              ? "登録したアカウントでログインしてください。"
              : "メールアドレスとパスワードで登録します。"}
          </Text>

          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          <Text style={styles.label}>パスワード（8文字以上）</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="パスワード"
            secureTextEntry
            autoCapitalize="none"
            textContentType={mode === "login" ? "password" : "newPassword"}
          />

          {message ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleAuth}
            style={[styles.primaryButton, loading && styles.disabledButton]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === "login" ? "ログイン" : "アカウントを登録"}
              </Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage("");
            }}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {mode === "login"
                ? "初めての方はこちら（新規登録）"
                : "すでにアカウントをお持ちの方（ログイン）"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/")}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>ダッシュボードへ戻る</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
