# MVP Spec – Gruppenspiel

## 1. MVP Screens (Host/Beamer)
### Screen A – Setup
- Teams: hinzufügen/entfernen, Name, Farbe
- Spielsettings:
  - Zielmodus: (1) als erstes Ziel erreichen ODER (2) höchste Punkte nach X Runden
  - Board-Länge (z. B. 20–80 Felder)
  - Spezialfelder-Dichte (einfacher Regler: niedrig/mittel/hoch) oder feste JSON-Map
  - Würfel: d6 (MVP), optional d8/d10 (Auswahl pro Zug)
  - Minigame Pool: Liste mit Checkbox “aktiv”
  - Minigame Auswahlmodus: zufällig / manuell wählen

### Screen B – Board / Turn
- Sichtbar:
  - Board mit Feldern (nummeriert)
  - Team-Tokens auf Positionen
  - “Team X ist dran” + Button “Würfeln”
  - Resultat Würfel + Bewegung animiert/step-by-step (minimal ok)
- Controls:
  - “Nächstes Team”
  - “Undo letzter Zug” (optional)
  - “Minigame jetzt starten” (Debug/Panik)

### Screen C – Minigame
- zeigt:
  - Titel, Regeln/Frage, ggf. Antwortoptionen
  - Countdown-Timer
- Ergebnis:
  - Physical: Gewinner-Team auswählen oder Punkte manuell vergeben
  - Quiz: richtige Antwort anzeigen + Punktevergabe (einfach: richtig = +X)
- Button: “Zurück zum Board”

### Screen D – End / Scoreboard
- Rangliste nach Punkten und/oder Zielerreichung
- “Neues Spiel” / “Spiel laden” (aus Autosave)

---

## 2. Datenmodelle (TypeScript-Types, grob)
### Team
- id: string
- name: string
- color: string
- score: number
- position: number

### GameSettings
- winCondition: "finish" | "pointsAfterRounds"
- boardLength: number
- maxRounds?: number
- diceOptions: number[] (MVP: [6] oder [6,8,10])
- minigameSelection: "random" | "manual"
- enabledMinigameIds: string[]
- mapId?: string (optional, falls feste Maps)

### MapDefinition
- id: string
- name: string
- length: number
- tiles: Array<{ index: number; type: "normal"|"minigame"|"bonus"|"penalty"; value?: number }>

### MinigameDefinition (JSON)
Gemeinsame Felder:
- id, name, type, description?, timeLimitSec
- scoring: { win?: number; lose?: number; correct?: number; wrong?: number }

Typ "physical":
- rules: string[]

Typ "quiz":
- question: string
- options: string[]
- correctIndex: number

### GameState
- phase: "setup"|"board"|"minigame"|"end"
- settings: GameSettings
- teams: Team[]
- currentTeamIndex: number
- round: number
- activeMinigameId?: string
- lastAction?: { ... } (optional für Undo)

---

## 3. Spielregeln (MVP-Default)
- Teams spielen reihum
- Ein Zug:
  1) würfeln
  2) bewegen
  3) Feld ausführen
- Feldtypen:
  - normal: nichts
  - minigame: Minigame starten
  - bonus: +Punkte (z. B. +3)
  - penalty: -Punkte (z. B. -3)
- Ende:
  - finish: erstes Team erreicht Position >= boardLength → Ende
  - pointsAfterRounds: nach maxRounds endet Spiel → höchste Punkte gewinnt

---

## 4. Minigame-Auswahl (MVP)
- “random”: Engine wählt zufällig aus enabledMinigameIds
- “manual”: Host wählt aus Liste

---

## 5. Persistenz (MVP)
- Autosave in localStorage nach jeder Aktion
- Button “Reset Save”
- Optional “Export/Import Save” als JSON (später)

---

## 6. Beamer-UX Anforderungen
- große Schrift, hoher Kontrast
- Fullscreen-freundlich
- alles klickbar mit Maus/Touchpad
- klare Statusanzeigen: Team dran, Timer, Runde, Punkte
