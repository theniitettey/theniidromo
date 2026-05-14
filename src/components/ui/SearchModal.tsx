"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LuSearch, LuLoader, LuFileText, LuMessageSquare, LuBookOpen, LuArrowRight, LuClock } from "react-icons/lu";
import axios from "axios";
import type { SearchResult } from "@/app/api/search/route";
import { format } from "date-fns";

const TYPE_META: Record<SearchResult["type"], { label: string; icon: React.ElementType }> = {
  post:    { label: "Blog",    icon: LuFileText },
  thought: { label: "Thought", icon: LuMessageSquare },
  asore:   { label: "Asore",   icon: LuBookOpen },
};

function groupByType(results: SearchResult[]) {
  const order: SearchResult["type"][] = ["post", "thought", "asore"];
  const map = new Map<SearchResult["type"], SearchResult[]>();
  for (const r of results) {
    if (!map.has(r.type)) map.set(r.type, []);
    map.get(r.type)!.push(r);
  }
  return order.filter((t) => map.has(t)).map((t) => ({ type: t, items: map.get(t)! }));
}

// Flat index for keyboard navigation
function flatIndex(groups: ReturnType<typeof groupByType>, idx: number) {
  let i = 0;
  for (const g of groups) {
    for (const item of g.items) {
      if (i === idx) return item;
      i++;
    }
  }
  return null;
}

export function SearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    setOpen(false); setQuery(""); setResults([]); setSelected(0);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((v) => !v); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      if (query.trim().length < 2) { setResults([]); return; }
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data.results); setSelected(0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, open]);

  const navigate = useCallback((result: SearchResult) => {
    router.push(result.slug); close();
  }, [router, close]);

  const groups = groupByType(results);
  const totalResults = results.length;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((v) => Math.min(v + 1, totalResults - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
    if (e.key === "Enter") { const r = flatIndex(groups, selected); if (r) navigate(r); }
  };

  let flatIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-start sm:justify-center sm:pt-[12vh] sm:px-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="w-full sm:max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl shadow-black/25 dark:shadow-black/70 overflow-hidden"
            onKeyDown={onKeyDown}
          >
            {/* Mobile drag handle */}
            <div className="flex sm:hidden justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>

            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 sm:py-4 border-b border-zinc-100 dark:border-zinc-800">
              {loading
                ? <LuLoader size={17} className="text-zinc-400 shrink-0 animate-spin" />
                : <LuSearch size={17} className="text-zinc-400 shrink-0" />
              }
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts, thoughts, asore…"
                className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none"
              />
              <kbd className="text-[0.625rem] text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-mono shrink-0">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[52vh] sm:max-h-[420px] overflow-y-auto">
              {groups.length > 0 ? (
                <div className="py-2">
                  {groups.map(({ type, items }) => {
                    const meta = TYPE_META[type];
                    const Icon = meta.icon;
                    return (
                      <div key={type}>
                        {/* Group header */}
                        <div className="flex items-center gap-2 px-4 py-2 mt-1">
                          <Icon size={11} className="text-zinc-400 shrink-0" />
                          <span className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                            {meta.label}
                          </span>
                        </div>

                        {items.map((r) => {
                          const isSelected = flatIdx === selected;
                          const currentIdx = flatIdx++;
                          return (
                            <button
                              key={r.slug}
                              onClick={() => navigate(r)}
                              onMouseEnter={() => setSelected(currentIdx)}
                              className={`w-full text-left px-4 py-3 transition-colors border-l-2 ${
                                isSelected
                                  ? "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-800 dark:border-zinc-200"
                                  : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold leading-snug transition-colors ${
                                    isSelected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-700 dark:text-zinc-300"
                                  }`}>
                                    {r.title}
                                  </p>
                                  {r.description && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                                      {r.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="flex items-center gap-1 text-[0.625rem] text-zinc-400">
                                      <LuClock size={9} />
                                      {format(new Date(r.date), "MMM d, yyyy")}
                                    </span>
                                    {r.tags && r.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-[0.625rem] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <LuArrowRight
                                  size={14}
                                  className={`shrink-0 mt-0.5 transition-all ${
                                    isSelected ? "text-zinc-800 dark:text-zinc-200 translate-x-0.5" : "text-zinc-300 dark:text-zinc-600"
                                  }`}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ) : query.trim().length >= 2 && !loading ? (
                <div className="flex flex-col items-center gap-2 py-12">
                  <p className="text-sm font-medium text-zinc-500">No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-zinc-400">Try a different keyword or check spelling</p>
                </div>
              ) : query.trim().length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 py-10">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Search everything</p>
                  <p className="text-xs text-zinc-400">Posts · Thoughts · Asore</p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {totalResults > 0 && (
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[0.625rem] text-zinc-400 flex items-center gap-1.5">
                  <kbd className="border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="text-[0.625rem] text-zinc-400 flex items-center gap-1.5">
                  <kbd className="border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-mono">↵</kbd>
                  open
                </span>
                <span className="ml-auto text-[0.625rem] text-zinc-400">{totalResults} result{totalResults !== 1 ? "s" : ""}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useSearchModal() {
  const open = () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
  };
  return { open };
}
