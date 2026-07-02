/**
 * Original, minimal SVG marks for AI tools/platforms — simple geometric icons
 * (not brand-logo reproductions), recognizable by shape + brand-tone color.
 * Rendered with `fill/stroke: currentColor`, tinted via the wrapper's color.
 */

export interface AiTool {
  name: string;
  label: string;
  color: string;
}

export const AI_TOOLS: AiTool[] = [
  { name: "claude", label: "Claude", color: "#d97757" },
  { name: "chatgpt", label: "ChatGPT", color: "#19c37d" },
  { name: "gemini", label: "Gemini", color: "#4a7cff" },
  { name: "cursor", label: "Cursor", color: "#c9cdd6" },
  { name: "replit", label: "Replit", color: "#f26207" },
  { name: "lovable", label: "Lovable", color: "#ff5b8a" },
  { name: "manus", label: "Manus", color: "#8b7bff" },
  { name: "bolt", label: "Bolt", color: "#2aa9ff" },
  { name: "windsurf", label: "Windsurf", color: "#17b8a6" },
  { name: "ollama", label: "Ollama", color: "#d6d6d6" },
];

const S = { fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const AiIcon = ({ name, size = 22 }: { name: string; size?: number }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true } as const;
  switch (name) {
    case "claude": // radiating burst / spark
      return (
        <svg {...p} stroke="currentColor" {...S}>
          <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
        </svg>
      );
    case "chatgpt": // hexagon knot node
      return (
        <svg {...p} stroke="currentColor" {...S}>
          <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
          <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "gemini": // four-point sparkle
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M12 2c.9 5.4 3.6 8.1 9 9-5.4.9-8.1 3.6-9 9-.9-5.4-3.6-8.1-9-9 5.4-.9 8.1-3.6 9-9z" />
        </svg>
      );
    case "cursor": // isometric cube
      return (
        <svg {...p} stroke="currentColor" {...S}>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case "replit": // three offset rounded tiles
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2" />
          <rect x="13" y="3.5" width="7.5" height="7.5" rx="2" opacity="0.75" />
          <rect x="8.25" y="13" width="7.5" height="7.5" rx="2" opacity="0.9" />
        </svg>
      );
    case "lovable": // heart
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M12 20.5l-1.5-1.35C5.6 14.8 2.75 12.25 2.75 9.1 2.75 6.6 4.7 4.7 7.15 4.7c1.4 0 2.8.66 3.85 1.9 1.05-1.24 2.45-1.9 3.85-1.9 2.45 0 4.4 1.9 4.4 4.4 0 3.15-2.85 5.7-7.75 10.05z" />
        </svg>
      );
    case "manus": // node cluster
      return (
        <svg {...p} stroke="currentColor" {...S}>
          <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />
          <circle cx="5" cy="6.5" r="1.8" />
          <circle cx="19" cy="7.5" r="1.8" />
          <circle cx="7" cy="18.5" r="1.8" />
          <path d="M9.2 10.2L6 7.6M14.6 10.4L17.6 8.5M10 14.4L8 17" />
        </svg>
      );
    case "bolt": // lightning
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <path d="M13.5 2L4 13.5h6L9 22l10-12h-6.2z" />
        </svg>
      );
    case "windsurf": // sail on a wave
      return (
        <svg {...p} stroke="currentColor" {...S}>
          <path d="M12 3v13" />
          <path d="M12 4.5c3.6.7 6 3 6.8 6.5-2.4.3-4.6.9-6.8 2z" fill="currentColor" stroke="none" />
          <path d="M3.5 19c2-1.6 3.2 1.6 5.2 0s3.2 1.6 5.2 0 3.2 1.6 5.2 0" />
        </svg>
      );
    case "ollama": // rounded llama head
      return (
        <svg {...p} fill="currentColor" stroke="none">
          <rect x="6.5" y="2.5" width="3" height="6" rx="1.5" />
          <rect x="14.5" y="2.5" width="3" height="6" rx="1.5" />
          <path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6v3.5c0 3-2.7 5-6 5s-6-2-6-5z" />
          <circle cx="9.6" cy="12.4" r="1.05" fill="#0c1020" />
          <circle cx="14.4" cy="12.4" r="1.05" fill="#0c1020" />
        </svg>
      );
    default:
      return null;
  }
};
