import React from "react";
import Link from "next/link";
import { FiInfo, FiZap, FiAlertTriangle, FiAlertOctagon } from "react-icons/fi";
import { Spoiler } from "./ui/Spoiler";

// ─── Types ────────────────────────────────────────────────────────────────────

type CalloutType = "info" | "warning" | "tip" | "danger";

// ─── Callout ──────────────────────────────────────────────────────────────────

const calloutConfig: Record<
  CalloutType,
  {
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    bg: string;
    labelColor: string;
    iconBg: string;
    line: string;
  }
> = {
  info: {
    label: "Note",
    Icon: FiInfo,
    bg: "bg-blue-50/70 dark:bg-blue-950/25",
    labelColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-400 dark:bg-blue-500",
    line: "bg-blue-200 dark:bg-blue-800",
  },
  warning: {
    label: "Warning",
    Icon: FiAlertTriangle,
    bg: "bg-amber-50/70 dark:bg-amber-950/25",
    labelColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-400 dark:bg-amber-500",
    line: "bg-amber-200 dark:bg-amber-800",
  },
  tip: {
    label: "Tip",
    Icon: FiZap,
    bg: "bg-emerald-50/70 dark:bg-emerald-950/25",
    labelColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-400 dark:bg-emerald-500",
    line: "bg-emerald-200 dark:bg-emerald-800",
  },
  danger: {
    label: "Caution",
    Icon: FiAlertOctagon,
    bg: "bg-red-50/70 dark:bg-red-950/25",
    labelColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-400 dark:bg-red-500",
    line: "bg-red-200 dark:bg-red-800",
  },
};

const alertTypeMap: Record<string, CalloutType> = {
  NOTE: "info",
  TIP: "tip",
  WARNING: "warning",
  CAUTION: "danger",
  IMPORTANT: "warning",
};

