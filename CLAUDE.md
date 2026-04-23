# KingCore Website

Static marketing site for KingCore — paper tube & industrial core manufacturer, Lahore, Pakistan.

**Live:** https://aethersystem110.github.io/kingcore-website/

## Stack

- Single-page static site — no framework, no build step
- HTML + CSS + vanilla JS
- GSAP 3.12.5 (CDN) + ScrollTrigger for animations
- Google Fonts: Fraunces (display), Inter (body)
- Hosted on GitHub Pages from `main` branch

## File Structure

```
kingcore-website/
├── index.html
├── styles.css
├── main.js
└── assets/
    └── images/
        ├── hero-tube.jpg
        ├── feature-1-sideprofile.jpg
        ├── feature-2-interior.jpg
        └── feature-3-range.jpg
```

## Design Tokens

```
--color-bg: #0a0906          (warm near-black)
--color-bg-alt: #141210      (lifted black for section contrast)
--color-text: #f5f0e1        (warm cream)
--color-text-dim: #8a8578    (muted cream)
--color-accent: #c9a961      (amber gold)
--color-accent-bright: #e8c07a (lighter amber for hover)
--color-border: #2a2620      (subtle dark borders)
--font-display: Fraunces     (serif headlines)
--font-body: Inter           (body text)
```

## Sections

1. **Nav** — fixed top, transparent-to-solid on scroll, wordmark + CTA
2. **Hero** — two-column (text 40% / image 60%), Ken Burns zoom on hero image
3. **Capabilities** — 3-card grid with 3D tilt on hover, specular highlight
4. **Specifications** — 2x2 stat grid with count-up animation + prose
5. **Who We Serve** — 4 category tiles with CSS geometric icons
6. **Contact** — centered CTA, mailto link
7. **Footer** — copyright + email

## Development

Open `index.html` directly in a browser, or serve locally:

```bash
cd kingcore-website
python -m http.server 8080
# visit http://localhost:8080
```

## Deployment

Push to `main` — GitHub Pages deploys automatically.

```bash
git add -A
git commit -m "feat: description"
git push origin main
```

## Images

Product photos are optimized to <180KB each (1408x768, JPEG q92). Source originals are on Desktop in `kingcore assets/`. To replace an image, optimize to under 500KB and keep the same filename.

## Contact

- Email: sales@thekingcore.com
- Company: King Core / Imperial Synergies, Lahore, Pakistan
