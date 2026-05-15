import { Metadata } from "next";
import Link from "next/link";
import { FiDownload } from "react-icons/fi";
import { resumeData } from "@/data/resume";

export const metadata: Metadata = {
  title: "Resume | The Nii Dromo",
  description: "Resume of Michael Perry Nii Dromo — Software Engineer.",
  alternates: { canonical: "/resume" },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-5">
      {title}
    </h2>
    {children}
  </section>
);

const TimelineEntry = ({
  title,
  subtitle,
  period,
  bullets,
  url,
  isLast,
}: {
  title: string;
  subtitle?: string;
  period?: string;
  bullets?: string[];
  url?: string;
}) => (
  <div className="flex gap-4">
    {/* Timeline column: dot + line for the title */}
    <div className="flex flex-col items-center shrink-0">
      <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-[5px]" />
      <div className="w-px flex-1 mt-2 bg-zinc-200 dark:bg-zinc-800" />
    </div>
    <div className="flex-1 min-w-0 pb-8">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          {url ? (
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-foreground hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
            >
              {title} ↗
            </Link>
          ) : (
            <p className="text-sm font-semibold text-foreground">{title}</p>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {period && (
          <span className="text-xs italic text-zinc-400 dark:text-zinc-500 shrink-0">{period}</span>
        )}
      </div>
      {bullets && bullets.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 items-start">
              <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 mt-[5px]" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{b}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const Entry = ({
  title,
  subtitle,
  period,
  bullets,
  coursework,
  url,
}: {
  title: string;
  subtitle?: string;
  period?: string;
  bullets?: string[];
  coursework?: string[];
  url?: string;
}) => (
  <div className="mb-6 last:mb-0">
    <div className="flex items-start justify-between gap-4 mb-1">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {url && (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-foreground transition-colors shrink-0"
        >
          Project Link ↗
        </Link>
      )}
      {period && (
        <span className="text-xs italic text-zinc-400 dark:text-zinc-500 shrink-0">{period}</span>
      )}
    </div>
    {bullets && bullets.length > 0 && (
      <ul className="mt-2 flex flex-col gap-1.5">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2 items-start">
            <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 mt-[5px]" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    )}
    {coursework && coursework.length > 0 && (
      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5">
          Relevant Coursework
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {coursework.join(", ")}
        </p>
      </div>
    )}
  </div>
);

export default function ResumePage() {
  const { name, title, experience, education, projects, skills, activities } = resumeData;

  return (
    <div className="pt-2 pb-6 mb-20">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">
            {name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
        </div>
        <Link
          href="https://docs.google.com/document/d/1cYsx-G67J1mF6dy6qDW9cBn3j_b3a-xuEDRjbOc1cvY/export?format=pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-foreground transition-colors border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded px-3 py-1.5 shrink-0"
        >
          <FiDownload size={12} />
          PDF
        </Link>
      </div>

      <Section title="Experience">
        {experience.map((e) => (
          <TimelineEntry
            key={e.company}
            title={e.company}
            subtitle={e.role}
            period={e.period}
            bullets={e.bullets}
          />
        ))}
      </Section>

      <Section title="Education">
        {education.map((e) => (
          <Entry
            key={e.institution}
            title={e.institution}
            subtitle={e.degree}
            period={e.period}
            bullets={e.bullets}
            coursework={(e as any).coursework}
          />
        ))}
      </Section>

      <Section title="Projects">
        {projects.map((p) => (
          <Entry key={p.name} title={p.name} url={p.url || undefined} bullets={p.bullets} />
        ))}
      </Section>

      <Section title="Skills">
        <div className="flex flex-col gap-2.5">
          {skills.map((s) => (
            <div key={s.label} className="flex gap-3 text-xs">
              <span className="text-zinc-400 dark:text-zinc-500 w-20 shrink-0">{s.label}</span>
              <span className="text-zinc-600 dark:text-zinc-300">{s.value}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Activities">
        {activities.map((a, i) => (
          <p key={i} className="text-xs text-zinc-500 dark:text-zinc-400">
            {a}
          </p>
        ))}
      </Section>
    </div>
  );
}
