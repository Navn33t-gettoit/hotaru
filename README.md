# 💡 Ember
> **The Digital Mirror — The Community Layer for Hotaru**

Ember is a hyper-local, utility-first standalone Progressive Web App (PWA) engineered as an **"anti-app."** It is completely stripped of algorithms, feeds, tracking loops, and infinite scrolling. Built entirely to protect user attention, its core architecture serves as a digital mirror: it surfaces real-world utility in seconds and immediately encourages users to close the screen and return to physical space.

## 🖼️ Interface & Architecture

Ember is a zero-notification, four-tab layout built to optimize immediate daily utility during a stay:

### 01 Home · Status
*   **The Philosophy:** Establishes soft, friction-free boundary awareness without invasive messaging loops.
*   **The Component:** A time-aware serif greeting, a glowing ambient Ember mark reflecting your state, a 3-way tactile pill toggle (`Deep Work`, `Open`, `Offline`), and a text-only presence ledger showing who is currently in the property. Going `Offline` takes you off the ledger and dims the ember.

### 02 The Board
*   **The Philosophy:** A digital corkboard that completely clears itself every Sunday night to eliminate stale information rot. **One post per person** — a corkboard pin, not a feed.
*   **The Component:** Text-driven cards tagged `MAKING`, `OFFERING`, or `LOOKING`. No metrics, no likes, no comment threads. Posting happens in a quiet bottom sheet; replacing your post takes the old one down.

### 03 Spaces
*   **The Philosophy:** Fast, direct booking modeled after a train timetable — zero reminder notifications, zero speculative slot hoarding, and bookings are anonymous to the rest of the house.
*   **The Component:** Per-space tabs (Deep Work Lab, Ice Bath, Sauna), a three-day window, half-hour slots marked `Available` / `Booked` / `Yours`, and a single select-then-confirm action. Tap your own slot to release it.

### 04 The Thread
*   **The Philosophy:** After checkout, a stay condenses into a lightweight archive card — who you met and what you built. Hotaru becomes a lifelong address, without a noisy group chat.
*   **The Component:** A quiet list of past stays with the people you built with. The current stay "writes itself" and only appears after checkout.

## 🎭 Demo Mode

The app ships as a **simulated living house** so it can be demoed without a backend:

*   Tap the avatar (top right of Home) to view the house as **Meera, Kabir, or Ananya** — each has their own status, post, bookings, and thread.
*   Presence on the Home ledger drifts organically every ~30 seconds.
*   Your status, board post, and bookings persist across refreshes (`localStorage`).
*   House bookings on the Spaces grid are seeded deterministically per day, so the timetable feels lived-in but stable.

---

## 🎨 Visual System & Token Specifications

The application UI strictly inherits the premium, understated design identity of the Hotaru brand system:

<p align="center">
  <img src="assets/ember-logo.svg" alt="Ember logo mark" width="120" />
</p>

*   **Background (Coal):** `#1C1814` — Deep, low-stimulation dark mode tone.
*   **Elements (Sumi Green):** `#3A4A3F` — Muted, earthy structure bars.
*   **Accents (Ember Terracotta):** `#C06B3E` — A warm point of light for active states and indicators.
*   **Typography (Rice Cream):** `#F4EEE2` — High-contrast, gentle text visibility.
*   **Typefaces:** *Newsreader* for elegant editorial headings; *Hanken Grotesk* for utility labels, buttons, and logs.

On screens wider than 500px the app presents itself inside a phone frame on a rice-cream sheet — mirroring the brand design boards — which makes it projector-ready for team demos. On an actual phone it runs full-bleed and installs as a PWA.

---

## 🛠️ Local Development & Deployment

The codebase is built entirely with vanilla HTML, CSS, and JavaScript to load instantaneously over low-bandwidth environments.

```
hotaru/
├── index.html            # PWA shell — the four views & sheets
├── app.js                # All app logic: state, simulation, booking
├── ember.css             # Zero-notification UI framework
├── manifest.json         # Application identity
├── sw.js                 # Service worker (network-first shell, offline fallback)
├── styles.css            # Shared presentation styling for the decks
├── deck/
│   ├── index.html        # "Our Shared Ecosystem" — 7-slide team deck
│   └── brand-deck.html   # Original 10-slide Hotaru brand deck
└── assets/
    ├── ember-logo.svg · hotaru-logo.svg · koru-logo.svg
    └── icon-192.png · icon-512.png
```

To launch a local sandbox environment:
```bash
cd hotaru
python3 -m http.server 8765
```

Then open [http://localhost:8765](http://localhost:8765) for the app, and [http://localhost:8765/deck/](http://localhost:8765/deck/) for the presentation.

---

## Presentation Decks

*   **`deck/index.html` — Our Shared Ecosystem** (7 slides): the full story for the team — co-living as the foundation, Hotaru Retreats for everyone, the Larisa white-label partnership, retreat examples, Ember as the digital companion, and the balanced model. Navigate with arrow keys or swipe; print to PDF straight from the browser.
*   **`deck/brand-deck.html` — Hotaru Brand Deck** (10 slides): the original brand and investor walkthrough.
