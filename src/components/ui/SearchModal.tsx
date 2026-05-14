"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LuSearch, LuLoader, LuFileText, LuMessageSquare, LuBookOpen } from "react-icons/lu";
import axios from "axios";
import type { SearchResult } from "@/app/api/search/route";
import { format } from "date-fns";

const TYPE_META = {
  post:    { label: "Blog",    icon: LuFileText,      color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/40" },
  thought: { label: "Thought", icon: LuMessageSquare, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
  asore:   { label: "Asore",   icon: LuBookOpen,      color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/40" },
};

export function SearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => { setOpen(false); setQuery(""); setResults([]); setSelected(0); }, []);

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      if (query.trim().length < 2) { setResults([]); return; }
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data.results);
        setSelected(0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, open]);

  const navigate = (result: SearchResult) => {
    router.push(result.slug);
    close();
  };

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((v) => Math.min(v + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
    if (e.key === "Enter" && results[selected]) navigate(results[selected]);
  };

  return (
    <>
      {/* Trigger exposed via window event — see SearchTrigger */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
          >
            <motion.div
              key="search-panel"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl shadow-black/20 dark:shadow-black/60 overflow-hidden"
              onKeyDown={onKeyDown}
            >
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                {loading
                  ? <LuLoader size={16} className="text-zinc-400 shrink-0 animate-spin" />
                  : <LuSearch size={16} className="text-zinc-400 shrink-0" />
                }
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts, thoughts, asore…"
                  className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none"
                />
                <kbd className="text-[10px] text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-mono shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-1.5">
                    {results.map((r, i) => {
                      const meta = TYPE_META[r.type];
                      const Icon = meta.icon;
                      return (
                        <button
                          key={r.slug}
                          onClick={() => navigate(r)}
                          onMouseEnter={() => setSelected(i)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selected === i ? "bg-zinc-50 dark:bg-zinc-800/60" : ""
                          }`}
                        >
                          <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${meta.bg}`}>
                            <Icon size={13} className={meta.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{r.title}</p>
                            {r.description && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{r.description}</p>
                            )}
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
                              {meta.label}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {format(new Date(r.date), "MMM yyyy")}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : query.trim().length >= 2 && !loading ? (
                  <p className="text-center text-sm text-zinc-400 py-10">No results for &ldquo;{query}&rdquo;</p>
                ) : query.trim().length === 0 ? (
                  <p className="text-center text-xs text-zinc-400 py-8">Start typing to search…</p>
                ) : null}
              </div>

              {/* Footer hint */}
              {results.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <kbd className="border border-zinc-200 dark:border-zinc-700 rounded px-1 font-mono">↑↓</kbd> navigate
                  </span>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <kbd className="border border-zinc-200 dark:border-zinc-700 rounded px-1 font-mono">↵</kbd> open
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function useSearchModal() {
  const open = () => {
    const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
    document.dispatchEvent(event);
  };
  return { open };
}
