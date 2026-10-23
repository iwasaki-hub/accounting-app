import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import AppHeader from "../components/AppHeader";
import TransactionDatePicker from "../components/entry/TransactionDatePicker";
import TransactionDescriptionPicker from "../components/entry/TransactionDescriptionPicker";
import TransactionTypeSelector from "../components/entry/TransactionTypeSelector";
import { useTransactionForm } from "../hooks/useTransactionForm";
import { styles } from "../styles/entry.styles";

export default function EntryScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);
  const amountFocusedRef = useRef(false);
  const keyboardVisibleRef = useRef(false);

  const {
    type,
    setType,
    date,
    setDate,
    title,
    setTitle,
    amount,
    setAmount,
    isSaving,
    saveTransaction,
  } = useTransactionForm();

  // キーボードの表示・非表示を監視
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      keyboardVisibleRef.current = true;

      if (amountFocusedRef.current) {
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        });
      }
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      keyboardVisibleRef.current = false;
      amountFocusedRef.current = false;
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 金額欄にフォーカスしたら入力欄と保存ボタンを表示
  function handleAmountFocus() {
    amountFocusedRef.current = true;

    setTimeout(() => {
      if (amountFocusedRef.current) {
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        });
      }
    }, 150);
  }

  function handleAmountBlur() {
    amountFocusedRef.current = false;
  }

  // 画面を指でスクロールし始めたらキーボードを閉じる
  function handleScrollBeginDrag() {
    if (keyboardVisibleRef.current) {
      Keyboard.dismiss();
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        onScrollBeginDrag={handleScrollBeginDrag}
        scrollEventThrottle={16}
      >
        <AppHeader
          title="仕訳入力"
          subtitle="日々の売上や経費を記録しましょう。"
        />

        <View style={styles.formCard}>
          <TransactionTypeSelector value={type} onChange={setType} />

          <TransactionDatePicker value={date} onChange={setDate} />

          <TransactionDescriptionPicker
            type={type}
            value={title}
            onChange={setTitle}
          />

          <TextInput
            ref={titleInputRef}
            value={title}
            onChangeText={setTitle}
            placeholder="取引内容を入力（例：ガソリン代）"
            style={styles.input}
            maxLength={100}
          />

          <Text style={styles.label}>金額（円）</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="例：5000"
            style={styles.input}
            keyboardType="numeric"
            onFocus={handleAmountFocus}
            onBlur={handleAmountBlur}
            inputAccessoryViewID="amountDoneAccessory"
          />

          {Platform.OS === "ios" && (
            <InputAccessoryView nativeID="amountDoneAccessory">
              <View
                style={{
                  backgroundColor: "#F1F5F9",
                  borderTopWidth: 1,
                  borderTopColor: "#CBD5E1",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  alignItems: "flex-end",
                }}
              >
                <Pressable
                  onPress={() => Keyboard.dismiss()}
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#2563EB",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
            </InputAccessoryView>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              saveTransaction(() => {
                titleInputRef.current?.focus();
              })
            }
            disabled={isSaving}
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Supabaseに保存する</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
