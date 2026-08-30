"use client";

import { useEffect, useState } from "react";
import { BilingualText } from "@/components/Bilingual";

export type DayPart = "morning" | "noon" | "evening" | "midnight";

export function getDayPart(hour: number): DayPart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "noon";
  if (hour >= 17 && hour < 24) return "evening";
  return "midnight";
}

function useLocalDayPart() {
  const [dayPart, setDayPart] = useState<DayPart | null>(null);

  useEffect(() => {
    const update = () => setDayPart(getDayPart(new Date().getHours()));
    update();

    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return dayPart;
}

export function TimeOfDayTheme() {
  const dayPart = useLocalDayPart();

  useEffect(() => {
    if (!dayPart) return;

    const now = new Date();
    document.documentElement.dataset.daypart = dayPart;
    document.documentElement.dataset.localHour = String(now.getHours()).padStart(2, "0");
  }, [dayPart]);

  return null;
}

const GREETINGS: Record<DayPart, { en: string; zh: string; label: string }> = {
  morning: {
    en: "Good morning. Let us uncover what hides beneath the surface.",
    zh: "早安，今天也一起拆解藏在表面之下的真相。",
    label: "MORNING / 早晨",
  },
  noon: {
    en: "Good afternoon. Keep your signal clear and your judgment sharp.",
    zh: "午安，願你的訊號清晰，判斷始終銳利。",
    label: "NOON / 中午",
  },
  evening: {
    en: "Good evening. The archive is still open for another trace.",
    zh: "晚上好，檔案庫仍為下一道線索保持開放。",
    label: "EVENING / 晚上",
  },
  midnight: {
    en: "Good late night. One audit light remains on for you.",
    zh: "凌晨好，這裡仍為你留著一盞審計燈。",
    label: "MIDNIGHT / 凌晨",
  },
};

export function LocalTimeGreeting() {
  const dayPart = useLocalDayPart();
  if (!dayPart) return null;

  const greeting = GREETINGS[dayPart];

  return (
    <div className={`time-greeting time-greeting-${dayPart}`} aria-live="polite">
      <span className="time-greeting-label">{greeting.label}</span>
      <BilingualText en={greeting.en} zh={greeting.zh} />
    </div>
  );
}
