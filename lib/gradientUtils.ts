/**
 * Convert RGB [0-255] to HSL [0-360, 0-100, 0-100]
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return [h * 360, s * 100, l * 100];
}

/**
 * Convert HSL to hsla() string for CSS
 */
export function hslToHsla(h: number, s: number, l: number, a: number): string {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
}

/**
 * Generate a mesh gradient background matching the auth/illustration style.
 * Uses fixed radial gradient positions for consistent shape; colors derive from input.
 */
export function getMeshGradientStyle(
  r: number,
  g: number,
  b: number
): { backgroundImage: string; backgroundBlendMode: string; backgroundSize: string } {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Color variations from input: subtle tint, main orb, lighter orb
  const subtleTint = hslToHsla(h, Math.min(s, 60), Math.min(l + 20, 95), 0.15);
  const mainOrb = hslToHsla(h, Math.min(s + 10, 85), Math.min(l + 15, 88), 0.9);
  const lightOrb = hslToHsla(h, Math.min(s, 70), Math.min(l + 25, 92), 0.85);

  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;
  const gradients = [
    `radial-gradient(circle at 46.72% 45.37%, ${subtleTint} 36.25%, transparent 62.08%)`,
    `radial-gradient(circle at 9.45% 4.74%, hsla(0, 0%, 100%, 0.7) 6.25%, transparent 37.94%)`,
    `radial-gradient(circle at 25.77% 104.16%, ${mainOrb} 8.38%, transparent 38.17%)`,
    `radial-gradient(circle at 122.39% 77.89%, hsla(0, 0%, 100%, 1) 18.22%, transparent 52.51%)`,
    `radial-gradient(circle at 8.1% 7.91%, ${lightOrb} 8.38%, transparent 44.4%)`,
  ];

  return {
    backgroundImage: [noiseSvg, ...gradients].join(", "),
    backgroundBlendMode: "overlay, normal, normal, normal, normal, normal",
    backgroundSize: "150px 150px, auto, auto, auto, auto, auto",
  };
}

/**
 * Deterministically generate RGB from userId (for fallback when no avatar)
 */
export function getRgbFromUserId(userId: string): [number, number, number] {
  const hash = userId
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // Map to a pleasant hue range (avoid grays): 200-320° typically gives nice purples/blues/pinks
  const hue = 200 + (Math.abs(hash) % 240);
  const sat = 55 + (Math.abs(hash >> 4) % 35);
  const light = 70 + (Math.abs(hash >> 8) % 20);

  // HSL to RGB
  const h = hue / 360;
  const s = sat / 100;
  const l = light / 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
