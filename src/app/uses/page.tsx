import { Metadata } from "next";
import Link from "next/link";
import { person } from "@/data/person";

export const metadata: Metadata = {
  title: `Uses | ${person.siteName}`,
  description: "Tools, languages, and stack I use day to day.",
  alternates: { canonical: "/uses" },
};

type UseItem = { name: string; description: string };

const SECTIONS: { title: string; items: UseItem[] }[] = [
  {
    title: "workstation",
    items: [
      { name: "Windows PC", description: "main machine. does the job." },
      { name: "VS Code", description: "editor. default terminal. nothing fancy." },
      { name: "Chrome", description: "browser and devtools." },
    ],
  },
  {
    title: "languages",
    items: [
      { name: "TypeScript", description: "daily driver. I don't really want to write untyped JS anymore." },
      { name: "JavaScript", description: "when TS is overkill or I'm moving fast." },
      { name: "Python", description: "scripting, APIs, anything data-adjacent." },
      { name: "C++", description: "first language. still the one I reach for when I need to think clearly about memory." },
      { name: "C", description: "systems-level work and coursework." },
      { name: "Java", description: "enterprise stuff and Android when needed." },
      { name: "C#", description: ".NET ecosystem, occasional Unity work." },
      { name: "Move", description: "smart contracts on Aptos/Sui." },
    ],
  },
  {
    title: "frontend",
    items: [
      { name: "React", description: "component model just makes sense to me at this point." },
      { name: "Next.js", description: "App Router. RSC. what this site runs on." },
      { name: "React Native", description: "mobile. same mental model, different primitives." },
      { name: "HTML5 + CSS", description: "still the foundation. I can clone a layout from memory." },
      { name: "Tailwind CSS", description: "utility-first. I stopped writing separate stylesheets a while ago." },
      { name: "Framer Motion", description: "animations. easy to reason about, looks good." },
    ],
  },
  {
    title: "backend",
    items: [
      { name: "Node.js", description: "runtime of choice for most things." },
      { name: "NestJS", description: "for APIs that need structure and grow past a single file." },
      { name: "Express.js", description: "when NestJS is too much ceremony." },
      { name: "FastAPI", description: "Python APIs. fast to write, fast to run." },
      { name: "Django", description: "when I need batteries included." },
      { name: ".NET", description: "C# backend work." },
      { name: "Genkit", description: "AI/LLM workflows and agent tooling." },
    ],
  },
  {
    title: "databases & auth",
    items: [
      { name: "PostgreSQL", description: "relational. Neon for serverless. what this site uses." },
      { name: "MongoDB", description: "document store for projects where the schema genuinely wants to flex." },
      { name: "Firebase", description: "realtime + auth when I need to move fast." },
      { name: "JWT + OAuth", description: "auth primitives. I've implemented both from scratch." },
    ],
  },
  {
    title: "infrastructure & tooling",
    items: [
      { name: "Docker", description: "local dev environments and anything that needs to be portable." },
      { name: "Git", description: "version control. I have strong opinions about commit messages." },
      { name: "REST API", description: "default interface design. GraphQL when it's actually worth it." },
      { name: "Heroku", description: "quick deploys when Vercel isn't the right fit." },
      { name: "Linux", description: "servers, WSL, and anywhere I need a real shell." },
      { name: "Vercel", description: "where this site lives. zero config deploys, edge functions, analytics." },
    ],
  },
  {
    title: "this site",
    items: [
      { name: "Next.js 14 (App Router)", description: "framework." },
      { name: "Velite", description: "MDX content pipeline. typed collections, compiled at build time." },
      { name: "Tailwind CSS + Framer Motion", description: "styling and animations." },
      { name: "Neon PostgreSQL", description: "views, likes, comments, guestbook." },
      { name: "Vercel", description: "deployment, analytics, speed insights, edge OG images." },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="pt-2 pb-6 mb-20">
      <div className="mb-10">
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-foreground transition-colors mb-6 inline-block"
        >
          ← home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          uses
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          tools, languages, and stack I reach for day to day.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {SECTIONS.map(({ title, items }) => (
          <section key={title}>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4">
              {title}
            </h2>
            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map(({ name, description }) => (
                <div key={name} className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4 py-3">
                  <span className="text-sm font-medium text-foreground sm:w-48 shrink-0">
                    {name}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
