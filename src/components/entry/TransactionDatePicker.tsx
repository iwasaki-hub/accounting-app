import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "../../styles/entry.styles";

const MIN_YEAR = 2026;
const MAX_YEAR = 2030;
const YEARS = [2026, 2027, 2028, 2029, 2030];

type Props = {
  value: string;
  onChange: (value: string) => void;
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateString: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const parsedDate = new Date(year, month - 1, day);
    if (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    ) {
      return parsedDate;
    }
  }

  const today = new Date();
  const year = Math.min(MAX_YEAR, Math.max(MIN_YEAR, today.getFullYear()));
  return new Date(
    year,
    year === today.getFullYear() ? today.getMonth() : 0,
    year === today.getFullYear() ? today.getDate() : 1,
  );
}

export default function TransactionDatePicker({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(
    Math.min(MAX_YEAR, Math.max(MIN_YEAR, new Date().getFullYear())),
  );
  const [calendarMonth, setCalendarMonth] = useState(
    new Date().getFullYear() >= MIN_YEAR && new Date().getFullYear() <= MAX_YEAR
      ? new Date().getMonth()
      : 0,
  );

  function openPicker() {
    const selectedDate = parseDate(value);
    setCalendarYear(selectedDate.getFullYear());
    setCalendarMonth(selectedDate.getMonth());
    setVisible(true);
  }

  function changeMonth(offset: number) {
    const nextDate = new Date(calendarYear, calendarMonth + offset, 1);
    if (nextDate.getFullYear() < MIN_YEAR || nextDate.getFullYear() > MAX_YEAR) return;
    setCalendarYear(nextDate.getFullYear());
    setCalendarMonth(nextDate.getMonth());
  }

  function selectDate(day: number) {
    onChange(formatDate(new Date(calendarYear, calendarMonth, day)));
    setVisible(false);
  }

  const firstWeekday = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const calendarCells = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      key: `blank-${index}`,
      day: null as number | null,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      key: `day-${index + 1}`,
      day: index + 1,
    })),
  ];

  return (
    <>
      <Text style={styles.label}>取引日</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="取引日をカレンダーから選択"
        onPress={openPicker}
        style={[
          styles.input,
          { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
        ]}
      >
        <Text style={{ color: "#172033", fontSize: 16 }}>{value}</Text>
        <Text style={{ fontSize: 18 }}>📅</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View style={{ width: "100%", maxWidth: 420, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#172033", marginBottom: 18 }}>
              取引日を選択
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 4, marginBottom: 20 }}>
              {YEARS.map((year) => (
                <Pressable
                  key={year}
                  accessibilityRole="button"
                  accessibilityState={{ selected: calendarYear === year }}
                  onPress={() => setCalendarYear(year)}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    paddingVertical: 10,
                    borderRadius: 9,
                    backgroundColor: calendarYear === year ? "#2563EB" : "#F1F5F9",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: calendarYear === year ? "#FFFFFF" : "#334155" }}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="前の月"
                disabled={calendarYear === MIN_YEAR && calendarMonth === 0}
                onPress={() => changeMonth(-1)}
                style={{ padding: 10, opacity: calendarYear === MIN_YEAR && calendarMonth === 0 ? 0.3 : 1 }}
              >
                <Text style={{ fontSize: 20, color: "#2563EB" }}>‹</Text>
              </Pressable>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#172033" }}>
                {calendarYear}年 {calendarMonth + 1}月
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="次の月"
                disabled={calendarYear === MAX_YEAR && calendarMonth === 11}
                onPress={() => changeMonth(1)}
                style={{ padding: 10, opacity: calendarYear === MAX_YEAR && calendarMonth === 11 ? 0.3 : 1 }}
              >
                <Text style={{ fontSize: 20, color: "#2563EB" }}>›</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {["日", "月", "火", "水", "木", "金", "土"].map((weekday, index) => (
                <View key={weekday} style={{ width: "14.2857%", alignItems: "center", paddingVertical: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: index === 0 ? "#DC2626" : index === 6 ? "#2563EB" : "#64748B" }}>
                    {weekday}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {calendarCells.map((cell) => {
                if (cell.day === null) {
                  return <View key={cell.key} style={{ width: "14.2857%", height: 44 }} />;
                }
                const day = cell.day;
                const dayDate = formatDate(new Date(calendarYear, calendarMonth, day));
                const selected = value === dayDate;
                return (
                  <Pressable
                    key={cell.key}
                    accessibilityRole="button"
                    accessibilityLabel={`${calendarYear}年${calendarMonth + 1}月${day}日`}
                    accessibilityState={{ selected }}
                    onPress={() => selectDate(day)}
                    style={{ width: "14.2857%", height: 44, alignItems: "center", justifyContent: "center" }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
                      backgroundColor: selected ? "#2563EB" : "transparent",
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: selected ? "800" : "500", color: selected ? "#FFFFFF" : "#172033" }}>
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setVisible(false)}
              style={{ marginTop: 20, paddingVertical: 13, alignItems: "center", borderRadius: 10, backgroundColor: "#F1F5F9" }}
            >
              <Text style={{ fontWeight: "700", color: "#334155" }}>キャンセル</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
