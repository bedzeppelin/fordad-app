"use client";

import { useCallback, useEffect, useState } from "react";
import { localDateString } from "@/lib/format";
import BottomNav from "@/components/dad/BottomNav";
import HomeScreen from "@/components/dad/screens/HomeScreen";
import TodosScreen from "@/components/dad/screens/TodosScreen";
import CalendarScreen from "@/components/dad/screens/CalendarScreen";
import ReportsScreen from "@/components/dad/screens/ReportsScreen";
import VoiceNotesScreen from "@/components/dad/screens/VoiceNotesScreen";
import type { DadTodayData } from "@/lib/types";

export type { DadTodayData } from "@/lib/types";
export type DadScreen = "home" | "todos" | "calendar" | "reports" | "notes";

export default function CompanionApp() {
  const [screen, setScreen] = useState<DadScreen>("home");
  const [data, setData] = useState<DadTodayData | null>(null);

  const refetch = useCallback(async () => {
    const res = await fetch(`/api/dad/today?date=${localDateString()}`);
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  function changeScreen(s: DadScreen) {
    setScreen(s);
  }

  return (
    <div style={{ width: "100vw", height: "100dvh", position: "relative", overflow: "hidden", fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
      <HomeScreen active={screen === "home"} data={data} patientName={data?.patientName ?? "Dad"} onRefetch={refetch} onNavigate={changeScreen} />
      <TodosScreen active={screen === "todos"} data={data} onRefetch={refetch} />
      <CalendarScreen active={screen === "calendar"} />
      <ReportsScreen active={screen === "reports"} data={data} onRefetch={refetch} />
      <VoiceNotesScreen active={screen === "notes"} />
      <BottomNav screen={screen} onChange={changeScreen} />
    </div>
  );
}
