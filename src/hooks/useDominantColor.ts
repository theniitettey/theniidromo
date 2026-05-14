"use client";

import { useState, useEffect } from "react";

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  return [Math.round(hue(h + 1/3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1/3) * 255)];
}

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

    if (lightness < 0.1 || lightness > 0.92 || saturation < 0.18) continue;

    const weight = saturation * saturation * (1 - Math.abs(lightness - 0.45) * 1.2);
    if (weight <= 0) continue;

    rSum += r * weight;
    gSum += g * weight;
    bSum += b * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return "#1DB954";

  const r = Math.round(rSum / totalWeight);
  const g = Math.round(gSum / totalWeight);
  const b = Math.round(bSum / totalWeight);

  const [h, s, l] = rgbToHsl(r, g, b);

  // If result is too washed out, boost saturation to at least 55%
  if (s < 0.55) {
    const boosted = hslToRgb(h, Math.min(s + (0.55 - s) * 0.85, 1), l);
    return `rgb(${boosted[0]}, ${boosted[1]}, ${boosted[2]})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

const colorCache = new Map<string, string>();

// null = not yet extracted (don't show anything yet)
export function useDominantColor(imageUrl?: string): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) { setColor(null); return; }

    // Instant hit for previously seen tracks
    if (colorCache.has(imageUrl)) {
      setColor(colorCache.get(imageUrl)!);
      return;
    }

    // Keep old color visible while new image loads — avoids aura gap between tracks
    const proxied = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    const img = new Image();
    img.onload = () => {
      try {
        const extracted = extractVibrantColor(img);
        colorCache.set(imageUrl, extracted);
        setColor(extracted);
      }
      catch { setColor("#1DB954"); }
    };
    img.onerror = () => setColor("#1DB954");
    img.src = proxied;
  }, [imageUrl]);

  return color;
}
