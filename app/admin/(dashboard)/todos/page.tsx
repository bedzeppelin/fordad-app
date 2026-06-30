"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/colors";
import { formatTime } from "@/lib/format";
import { TodoIcon, PlusIcon, EditIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from "@/components/icons";
import TodoModal from "@/components/admin/TodoModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Todo } from "@/lib/types";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; todo: Todo | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Todo | null>(null);
  const [reordering, setReordering] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/todos");
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(todo: Todo) {
    setModal(null);
    setTodos((prev) => {
      const exists = prev.some((t) => t.id === todo.id);
      return exists ? prev.map((t) => (t.id === todo.id ? todo : t)) : [...prev, todo].sort((a, b) => a.sort_order - b.sort_order);
    });
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/admin/todos/${id}`, { method: "DELETE" });
  }

  async function move(todo: Todo, direction: "up" | "down") {
    if (reordering) return;
    setReordering(true);
    const idx = todos.findIndex((t) => t.id === todo.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx >= 0 && swapIdx < todos.length) {
      const next = [...todos];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      setTodos(next);
    }
    await fetch("/api/admin/todos/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: todo.id, direction }),
    });
    setReordering(false);
  }

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, margin: "0 0 3px", letterSpacing: -0.5 }}>Daily Todos</h1>
          <p style={{ fontSize: 13, color: COLORS.inkFaint, margin: 0 }}>What Dad sees each morning, in order</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add", todo: null })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            background: COLORS.blueGradient,
            borderRadius: 12,
            boxShadow: "0 3px 12px rgba(43,77,140,0.22)",
            flexShrink: 0,
          }}
        >
          <PlusIcon />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#FFF", whiteSpace: "nowrap" }}>Add todo</span>
        </button>
      </div>

      {loading ? (
        <p style={{ fontSize: 13.5, color: COLORS.inkFaint }}>Loading…</p>
      ) : todos.length === 0 ? (
        <div style={{ background: COLORS.card, borderRadius: 14, padding: "30px 20px", textAlign: "center", border: `1.5px dashed ${COLORS.border}` }}>
          <p style={{ fontSize: 13.5, color: COLORS.inkFainter, margin: 0, lineHeight: 1.65 }}>
            No todos yet. Add the first task for the day.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {todos.map((todo, i) => (
            <div
              key={todo.id}
              style={{
                background: COLORS.card,
                borderRadius: 15,
                padding: "12px 13px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 1px 2px rgba(20,14,8,0.03),0 3px 10px rgba(20,14,8,0.06)",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: COLORS.blueBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <TodoIcon iconKey={todo.icon} color={COLORS.blue} size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    color: COLORS.ink,
                    margin: 0,
                    lineHeight: 1.25,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {todo.short_title || todo.title.replace(/\n/g, " ")}
                </p>
                <p style={{ fontSize: 12, color: COLORS.inkFaint, margin: "2px 0 0" }}>{todo.category_label}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.blue,
                    background: COLORS.blueBg,
                    padding: "4px 10px",
                    borderRadius: 7,
                  }}
                >
                  {formatTime(todo.scheduled_time)}
                </span>
                <button
                  onClick={() => move(todo, "up")}
                  disabled={i === 0}
                  aria-label="Move up"
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 8,
                    background: COLORS.neutralBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: i === 0 ? 0.4 : 1,
                  }}
                >
                  <ChevronUpIcon />
                </button>
                <button
                  onClick={() => move(todo, "down")}
                  disabled={i === todos.length - 1}
                  aria-label="Move down"
                  style={{
                    width: 29,
                    height: 29,
                    borderRadius: 8,
                    background: COLORS.neutralBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: i === todos.length - 1 ? 0.4 : 1,
                  }}
                >
                  <ChevronDownIcon />
                </button>
                <button
                  onClick={() => setModal({ mode: "edit", todo })}
                  aria-label="Edit"
                  style={{ width: 29, height: 29, borderRadius: 8, background: COLORS.neutralBg, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => setPendingDelete(todo)}
                  aria-label="Delete"
                  style={{ width: 29, height: 29, borderRadius: 8, background: COLORS.redBg, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TodoModal mode={modal.mode} initial={modal.todo} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this todo?"
          message={`"${pendingDelete.short_title || pendingDelete.title.replace(/\n/g, " ")}" will no longer appear in the app. Past completions stay on record.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
