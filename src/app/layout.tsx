import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Header, Footer, ThemeProvider, QueryProvider } from "@/components";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteConfig } from "@/lib/config";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  display: "swap",
  subsets: ["latin"],
  adjustFontFallback: true,
  variable: "--font-poppins",
});

const siteUrl = siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Nii Dromo | Software Engineer",
  description:
    "Software engineer building polished web experiences. Writing about TypeScript, Rust, and software craft. Founder of BBF Labs.",
  keywords: [
    "Nii Dromo",
    "Software Engineer",
    "BBF Labs Founder",
    "Tech Entrepreneur",
    "Full-stack Developer",
    "Frontend Development",
    "Backend Development",
    "React Developer",
    "Node.js Expert",
    "JavaScript Developer",
    "TypeScript Developer",
    "Web Application Architecture",
    "Web Development Services",
    "Software Consulting",
    "Custom Software Solutions",
    "Technical Blog",
    "Software Portfolio",
    "Code Examples",
    "React.js",
    "Next.js",
    "Node.js",
    "JavaScript",
    "Nest.js",
    "Express.js",
    "MongoDB",
    "PostgreSQL",
    "Firebase",
    "AWS",
    "Google Cloud Platform",
    "Azure",
    "TypeScript",
    "REST API",
    "Cloud Computing",
    "Database Design",
    "Software Engineering",
    "Web Development",
    "Digital Solutions",
    "Tech Innovation",
    "Software Architecture",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    shortcut: "/shortcut-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "The Nii Dromo",
    title: "The Nii Dromo | Software Engineer",
    description:
      "Software engineer building polished web experiences. Writing about TypeScript, Rust, and software craft.",
    images: [
      {
        url: "/api/og/profile",
        width: 1200,
        height: 630,
        alt: "Nii Dromo - Software Engineer & Founder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Nii Dromo | Software Engineer",
    description:
      "Software engineer building polished web experiences. Writing about TypeScript, Rust, and software craft.",
    images: ["/api/og/profile"],
    creator: "@thneniitettey",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  // },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.className} antialiased px-4 pt-4 lg:container lg:mx-auto sm:w-full lg:w-[50%] flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </QueryProvider>
        </ThemeProvider>
        <Analytics mode="production" />
        <SpeedInsights />
      </body>
    </html>
  );
}
