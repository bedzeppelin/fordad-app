"use client";

import { useEffect, useRef, useState } from "react";
import { formatDateTimeShort } from "@/lib/format";
import { MicIconLarge, XSmallIcon } from "@/components/dad/icons";
import type { DadVoiceNote } from "@/lib/types";

// Web Speech API isn't in TS's default lib.dom types under its standard name.
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
};

export default function VoiceNotesScreen({ active }: { active: boolean }) {
  const [notes, setNotes] = useState<DadVoiceNote[] | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micPressed, setMicPressed] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    fetch("/api/dad/voice-notes")
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []))
      .catch(() => setNotes([]));
    return () => recognitionRef.current?.abort();
  }, []);

  function startRecording() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSpeechError("Needs Chrome or Safari");
      return;
    }
    const recognition: SpeechRecognitionLike = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;
    setIsRecording(true);
    setSpeechError(null);
    setInterimTranscript("");
    setFinalTranscript("");

    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) setFinalTranscript((prev) => prev + t + " ");
        else interim += t;
      }
      setInterimTranscript(interim);
    };
    recognition.onerror = (e: any) => {
      if (e.error !== "aborted") {
        setSpeechError("Could not access microphone");
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };
    // Don't restart on end — that's what was causing words to repeat at
    // the boundary between sessions. Let continuous:true keep the mic
    // open naturally; if Chrome stops due to long silence, Dad taps again.
    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };
    recognition.start();
  }

  function stopRecording() {
    setIsRecording(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }

  function toggleRecording() {
    isRecording ? stopRecording() : startRecording();
  }

  const fullTranscript = (finalTranscript + interimTranscript).trim();

  async function saveNote() {
    if (!fullTranscript || saving) return;
    setSaving(true);
    const res = await fetch("/api/dad/voice-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw_transcript: fullTranscript }),
    });
    if (res.ok) {
      const { note } = await res.json();
      setNotes((prev) => [note, ...(prev ?? [])]);
      setFinalTranscript("");
      setInterimTranscript("");
    }
    setSaving(false);
  }

  function discardNote() {
    setFinalTranscript("");
    setInterimTranscript("");
  }

  async function deleteNote(id: string) {
    if (!confirm("Delete this voice note?")) return;
    setNotes((prev) => (prev ?? []).filter((n) => n.id !== id));
    await fetch(`/api/dad/voice-notes/${id}`, { method: "DELETE" });
  }

  async function shareNote(note: DadVoiceNote) {
    const text = note.summary_bullets.join("\n");
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback(note.id);
      setTimeout(() => setShareFeedback(null), 1500);
    } catch {
      // clipboard unavailable; nothing more we can do
    }
  }

  const hasTranscript = fullTranscript.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: active ? 1 : 0,
        pointerEvents: active ? "auto" : "none",
        visibility: active ? "visible" : "hidden",
      }}
    >
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(168deg,#EDE8DF 0%,#E4DCCE 100%)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "max(26px, env(safe-area-inset-top)) 22px 14px", flexShrink: 0, borderBottom: "1px solid rgba(200,190,180,0.25)" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1814", margin: 0, letterSpacing: -0.4 }}>Voice Notes</h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "22px 18px max(88px, calc(env(safe-area-inset-bottom) + 72px))" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, paddingBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: isRecording ? "#A84848" : "#AFA89F", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 22px" }}>
              {isRecording ? "Listening..." : speechError || "Tap to begin recording"}
            </p>
            <button
              onClick={toggleRecording}
              onMouseDown={() => setMicPressed(true)}
              onMouseUp={() => setMicPressed(false)}
              onMouseLeave={() => setMicPressed(false)}
              onTouchStart={() => setMicPressed(true)}
              onTouchEnd={() => setMicPressed(false)}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: isRecording ? "linear-gradient(145deg,#A84848 0%,#8C3232 100%)" : micPressed ? "linear-gradient(145deg,#1E3870 0%,#192E60 100%)" : "linear-gradient(145deg,#2B4D8C 0%,#1E3264 100%)",
                boxShadow: isRecording ? "0 8px 32px rgba(168,72,72,0.28)" : "0 8px 32px rgba(43,77,140,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: isRecording ? "micPulse 1.8s ease-in-out infinite" : "none",
                transform: micPressed ? "scale(0.95)" : "scale(1)",
                flexShrink: 0,
              }}
            >
              <MicIconLarge />
            </button>
            <div style={{ height: 32, marginTop: 18 }} />
            <p style={{ fontSize: 13, color: "#C2BBB2", margin: "6px 0 0", textAlign: "center", minHeight: 18 }}>
              {isRecording ? "Tap again to stop" : ""}
            </p>
          </div>

          <div style={{ background: "#FFF", borderRadius: 22, boxShadow: "0 2px 8px rgba(20,14,8,0.06),0 10px 28px rgba(20,14,8,0.08)", padding: "18px 20px", marginBottom: 12, minHeight: 88 }}>
            {hasTranscript ? (
              <p style={{ fontSize: 16, color: "#1C1814", lineHeight: 1.65, margin: 0 }}>{fullTranscript}</p>
            ) : (
              <p style={{ fontSize: 16, color: "#D0C9C0", lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>Your words will appear here as you speak...</p>
            )}
          </div>

          {hasTranscript && (
            <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
              <button
                onClick={saveNote}
                disabled={saving}
                style={{ flex: 1, height: 52, borderRadius: 16, background: "linear-gradient(152deg,#2B4D8C 0%,#1E3264 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(43,77,140,0.24)", opacity: saving ? 0.7 : 1 }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: "white" }}>{saving ? "Saving…" : "Save note"}</span>
              </button>
              <button onClick={discardNote} aria-label="Discard" style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(28,24,20,0.07)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <XSmallIcon color="#AFA89F" />
              </button>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#AFA89F", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>Saved notes</p>
            <span style={{ fontSize: 12, color: "#C2BBB2" }}>{notes && notes.length > 0 ? notes.length : ""}</span>
          </div>

          {notes === null ? (
            <p style={{ fontSize: 13.5, color: "#C2BBB2" }}>Loading…</p>
          ) : notes.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <p style={{ fontSize: 14.5, color: "#C2BBB2", lineHeight: 1.6, margin: 0 }}>Record something and tap Save — it&apos;ll appear here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {notes.map((note) => {
                const { date, time } = formatDateTimeShort(note.recorded_at);
                const expanded = expandedId === note.id;
                const firstLine = note.summary_bullets[0] || "(no summary)";
                return (
                  <div key={note.id} style={{ background: "#FFF", borderRadius: 18, padding: "14px 16px", boxShadow: "0 1px 4px rgba(20,14,8,0.05),0 6px 16px rgba(20,14,8,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button onClick={() => setExpandedId(expanded ? null : note.id)} style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <p style={{ fontSize: 11, fontWeight: 500, color: "#C2BBB2", letterSpacing: 0.3, margin: "0 0 3px" }}>
                          {date} · {time}
                        </p>
                        <p
                          style={{
                            fontSize: 14.5,
                            color: "#3A3430",
                            lineHeight: 1.5,
                            margin: 0,
                            overflow: expanded ? "visible" : "hidden",
                            textOverflow: expanded ? "clip" : "ellipsis",
                            whiteSpace: expanded ? "normal" : "nowrap",
                          }}
                        >
                          {firstLine}
                        </p>
                      </button>
                      <button onClick={() => deleteNote(note.id)} aria-label="Delete" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "rgba(28,24,20,0.06)", flexShrink: 0 }}>
                        <XSmallIcon />
                      </button>
                    </div>
                    {expanded && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(200,190,180,0.3)" }}>
                        {note.summary_bullets.length > 1 && (
                          <ul style={{ margin: "0 0 10px", padding: "0 0 0 18px" }}>
                            {note.summary_bullets.slice(1).map((b, i) => (
                              <li key={i} style={{ fontSize: 13.5, color: "#3A3430", lineHeight: 1.55 }}>
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                        <button onClick={() => shareNote(note)} style={{ fontSize: 13, fontWeight: 600, color: "#2B4D8C" }}>
                          {shareFeedback === note.id ? "Copied" : "Share"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
