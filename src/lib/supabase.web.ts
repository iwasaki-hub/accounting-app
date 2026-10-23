import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabaseの環境変数が設定されていません。.envを確認してください。",
  );
}

const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: webStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
