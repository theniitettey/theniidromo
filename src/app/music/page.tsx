import { MusicClient } from "./MusicClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music | The Nii Dromo",
  description: "Discover Michael's favorite tunes, top artists, and real-time listening stats.",
};

export default function MusicPage() {
  return <MusicClient />;
}
