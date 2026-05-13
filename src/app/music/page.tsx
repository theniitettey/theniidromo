import { MusicClient } from "./MusicClient";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { siteConfig } from "@/lib/config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Music | The Nii Dromo",
  description:
    "Discover Michael's favorite tunes, top artists, and real-time listening stats.",
};

export default async function MusicPage() {
  const session = await getSession();
  
  // Check if the session belongs to the configured admin username
  const isAdmin = session && session.username === siteConfig.admin.username;

  if (!isAdmin) {
    redirect("/");
  }

  return <MusicClient />;
}
