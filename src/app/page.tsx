"use client";
import React from "react";
import { allPosts } from "@/lib/content";
import Link from "next/link";
import { format } from "date-fns";
import { Posts, MotionDiv, MotionHeader, SpotifyCard } from "@/components";
import { Icons } from "@/assets";
import Image from "next/image";
import { FiYoutube } from "react-icons/fi";
import { SiSpotify } from "react-icons/si";
import { LuHandMetal } from "react-icons/lu";

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
        <div className="flex flex-col items-start gap-2.5 mb-5 select-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-green-500 text-xs font-medium">
            <LuHandMetal size={14} />
            <span>Akwaaba</span>
          </div>
          <span 
            className="text-sm font-bold text-foreground tracking-widest"
            style={{ textShadow: "-1.5px 0 0 rgba(0, 255, 255, 0.7), 1.5px 0 0 rgba(255, 0, 0, 0.7)" }}
          >
            いらっしゃいませ
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 mb-5">
          <MotionHeader variants={itemVariants}>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Michael Perry Nii Dromo
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Software Engineer · CS student, University of Ghana
            </p>
            <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Open to work
            </span>
          </MotionHeader>
          <Image
            src={Icons.doodle}
            alt=""
            width={64}
            height={64}
            className="opacity-60 dark:opacity-40 shrink-0 mt-1"
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
            href="https://qz.bflabs.tech"
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
            href="https://eventflick.vercel.app"
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
            href="https://youtube.com/@michaelperryjnr"
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
              @michaelperryjnr →
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
