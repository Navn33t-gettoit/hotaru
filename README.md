# Hotaru

**Simple, high-focus spaces for independent work and conscious resets.**

Hotaru updates existing structures into quiet environments where people can rest, think, and rebuild their daily rhythm. We leave out the loud distractions, the clutter, and the forced social mechanics — and build spaces designed simply to let you get your best work done.

---

## The Manifest

Protecting your attention is our baseline layout rule.

We believe good work requires honest environments — not performance, not hustle culture, not the illusion of community through noise. Hotaru is built on a humble philosophy:

- **Attention first.** Every spatial decision starts with focus, not footfall.
- **Intentional design.** We build environments that help you find a steady daily rhythm.
- **Honest spaces.** Quality rooms and common areas, designed simply, without pretense.

We are not a hostel. We are not a co-living startup. We are a shared address for people who build things — and need a calm place to do it.

---

## The Ecosystem

Hotaru is a physical network with a quiet digital layer. Two locations, one philosophy, three tiers of space, and a cafe at the centre.

### Physical Spaces

| Location | Character |
|----------|-----------|
| **Dharamkot** | Quiet mountain spaces for uninterrupted, head-down projects |
| **Siolim** | A relaxed coastal house for creative flow and open collaboration |

### The Three-Tier Layout

Every house follows a clear spatial blueprint that separates noise from quiet:

1. **The Social Hub** — Low-slung seating and open doors centred around Koru Cafe
2. **The Workspaces** — Acoustic wood buffers, heavy communal tables, and quiet call nooks
3. **The Private Rooms** — Simple, dim-lit spaces prioritising deep, restorative rest

Functional recovery is built in: saunas, ice baths, and movement decks are standard parts of the house — not add-ons.

### Koru Cafe

We replaced the reception desk with a tea-forward neighbourhood cafe. Check-ins and morning conversations happen over a central island bar. Honest, affordable, local food designed to be eaten every day.

### Ember — The Digital Companion

Ember is a quiet web tool that stays out of your way. A hyper-local PWA built purely for daily utility:

- **Status** — Simple toggles (Deep Work, Open, Offline) to ease social friction
- **The Board** — A text-only ledger that clears every week
- **Space Layer** — Fast, direct booking for the sauna, ice bath, and meeting rooms

Strictly opt-in. Zero push notifications. Acts like a basic notice board, not an app looking for screen time.

---

## Current Status & Roadmap

### Completed

- [x] Master Brand Deck v1 (10-slide presentation)
- [x] Brand identity — Hotaru, Koru Cafe, and Ember logo system
- [x] Colour palette and typography standards (Sumi Green, Rice Cream, Ember Terracotta)
- [x] Tech stack architecture overview
- [x] Ember product views — Status, Board, Space Booking
- [x] GitHub Pages presentation hosting

### Up Next

- [ ] Physical onboarding cards (Wi-Fi, entry codes, house guide)
- [ ] Supabase backend setup for Ember
- [ ] Digital registration flow (pre-arrival)
- [ ] Alumni Thread — lightweight network log
- [ ] Dharamkot site planning and fit-out
- [ ] Siolim site planning and fit-out

---

## View the Deck

### Online

The presentation is hosted on GitHub Pages:

**[View the deck →](https://navn33t-gettoit.github.io/hotaru/)**

Use the **←** and **→** arrow keys to navigate between slides.

### Locally

**Option 1 — Double-click**

Open `index.html` in Chrome, Safari, or Firefox. No install required.

**Option 2 — Local server**

```bash
# From this directory
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Export to PDF

1. Open the deck in Chrome
2. Press **⌘ + P** (Mac) or **Ctrl + P** (Windows)
3. Destination: **Save as PDF**
4. Enable **Background graphics**
5. Save — each slide becomes one landscape page

---

## Repository Structure

```
.
├── index.html          # Presentation deck (10 slides)
├── styles.css          # Brand styling
├── assets/
│   ├── hotaru-logo.svg
│   ├── koru-logo.svg
│   └── ember-logo.svg
├── README.md
└── .nojekyll           # Ensures GitHub Pages serves static files correctly
```

All asset paths are relative — the deck renders identically locally and on GitHub Pages.

---

## Brand Palette

| Name | Hex | Use |
|------|-----|-----|
| Rice Cream | `#F4EEE2` | Background |
| Sumi Green | `#3A4A3F` | Headlines, logo strokes |
| Sage | `#6F7B62` | Hook text |
| Sage Muted | `#8A8466` | Body copy, labels |
| Ember Terracotta | `#C06B3E` | Accent, ember dot |
| Coal | `#1C1814` | Dark mode surfaces |

**Typography:** Newsreader (serif) + Hanken Grotesk (sans-serif)

---

*Hotaru means firefly. A shared address for people who build things.*
