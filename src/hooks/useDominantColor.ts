"use client";

import { useState, useEffect } from "react";

function extractVibrantColor(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = 80;
  canvas.height = 80;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#1DB954";

  ctx.drawImage(img, 0, 0, 80, 80);
  const { data } = ctx.getImageData(0, 0, 80, 80);

  let rSum = 0, gSum = 0, bSum = 0, totalWeight = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 510;
    const saturation = max === 0 ? 0 : (max - min) / max;

    // Skip near-black, near-white, and grey pixels
    if (lightness < 0.1 || lightness > 0.92 || saturation < 0.18) continue;

    // Weight = saturation × penalty for very dark or very bright
    const weight = saturation * (1 - Math.abs(lightness - 0.45) * 1.2);
    if (weight <= 0) continue;

    rSum += r * weight;
    gSum += g * weight;
    bSum += b * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return "#1DB954";

  return `rgb(${Math.round(rSum / totalWeight)}, ${Math.round(gSum / totalWeight)}, ${Math.round(bSum / totalWeight)})`;
}

// null = not yet extracted (don't show anything yet)
export function useDominantColor(imageUrl?: string): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) { setColor(null); return; }
    setColor(null); // clear on track change — prevents stale color flash

    const proxied = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    const img = new Image();
    img.onload = () => {
      try { setColor(extractVibrantColor(img)); }
      catch { setColor("#1DB954"); }
    };
    img.onerror = () => setColor("#1DB954");
    img.src = proxied;
  }, [imageUrl]);

  return color;
}
