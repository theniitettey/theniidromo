"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSearch, LuLoader, LuFileText, LuMessageSquare, LuBookOpen,
  LuArrowRight, LuClock, LuWarehouse, LuBook, LuFileUser,
  LuRss, LuExternalLink, LuSun, LuMoon, LuGithub, LuTwitter, LuLinkedin,
} from "react-icons/lu";
import axios from "axios";
import type { SearchResult } from "@/app/api/search/route";
import { format } from "date-fns";
import { person } from "@/data/person";

// ── static commands ──────────────────────────────────────────────────────────

type NavCommand = { label: string; slug: string; icon: React.ElementType; group: string };
type ExtCommand = { label: string; href: string; icon: React.ElementType; group: string };
type ActionCommand = { label: string; action: () => void; icon: React.ElementType; group: string };
type AnyCommand = NavCommand | ExtCommand | ActionCommand;

const NAV_COMMANDS: NavCommand[] = [
  { label: "Home",      slug: "/",          icon: LuWarehouse,   group: "navigate" },
  { label: "Blog",      slug: "/blog",       icon: LuFileText,    group: "navigate" },
  { label: "Thoughts",  slug: "/thoughts",   icon: LuMessageSquare, group: "navigate" },
  { label: "Asore",     slug: "/asore",      icon: LuBookOpen,    group: "navigate" },
  { label: "Guestbook", slug: "/guestbook",  icon: LuBook,        group: "navigate" },
  { label: "Resume",    slug: "/resume",     icon: LuFileUser,    group: "navigate" },
  { label: "RSS Feed",  slug: "/rss.xml",    icon: LuRss,         group: "navigate" },
];

const SOCIAL_COMMANDS: ExtCommand[] = [
  { label: "Twitter / X", href: person.social.twitter,  icon: LuTwitter,  group: "connect" },
  { label: "GitHub",       href: person.social.github,   icon: LuGithub,   group: "connect" },
  { label: "LinkedIn",     href: person.social.linkedin, icon: LuLinkedin, group: "connect" },
];

const GROUP_LABELS: Record<string, string> = {
  navigate: "navigate",
  connect:  "connect",
};

// ── search result meta ───────────────────────────────────────────────────────

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

// ── component ────────────────────────────────────────────────────────────────

export function SearchModal() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const themeCommand: ActionCommand = {
    label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    action: () => { setTheme(theme === "dark" ? "light" : "dark"); close(); },
    icon: theme === "dark" ? LuSun : LuMoon,
    group: "actions",
  };

  const allCommands: AnyCommand[] = [...NAV_COMMANDS, ...SOCIAL_COMMANDS, themeCommand];
  const commandGroups = Object.entries(
    allCommands.reduce<Record<string, AnyCommand[]>>((acc, cmd) => {
      if (!acc[cmd.group]) acc[cmd.group] = [];
      acc[cmd.group].push(cmd);
      return acc;
    }, {})
  );

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

  const navigateToResult = useCallback((result: SearchResult) => {
    router.push(result.slug); close();
  }, [router, close]);

  const runCommand = useCallback((cmd: AnyCommand) => {
    if ("action" in cmd) { cmd.action(); return; }
    if ("href" in cmd) { window.open(cmd.href, "_blank", "noopener"); close(); return; }
    if ("slug" in cmd) { router.push(cmd.slug); close(); }
  }, [router, close]);

  const isSearching = query.trim().length >= 2;
  const groups = groupByType(results);
  const totalResults = results.length;
  const totalCommands = allCommands.length;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { close(); return; }
    const max = isSearching ? totalResults : totalCommands;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((v) => Math.min(v + 1, max - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)); }
    if (e.key === "Enter") {
      if (isSearching) {
        const r = flatIndex(groups, selected);
        if (r) navigateToResult(r);
      } else {
        const cmd = allCommands[selected];
        if (cmd) runCommand(cmd);
      }
    }
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
                onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
                placeholder="search or jump to..."
                className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none"
              />
              <kbd className="text-[0.625rem] text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-mono shrink-0">ESC</kbd>
            </div>

            {/* Body */}
            <div className="max-h-[52vh] sm:max-h-[420px] overflow-y-auto">
              {isSearching ? (
                /* ── search results ── */
                groups.length > 0 ? (
                  <div className="py-2">
                    {groups.map(({ type, items }) => {
                      const meta = TYPE_META[type];
                      const Icon = meta.icon;
                      return (
                        <div key={type}>
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
                                onClick={() => navigateToResult(r)}
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
                                      {r.tags?.slice(0, 3).map((tag) => (
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
                ) : !loading ? (
                  <div className="flex flex-col items-center gap-2 py-12">
                    <p className="text-sm font-medium text-zinc-500">no results for &ldquo;{query}&rdquo;</p>
                    <p className="text-xs text-zinc-400">try a different keyword</p>
                  </div>
                ) : null
              ) : (
                /* ── command palette (empty state) ── */
                <div className="py-2">
                  {commandGroups.map(([group, cmds]) => (
                    <div key={group}>
                      <div className="px-4 py-2 mt-1">
                        <span className="text-[0.625rem] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                          {GROUP_LABELS[group] ?? group}
                        </span>
                      </div>
                      {cmds.map((cmd) => {
                        const isSelected = flatIdx === selected;
                        const currentIdx = flatIdx++;
                        const Icon = cmd.icon;
                        const isExternal = "href" in cmd;
                        return (
                          <button
                            key={cmd.label}
                            onClick={() => runCommand(cmd)}
                            onMouseEnter={() => setSelected(currentIdx)}
                            className={`w-full text-left px-4 py-2.5 transition-colors border-l-2 flex items-center justify-between gap-3 ${
                              isSelected
                                ? "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-800 dark:border-zinc-200"
                                : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={14} className={isSelected ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"} />
                              <span className={`text-sm transition-colors ${
                                isSelected ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                              }`}>
                                {cmd.label}
                              </span>
                            </div>
                            {isExternal && (
                              <LuExternalLink size={12} className="text-zinc-300 dark:text-zinc-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[0.625rem] text-zinc-400 flex items-center gap-1.5">
                <kbd className="border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-mono">↑↓</kbd>
                navigate
              </span>
              <span className="text-[0.625rem] text-zinc-400 flex items-center gap-1.5">
                <kbd className="border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 font-mono">↵</kbd>
                open
              </span>
              {isSearching && totalResults > 0 && (
                <span className="ml-auto text-[0.625rem] text-zinc-400">{totalResults} result{totalResults !== 1 ? "s" : ""}</span>
              )}
            </div>
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
