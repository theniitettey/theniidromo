"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { SchemeToggle } from "@/components";
import Link from "next/link";
import { FiGithub, FiTwitter, FiMail, FiLinkedin, FiFileText } from "react-icons/fi";
import { Dancing_Script } from "next/font/google";

const cursive = Dancing_Script({
  weight: ["600"],
  subsets: ["latin"],
  display: "swap",
});

interface NavLinkProps {
  name: string;
  href: string | string[];
  isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, isActive = false, name }) => {
  const primaryHref = Array.isArray(href) ? href[0] : href;
  return (
    <Link
      href={primaryHref}
      className={`text-sm transition-colors ${
        isActive
          ? "text-foreground font-semibold"
          : "text-zinc-500 dark:text-zinc-400 hover:text-foreground dark:hover:text-foreground"
      }`}
    >
      {name}
    </Link>
  );
};

const Links = [
  { name: "Home", href: "/" },
  { name: "Blog", href: ["/blog", "/posts", "/archive/posts"] },
  { name: "Thoughts", href: ["/thoughts"] },
  { name: "Asore", href: ["/asore", "/archive/devotionals"] },
  { name: "Guestbook", href: ["/guestbook"] },
];

const Header = () => {
  const pathname = usePathname();

  const isLinkActive = (href: string | string[]): boolean => {
    if (typeof href === "string") {
      return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
    }
    return href.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  };

  return (
    <header className="sticky top-0 z-50 bg-background flex flex-col gap-5 pt-3 pb-3 border-b border-zinc-200 dark:border-zinc-800 mb-8">
      <div className="flex flex-row items-center justify-between">
        <Link href="/" className={`${cursive.className} text-xl sm:text-2xl text-foreground hover:opacity-80 transition-opacity`}>
          The Nii Dromo
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="mailto:michaelperryt97@gmail.com"
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <FiMail size={15} />
          </Link>
          <Link
            href="https://x.com/theniitettey"
            target="_blank"
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <FiTwitter size={15} />
          </Link>
          <Link
            href="https://linkedin.com/in/theniitettey"
            target="_blank"
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <FiLinkedin size={15} />
          </Link>
          <Link
            href="https://github.com/michaelperryjnr"
            target="_blank"
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <FiGithub size={15} />
          </Link>
          <Link
            href="/resume"
            className="text-zinc-400 hover:text-foreground transition-colors"
          >
            <FiFileText size={15} />
          </Link>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <nav className="flex flex-row items-center gap-4 sm:gap-6">
          {Links.map((link) => (
            <NavLink
              key={link.name}
              name={link.name}
              href={link.href}
              isActive={isLinkActive(link.href)}
            />
          ))}
        </nav>
        <SchemeToggle />
      </div>
    </header>
  );
};

export default Header;
