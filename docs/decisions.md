# Architectural Decisions

## 2026-02-06 – Tech Stack
**Decision:** Vite + React + TypeScript (Browser-App)  
**Why:** Beamer-UI schnell, Komponentenlogik sauber, KI kann es sehr gut generieren.  
**Alternatives considered:** Vue, Svelte (auch möglich, aber React ist KI-standard).

## 2026-02-06 – MVP is Host-Only
**Decision:** MVP ohne Handy-Clients.  
**Why:** Risiko runter, schneller spielbar.  
**Note:** Architektur so trennen, dass später /team und /player Views nur “Clients” sind.

## 2026-02-06 – Minigames as Data (JSON)
**Decision:** Minispiele werden als JSON-Definitionen geladen (mind. physical/quiz).  
**Why:** Neue Minispiele ohne Engine-Umbau möglich.  
**Later:** Upload/Import von Minigame-Packs.

## 2026-02-06 – Offline-first
**Decision:** Spiel läuft ohne Internet.  
**Why:** Kirchen-Setups sind variabel; WLAN kann ausfallen.

## 2026-02-06 – Single Source of Truth
**Decision:** Ein zentraler GameState steuert alles.  
**Why:** spätere Clients dürfen nur anzeigen/senden, Host bleibt authoritative.
