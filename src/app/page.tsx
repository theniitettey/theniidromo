"use client";
import React from "react";
import { allPosts } from "@/lib/content";
import Link from "next/link";
import { format } from "date-fns";
import { Posts, MotionDiv, MotionHeader, SpotifyCard, NowPlaying, DjQueueWidget } from "@/components";
import Image from "next/image";
import { FiYoutube } from "react-icons/fi";
import { SiSpotify } from "react-icons/si";
import { LuHandMetal } from "react-icons/lu";
import { person } from "@/data/person";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const spotifyTracks = [
  { trackId: "4PA16FAl8LPmFmOhARawdV", label: "Drake · Views '16" },
  { trackId: "2KvHC9z14GSl4YpkNMX384", label: "Drake · More Life '17" },
  { trackId: "047fCsbO4NdmwCBn8pcUXl", label: "Drake · Take Care '11" },
  { trackId: "7xoUc6faLbCqZO6fQEYprd", label: "Ariana Grande · My Everything '14" },
  { trackId: "0Q1bMs3xLQiDEeaneehdxv", label: "Asake · Work of Art '23" },
  { trackId: "3x11dxRSmvNxq46e5IhNCO", label: "Fireboy DML · Adedamola '24" },
];

const Home = () => {
  const recentPosts = allPosts
    .filter((post) => !post.archived)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  return (
    <MotionDiv
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-12 mb-20"
    >
      {/* Hero */}
      <MotionDiv variants={itemVariants} className="pt-2">
        <div className="flex items-center justify-between gap-4 mb-4 select-none">
          <MotionHeader variants={itemVariants} className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-500 text-xs font-medium w-fit">
              <LuHandMetal size={14} />
              <span>Akwaaba</span>
            </div>
            <span
              className="text-sm font-bold text-foreground tracking-widest"
              style={{ textShadow: "-1.5px 0 0 rgba(0, 255, 255, 0.7), 1.5px 0 0 rgba(255, 0, 0, 0.7)" }}
            >
              いらっしゃいませ
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-3">
              {person.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Software Engineer · CS student, University of Ghana
            </p>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open to work
            </span>
          </MotionHeader>
          <Image
            src="/memoji.png"
            alt="Nii Dromo memoji"
            width={80}
            height={80}
            className="shrink-0 select-none grayscale w-28 h-28 sm:w-36 sm:h-36 object-contain"
          />
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            Developer from Accra, Ghana 🇬🇭 — building polished, production-grade
            software for the web. I&apos;ve shipped APIs, high-concurrency
            systems, and frontend products used by thousands, across QuiverTech
            Solutions, BetaForge Labs, and my own projects.
          </p>
          <p>
            Currently building{" "}
            <a
              href="https://qz.bflabs.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-medium hover:opacity-70 transition-opacity"
            >
              Qz
            </a>{" "}
            — a quiz platform that hit 10,000+ visits in its first month. I work
            mostly in TypeScript and Python, treat best practices as guidelines
            not gospel, and learn through reading, writing, and drawing. This
            site is where all of that lives.
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs italic mt-1">
            Where tradition meets innovation, that&apos;s where you&apos;ll find
            me coding.
          </p>
          <svg
            className="mt-5 text-zinc-300 dark:text-zinc-700"
            width="153"
            height="13"
            viewBox="0 0 153 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M142.794 12.2109C138.34 12.2109 132.863 7.17136 132.63 6.95835C130.13 4.42221 127.6 2.16653 123.88 2.16653C119.801 2.16653 115.01 6.89057 114.96 6.93763L114.545 7.33186C111.904 9.8402 109.409 12.2107 104.965 12.2107C100.511 12.2107 95.0346 7.17117 94.8017 6.95816C92.3013 4.42202 89.7718 2.16634 86.0512 2.16634C81.9727 2.16634 77.1814 6.89036 77.1313 6.93742L76.7404 7.29663C73.7239 10.042 71.3431 12.2104 67.1383 12.2104C62.6824 12.2104 57.2049 7.17093 56.9744 6.95791C54.4726 4.42178 51.9417 2.1661 48.2239 2.1661C44.1455 2.1661 39.3542 6.89011 39.3041 6.93717L38.8852 7.33508C36.246 9.84221 33.7498 12.209 29.3078 12.209C24.852 12.209 19.3744 7.16944 19.144 6.95643C16.6422 4.42029 14.1113 2.16461 10.3935 2.16461C6.69067 2.16461 3.31656 3.93881 1.58478 6.79543C1.36983 7.1534 0.859483 7.29009 0.447627 7.10142C0.037154 6.91033 -0.11959 6.46768 0.0981496 6.10971C2.12286 2.77304 6.06672 0.697735 10.3923 0.697735C14.8204 0.697735 17.7603 3.30524 20.3924 5.97441C21.8042 7.28421 26.2115 10.7409 29.3066 10.7409C33.0108 10.7409 35.0547 8.79975 37.6437 6.34222L38.0502 5.95642C38.2511 5.75567 43.3865 0.698009 48.2208 0.698009C52.6489 0.698009 55.5888 3.30551 58.2209 5.97469C59.6325 7.28449 64.04 10.7411 67.1351 10.7411C70.6214 10.7411 72.5725 8.96691 75.5238 6.28089L75.8927 5.94468C76.0826 5.75359 81.2179 0.697111 86.0508 0.697111C90.4814 0.697111 93.4217 3.30462 96.051 5.97379C97.4629 7.28118 101.87 10.739 104.965 10.739C108.671 10.739 110.717 8.79669 113.308 6.33541L113.712 5.95323C113.913 5.75248 119.048 0.694824 123.88 0.694824C128.31 0.694824 131.251 3.30233 133.88 5.9715C135.292 7.27889 139.699 10.7367 142.794 10.7367C146.346 10.7367 149.653 9.06772 151.43 6.38173C151.661 6.0298 152.174 5.90765 152.579 6.11203C152.981 6.31402 153.119 6.7627 152.888 7.11343C150.811 10.2603 146.943 12.2112 142.794 12.2112L142.794 12.2109Z" fill="currentColor" />
          </svg>
        </div>
      </MotionDiv>

      {/* Currently */}
      <MotionDiv variants={itemVariants} className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Now
        </h2>
        <ul className="flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
          <li>
            B.Sc. Computer Science at UG Legon{" "}
            <span className="text-zinc-400 dark:text-zinc-500 text-xs">
              — graduating Aug 2027
            </span>
          </li>
          <li>Building full-stack products and exploring AI tooling</li>
          <li>Open to collaborating on interesting problems</li>
          <li>
            𓅔 Drake fan &mdash;{" "}
            <a
              href="https://open.spotify.com/track/047fCsbO4NdmwCBn8pcUXl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1DB954] hover:opacity-80 transition-opacity font-medium align-middle"
            >
              <SiSpotify size={11} />
              Take Care
            </a>{" "}
            &amp;{" "}
            <a
              href="https://open.spotify.com/track/0zG4M210LKXXXHOoW7DQly"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1DB954] hover:opacity-80 transition-opacity font-medium align-middle"
            >
              <SiSpotify size={11} />
              Views
            </a>{" "}
            basically raised me
          </li>
        </ul>
      </MotionDiv>

      {/* Spotify */}
      <MotionDiv variants={itemVariants} className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Currently on repeat
        </h2>
        <NowPlaying />
        <DjQueueWidget />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {spotifyTracks.map((track) => (
            <SpotifyCard
              key={track.trackId}
              trackId={track.trackId}
              label={track.label}
            />
          ))}
        </div>
      </MotionDiv>

      {/* Featured */}
      <MotionDiv variants={itemVariants} className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Featured
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            href={person.projects.qz}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">Qz</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Quiz platform — 10k+ visits in month one
              </p>
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-foreground transition-colors">
              qz.bflabs.tech →
            </span>
          </a>
          <a
            href={person.projects.eventflick}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                EventFlick
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Event ticketing SaaS for organizers
              </p>
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-foreground transition-colors">
              eventflick.vercel.app →
            </span>
          </a>
          <Link
            href="/resume"
            className="group flex flex-col justify-between gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground">Resume</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Experience, education, and skills
              </p>
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-foreground transition-colors">
              View resume →
            </span>
          </Link>
          <a
            href={person.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          >
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FiYoutube className="text-red-500 shrink-0" size={13} />
                Devlog
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                Code, 3D, and progress updates
              </p>
            </div>
            <span className="text-xs text-zinc-400 group-hover:text-foreground transition-colors">
              {person.social.youtubeHandle} →
            </span>
          </a>
        </div>
      </MotionDiv>

      {/* Recent writing */}
      <MotionDiv variants={itemVariants} className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Recent Writing
        </h2>
        <div className="flex flex-col">
          {recentPosts.map((post, index) => (
            <Posts
              key={index}
              title={post.title}
              date={format(new Date(post.date), "d MMM")}
              slug={post.slug}
            />
          ))}
        </div>
        <div className="flex items-center gap-5 pt-1">
          <Link
            href="/blog"
            className="text-xs text-zinc-500 hover:text-foreground transition-colors"
          >
            All posts →
          </Link>
          <Link
            href="/thoughts"
            className="text-xs text-zinc-500 hover:text-foreground transition-colors"
          >
            Thoughts →
          </Link>
          <Link
            href="/asore"
            className="text-xs text-zinc-500 hover:text-foreground transition-colors"
          >
            Asore →
          </Link>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
};

export default Home;
