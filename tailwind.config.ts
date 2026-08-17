import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
],

  theme: {
    // ...
    /* ============================================================
       CONTAINER — responsive content wrapper
    ============================================================ */
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2.5rem",
        xl: "4rem",
        "2xl": "4rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
 
    extend: {
      /* ============================================================
         BREAKPOINTS — extends Tailwind's default screens (sm/md/lg/
         xl/2xl) with an additional xs step for small-phone tuning.
      ============================================================ */
      screens: {
        xs: "480px",
      },
 
      /* ============================================================
         COLOR SYSTEM
         Brand ramps + semantic roles + surface/text/border aliases.
         Never hardcode a hex value in a component — reference a
         token below instead, so a future rebrand touches this file
         only.
      ============================================================ */
    colors: {
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",

  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",

  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },

  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },

  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },

  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },

  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },

  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },

  destructive: {
    DEFAULT: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },

  // ↓ your existing colors continue here

  brand: {
    primary: "#7C3AED",
    secondary: "#EC4899",
    accent: "#22D3EE",
  },

  ink: "#09090B",

  cardSurface: "#18181B",
  cardSurfaceHover: "#1F1F23",

  surface: {
    0: "#09090B",
    1: "#18181B",
    2: "#1F1F23",
    3: "#27272A",
  },
        /* ---- Brand ramps ---- */
        purple: {
          50: "#F3EEFE",
          100: "#E4D8FC",
          200: "#C9B2F9",
          300: "#AD8BF3",
          400: "#A78BFA",
          500: "#7C3AED", // primary
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#4C1D95",
          900: "#3B1876",
        },
        pink: {
          50: "#FDF0F7",
          100: "#FCE1EF",
          200: "#F9C3DF",
          300: "#F694C6",
          400: "#F472B6",
          500: "#EC4899", // secondary
          600: "#DB2777",
          700: "#BE185D",
          800: "#9D174D",
          900: "#831843",
        },
        cyan: {
          50: "#EDFCFE",
          100: "#D1F7FB",
          200: "#A5EEF7",
          300: "#67E1F0",
          400: "#22D3EE", // accent
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
 
        /* ---- Semantic roles ----
           Each role: fill (solid control), bg (pale tint for banners/
           badges), text (foreground on bg), border. Never reuse a
           semantic color for a non-status purpose — status colors are
           the platform's most information-dense signal and lose
           meaning the moment they're used decoratively. */
        success: {
          fill: "#10B981",
          "fill-hover": "#059669",
          bg: "rgba(16,185,129,0.12)",
          text: "#34D399",
          border: "rgba(16,185,129,0.35)",
        },
        warning: {
          fill: "#F59E0B",
          "fill-hover": "#D97706",
          bg: "rgba(245,158,11,0.12)",
          text: "#FBBF24",
          border: "rgba(245,158,11,0.35)",
        },
        error: {
          fill: "#F43F5E",
          "fill-hover": "#E11D48",
          bg: "rgba(244,63,94,0.12)",
          text: "#FB7185",
          border: "rgba(244,63,94,0.35)",
        },
        info: {
          fill: "#3B82F6",
          "fill-hover": "#2563EB",
          bg: "rgba(59,130,246,0.12)",
          text: "#60A5FA",
          border: "rgba(59,130,246,0.35)",
        },
 
        /* ---- Text aliases ---- */
        "text-primary": "#FAFAFA",
        "text-secondary": "rgba(250,250,250,0.68)",
        "text-muted": "rgba(250,250,250,0.45)",
        "text-disabled": "rgba(250,250,250,0.28)",
 
        /* ---- Border aliases ---- */
        borderSurface: {
        DEFAULT: "rgba(255,255,255,0.08)",
        strong: "rgba(255,255,255,0.16)",
        stronger: "rgba(255,255,255,0.28)",
        },
 
        /* ---- Glass surfaces ----
           Reference these instead of hand-typing rgba(255,255,255,x)
           inline in a component. */
        glass: {
          DEFAULT: "rgba(255,255,255,0.06)",
          strong: "rgba(255,255,255,0.10)",
          light: "rgba(255,255,255,0.06)",
          "light-hover": "rgba(255,255,255,0.10)",
          border: "rgba(255,255,255,0.14)",
          dark: "rgba(9,9,11,0.55)",
          "dark-hover": "rgba(9,9,11,0.7)",
        },
      },
 
      /* ============================================================
         TYPOGRAPHY
      ============================================================ */
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      fontSize: {
        // [fontSize, { lineHeight, letterSpacing }] — display scale
        // for hero and section headlines (Space Grotesk).
        "display-2xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        // body scale (Plus Jakarta Sans)
        "body-lg": ["1.125rem", { lineHeight: "1.65" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        caption: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.04em" }],
      },
 
      /* ============================================================
         RADIUS SCALE
      ============================================================ */
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "28px",
        "2xl": "36px",
        pill: "999px",
        full: "9999px",
      },
 
      /* ============================================================
         SHADOWS
         Dark-surface elevation reads as glow, not a black drop
         shadow — a black shadow is invisible on a near-black page.
      ============================================================ */
      boxShadow: {
        "elev-1": "0 1px 2px rgba(0,0,0,0.4)",
        "elev-2": "0 8px 24px -4px rgba(0,0,0,0.5)",
        "elev-3": "0 20px 48px -8px rgba(0,0,0,0.6)",
        popover: "0 12px 32px -6px rgba(0,0,0,0.55)",
        "glow-purple": "0 0 40px -6px rgba(124,58,237,0.45)",
        "glow-pink": "0 0 40px -6px rgba(236,72,153,0.45)",
        "glow-cyan": "0 0 40px -6px rgba(34,211,238,0.4)",
        "glow-brand": "0 0 45px -8px rgba(124,58,237,0.4), 0 0 20px -6px rgba(236,72,153,0.35)",
        "inner-glass": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
        "focus-ring": "0 0 0 2px #09090B, 0 0 0 4px #7C3AED",
        hero: "0 0 80px rgba(124,58,237,0.35)",
      },
 
      /* ============================================================
         BLUR SCALE — extends default, adds larger stops for
         floating gradient blobs / ambient background effects.
      ============================================================ */
      blur: {
        xs: "2px",
        "4xl": "80px",
        "5xl": "120px",
        "6xl": "150px",
      },
      backdropBlur: {
        xs: "2px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
 
      /* ============================================================
         GRADIENTS & BACKGROUND IMAGES
         Every gradient used anywhere in the product should resolve
         to one of these — never an inline bg-gradient-to-r with
         hardcoded stops inside a component.
      ============================================================ */
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #22D3EE 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(236,72,153,0.28) 50%, rgba(34,211,238,0.28) 100%)",
        "text-gradient": "linear-gradient(90deg, #A78BFA 0%, #F472B6 50%, #22D3EE 100%)",
        "radial-glow-purple": "radial-gradient(circle at center, rgba(124,58,237,0.35), transparent 70%)",
        "radial-glow-pink": "radial-gradient(circle at center, rgba(236,72,153,0.3), transparent 70%)",
        "radial-glow-cyan": "radial-gradient(circle at center, rgba(34,211,238,0.25), transparent 70%)",
        "hero-scrim": "linear-gradient(to top, #000 0%, rgba(0,0,0,0.4) 45%, transparent 100%)",
        "card-scrim": "linear-gradient(to top, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.15) 55%, transparent 100%)",
        "surface-sheen": "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)",
      },
 
      /* ============================================================
         ANIMATION PRESETS + KEYFRAMES
      ============================================================ */
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "50%": { transform: "translate(30px, -30px)" },
        },
        "gradient-move": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        float: "float 12s ease-in-out infinite",
        "float-slow": "float 16s ease-in-out infinite",
        "float-delayed": "float 14s ease-in-out infinite 2s",
        "gradient-move": "gradient-move 8s ease infinite",
        bob: "bob 1.8s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
 
      /* ============================================================
         TRANSITION TIMING
      ============================================================ */
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)", // hero/section-level motion
        snap: "cubic-bezier(0.4, 0, 0.2, 1)", // buttons, taps, micro-interactions
        overshoot: "cubic-bezier(0.34, 1.56, 0.64, 1)", // rare emphasis moments only
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },
 
      /* ============================================================
         Z-INDEX SCALE
         Named tokens — never an ad hoc z-[73] in a component.
      ============================================================ */
      zIndex: {
        base: "0",
        raised: "10",
        sticky: "20",
        nav: "30",
        dropdown: "40",
        drawer: "50",
        overlay: "60",
        modal: "70",
        popover: "80",
        toast: "90",
        tooltip: "100",
      },
 
      /* ============================================================
         ASPECT RATIOS
      ============================================================ */
      aspectRatio: {
        card: "4 / 5",
        hero: "16 / 9",
        video: "16 / 9",
        portrait: "3 / 4",
        square: "1 / 1",
        wide: "21 / 9",
        story: "9 / 16",
        reel: "9 / 16",
        landscape: "3 / 2",
      },
 
      /* ============================================================
         MIN-HEIGHT — hero uses svh so mobile browser chrome
         doesn't clip the fold on load.
      ============================================================ */
      minHeight: {
        hero: "100svh",
      },
 
      /* ============================================================
         SPACING TOKENS
         Only semantic additions beyond Tailwind's default scale —
         avoid duplicating values the default scale already covers.
      ============================================================ */
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        "section-y-sm": "4rem",
        "section-y-md": "6rem",
        "section-y-lg": "8rem",
      },
    },
  },
 
  plugins: [],
};
 
export default config;