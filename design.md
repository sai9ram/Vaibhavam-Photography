# Vaibhavam Photography - Design Documentation

## 1. Vision & Core Philosophy
Vaibhavam Photography is a luxury wedding photography studio based in Hyderabad. The digital presence is designed to be **Editorial, Cinematic, and Premium**, moving away from standard portfolio layouts towards an interactive "boutique" experience.

---

## 2. Visual Design System

### 🎨 Color Palette
A curated, harmonious palette designed to feel timeless and high-end:
- **Primary Maroon** (`#7B1E2B`): Symbolizes tradition, luxury, and the emotional weight of Indian weddings.
- **Warm Beige** (`#F8F5F1`): Provides a soft, editorial background that makes photography pop.
- **Deep Charcoal** (`#2D1F1A`): Used for high-contrast typography and depth.
- **Glassmorphism**: Subtle white/beige overlays with 10px-20px blur for modern UI depth.

### 🖋️ Typography
- **Serif (Headings)**: `Cormorant Garamond` — Elegant, classical, and sophisticated.
- **Sans-Serif (Body)**: `Poppins` — Clean, modern, and highly legible across all devices.
- **Accent**: `Great Vibes` — Used sparingly for emotional handwritten touches.

---

## 3. Signature Features

### 🎞️ Cinematic Splash Screen
- **Entrance**: A minimalist black screen with a "Luxury Entrance" trigger.
- **Impact**: Unlocks browser audio permissions on click, allowing the cinematic video branding with full audio to play.
- **Transition**: A 4-second immersive introduction before a smooth dissolve into the main site.

### 🎢 3D Elevated Gallery
- **Shape**: Custom "Pill" (Capsule) shaped wedding frames.
- **Path**: A 3D concave "smile" curve elevation that creates physical depth as the gallery infinitely loops.
- **Interaction**: Frames "straighten" and scale up on hover, revealing the couple's story.

### 🛠️ Interactive Wedding Package Builder
- **Logic**: A real-time calculator for custom wedding packages.
- **Steps**: Multi-event selection, coverage tiers, luxury add-ons (Drones, Reels), and duration sliders.
- **UI**: A floating "Investment Summary" card that stays sticky (bottom on mobile, sidebar on desktop).
- **Smart Suggestions**: Adaptive AI-style recommendations based on user selections.

### 😲 Sarcastic "Telugish" Exit Intent
- **Trigger**: Monitors cursor movement towards the close/tab bar.
- **Copy**: Short, sweet, and sophisticated "Telugish" sarcasm designed for premium clients.
- **CTA**: Direct WhatsApp integration for high-conversion lead generation.

---

## 4. Technical Architecture

### 📱 Responsive Strategy
- **Mobile-First**: Base styles are optimized for 390px-430px viewports.
- **Price Bar**: On mobile, the package builder summary transforms into a persistent bottom bar for easy thumb access.
- **Hardware Acceleration**: Uses `will-change: transform` and CSS transitions for fluid 60fps animations.

### ⚡ Performance & SEO
- **Semantic HTML**: Proper use of `<section>`, `<nav>`, and `<h1>-<h3>` hierarchy.
- **Optimization**: Minimal external dependencies, relying on Vanilla CSS and native JS for lightning-fast load times.
- **Images**: Object-fit and modern aspect-ratio management to preserve high-end photography quality.

---

## 5. Maintenance & Scalability
- **Centralized Styles**: CSS custom properties (`--maroon`, `--beige`) allow for instant global theme updates.
- **Modular Sections**: Each section is built as a self-contained block, making it easy to add new features or portfolio highlights.