export const Callout = ({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: CalloutType;
}) => {
  const { label, Icon, bg, labelColor, iconBg, line } = calloutConfig[type];
  return (
    <div className="my-6 not-prose flex gap-3">
      {/* Left column: circle icon + vertical line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-6 h-6 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon size={11} className="text-white" />
        </div>
        <div className={`w-px flex-1 mt-1.5 ${line}`} />
      </div>
      {/* Content */}
      <div className={`flex-1 min-w-0 ${bg} rounded-lg px-4 pt-2.5 pb-4`}>
        <p
          className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${labelColor}`}
        >
          {label}
        </p>
        <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [&>p]:m-0 [&>p:not(:last-child)]:mb-2">
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── Quote / PullQuote ────────────────────────────────────────────────────────

export const Quote = ({
  children,
  author,
}: {
  children: React.ReactNode;
  author?: string;
}) => (
  <figure className="my-8 not-prose">
    <blockquote className="relative pl-5 text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed [&>p]:m-0 [&>p:not(:last-child)]:mb-1 before:content-[''] before:absolute before:left-0 before:top-0.5 before:bottom-0.5 before:w-[3px] before:rounded-full before:bg-zinc-200 dark:before:bg-zinc-700">
      {children}
    </blockquote>
    {author && (
      <figcaption className="mt-3 pl-5 text-xs text-zinc-400 dark:text-zinc-500">
        — {author}
      </figcaption>
    )}
  </figure>
);

export const PullQuote = ({ children }: { children: React.ReactNode }) => (
  <aside className="my-10 not-prose text-center px-2">
    <p className="text-lg font-medium italic text-zinc-700 dark:text-zinc-300 leading-relaxed">
      {children}
    </p>
  </aside>
);

// ─── Definition ───────────────────────────────────────────────────────────────

export const Definition = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="my-6 not-prose rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700/50">
    <div className="bg-zinc-100/80 dark:bg-zinc-800/80 px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-700/50">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">
        Definition
      </p>
      <p className="text-sm font-semibold text-foreground">{title}</p>
    </div>
    <div className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [&>p]:m-0">
      {children}
    </div>
  </div>
);

// ─── Step ─────────────────────────────────────────────────────────────────────

export const Step = ({
  children,
  step,
  title,
}: {
  children: React.ReactNode;
  step: number;
  title?: string;
}) => (
  <div className="my-4 flex gap-4 not-prose">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
      {step}
    </div>
    <div className="flex-1 min-w-0">
      {title && (
        <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      )}
      <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {children}
      </div>
    </div>
  </div>
);

// ─── Heading helpers ──────────────────────────────────────────────────────────

function slugify(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (React.isValidElement(child)) {
        const nested = (child.props as React.PropsWithChildren)?.children;
        if (typeof nested === "string") return nested;
        return React.Children.toArray(nested)
          .filter((c): c is string => typeof c === "string")
          .join("");
      }
      return "";
    })
    .join("")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── blockquote helpers ───────────────────────────────────────────────────────

function getLeadingText(children: React.ReactNode): string {
  const arr = React.Children.toArray(children);
  if (!arr.length) return "";
  const first = arr[0];
  if (!React.isValidElement(first)) return "";
  const pChildren = React.Children.toArray(
    (first.props as React.PropsWithChildren)?.children ?? []
  );
  const text = pChildren[0];
  return typeof text === "string" ? text : "";
}

function stripAlertToken(
  children: React.ReactNode,
  token: string
): React.ReactNode {
  const arr = React.Children.toArray(children);
  const first = arr[0];
  if (!React.isValidElement(first)) return children;
  const pChildren = React.Children.toArray(
    (first.props as React.PropsWithChildren)?.children ?? []
  );
  const newPChildren = pChildren
    .map((c, i) => {
      if (i === 0 && typeof c === "string") {
        const stripped = c.replace(token, "").trim();
        return stripped || null;
      }
      return c;
    })
    .filter(Boolean);
  const newFirst = React.cloneElement(first, {}, ...newPChildren);
  return [newFirst, ...arr.slice(1)];
}

// ─── Component map ────────────────────────────────────────────────────────────

export const mdxComponents = {
  // Suppress body h1 — page renders title from frontmatter
  h1: () => null,

  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return (
      <h2
        id={id}
        className="group flex items-center gap-2 text-base font-semibold text-foreground mt-10 mb-4 not-prose scroll-mt-20"
        {...props}
      >
        {children}
        <a
          href={`#${id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 dark:text-zinc-600 text-sm font-normal no-underline"
        >
          #
        </a>
      </h2>
    );
  },

  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(children);
    return (
      <h3
        id={id}
        className="group flex items-center gap-2 text-sm font-semibold text-foreground mt-8 mb-3 not-prose scroll-mt-20"
        {...props}
      >
        {children}
        <a
          href={`#${id}`}
          aria-hidden="true"
          tabIndex={-1}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 dark:text-zinc-600 text-xs font-normal no-underline"
        >
          #
        </a>
      </h3>
    );
  },

  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="text-sm font-medium text-foreground mt-6 mb-2 not-prose"
      {...props}
    >
      {children}
    </h4>
  ),

  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="text-[15px] leading-[1.9] text-zinc-700 dark:text-zinc-300 mb-5 not-prose"
      {...props}
    >
      {children}
    </p>
  ),

  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="my-5 pl-5 space-y-2 list-disc marker:text-zinc-400 dark:marker:text-zinc-500 not-prose"
      {...props}
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="my-5 pl-5 space-y-2 list-decimal marker:text-zinc-400 dark:marker:text-zinc-500 not-prose"
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li
      className="text-[15px] leading-[1.8] text-zinc-700 dark:text-zinc-300 pl-1"
      {...props}
    >
      {children}
    </li>
  ),

  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),

  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic text-zinc-600 dark:text-zinc-400" {...props}>
      {children}
    </em>
  ),

  // Smart blockquote: GitHub-style [!NOTE] / [!TIP] / [!WARNING] etc.
  blockquote: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => {
    const leadingText = getLeadingText(children);
    const match = leadingText.match(
      /^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]/
    );
    if (match) {
      const type = alertTypeMap[match[1]];
      const strippedChildren = stripAlertToken(children, match[0]);
      return <Callout type={type}>{strippedChildren}</Callout>;
    }

    return (
      <blockquote
        className="my-6 relative pl-5 text-sm italic text-zinc-600 dark:text-zinc-400 leading-relaxed not-prose [&>p]:m-0 [&>p:not(:last-child)]:mb-2 before:content-[''] before:absolute before:left-0 before:top-0.5 before:bottom-0.5 before:w-[3px] before:rounded-full before:bg-zinc-200 dark:before:bg-zinc-700"
        {...props}
      >
        {children}
      </blockquote>
    );
  },

  // Inline code — code blocks are handled by bright via `pre`
  code: ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
    if (className?.startsWith("language-")) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="text-[0.8em] font-mono bg-zinc-100 dark:bg-zinc-800/80 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700/50"
        {...props}
      >
        {children}
      </code>
    );
  },

  // Links — internal via Next Link, external with target _blank
  a: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isHashLink = href?.startsWith("#");
    const isProtocolLink = href
      ? /^(mailto:|tel:)/i.test(href)
      : false;
    const isExternal = href ? /^(https?:)?\/\//i.test(href) : false;
    const cls =
      "text-foreground underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-600 hover:decoration-foreground transition-colors";
    if (isHashLink || isProtocolLink) {
      return (
        <a href={href} className={cls} {...props}>
          {children}
        </a>
      );
    }
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href ?? "#"} className={cls} {...props}>
        {children}
      </Link>
    );
  },

  // Decorative dots separator
  hr: () => (
    <div
      className="my-12 flex items-center justify-start gap-2.5 text-zinc-300 dark:text-zinc-600"
      aria-hidden="true"
    >
      <span className="text-sm">·</span>
      <span className="text-sm">·</span>
      <span className="text-sm">·</span>
    </div>
  ),

  // Table
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 not-prose overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700/50">
      <table className="w-full text-sm border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-zinc-50 dark:bg-zinc-800/60" {...props}>
      {children}
    </thead>
  ),

  tbody: ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800" {...props}>
      {children}
    </tbody>
  ),

  tr: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
      {...props}
    >
      {children}
    </tr>
  ),

  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400"
      {...props}
    >
      {children}
    </td>
  ),

  // Custom components (usable directly in MDX files)
  Callout,
  Quote,
  PullQuote,
  Step,
  Definition,
  Spoiler,
};
