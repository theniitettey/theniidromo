"use client";

import { useState, useEffect } from "react";

function extractVibrantColor(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = 50;
  canvas.height = 50;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#1DB954";

  ctx.drawImage(img, 0, 0, 50, 50);
  const { data } = ctx.getImageData(0, 0, 50, 50);

  let best = { r: 29, g: 185, b: 84, score: 0 };

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 510; // 0–1
    const saturation = max === 0 ? 0 : (max - min) / max;

    // Skip near-black, near-white, and washed-out pixels
    if (lightness < 0.12 || lightness > 0.88 || saturation < 0.25) continue;

    // Score = saturation boosted by mid-range lightness
    const score = saturation * (1 - Math.abs(lightness - 0.5));
    if (score > best.score) best = { r, g, b, score };
  }

  return `rgb(${best.r}, ${best.g}, ${best.b})`;
}

export function useDominantColor(imageUrl?: string): string {
  const [color, setColor] = useState("#1DB954");

  useEffect(() => {
    if (!imageUrl) return;
    setColor("#1DB954"); // reset on track change

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        setColor(extractVibrantColor(img));
      } catch {
        // CORS or canvas taint — keep Spotify green fallback
      }
    };
    img.onerror = () => {};
    img.src = imageUrl;
  }, [imageUrl]);

  return color;
}
