# Vision – Gruppenspiel (Mario-Party-Style für Jugendgruppe)

## Ziel
Ein browserbasiertes Gruppenspiel für bis zu ca. 70 Jugendliche, gespielt über Beamer/Screen, bei dem Teams über ein Spielfeld laufen und durch Minispiele Punkte sammeln bzw. als erstes das Ziel erreichen.

## Zielgruppe & Setting
- Spieler: Jugendliche einer Kirchengemeinde (große Gruppen, laut, aktiv)
- Modus: Teams (z. B. 4–12 Teams, 3–15 Personen pro Team)
- Hardware: 1 Laptop als Host + Beamer/Screen
- Netzwerk: optional lokales WLAN (für spätere Handy-Ansichten), MVP funktioniert auch ohne

## Kern-Fantasy (Spielgefühl)
“Mario Party für große Gruppen”: Auf dem Screen sieht man das Board, Teams sind dran, würfeln, bewegen sich, treffen Felder mit Events und spielen Minispiele.

## Core Game Loop
1. Setup: Teams anlegen + Spielparameter wählen
2. Spielrunde: Team ist dran
3. Würfeln → Team-Token bewegt sich
4. Feld-Trigger (Minispiel / Bonus / Strafe)
5. Minispiel: Regeln/Frage + Countdown → Ergebnis wird eingetragen
6. Punkte/Position aktualisieren → nächstes Team
7. Ende: Sieger anzeigen (Ziel erreicht oder höchste Punkte nach Runden)

## MVP Scope (muss im ersten spielbaren Stand drin sein)
- Host/Beamer-Ansicht (ein Spielleiter steuert alles)
- Teams + Scoreboard
- Map mit Feldern (einfach: Länge + Spezialfelder)
- Würfel (d6, optional Auswahl d8/d10 ohne Shop)
- Minigame-Runner:
  - “physical”: Regeln + Timer + Ergebnis manuell eintragen
  - “quiz”: Frage + Antworten + Timer + richtige Lösung (Punkte automatisch oder manuell)
- Minispiele als JSON definierbar (neue Minispiele hinzufügen ohne Codeänderung in der Engine)
- Autosave (localStorage) und “Panik-Buttons” (zurück zum Board, Timer neu)

## Non-Goals (explizit NICHT im MVP)
- echte Handy-Eingaben / Kahoot-Lobby / Accounts
- Map-Editor im UI (Maps können als JSON im Repo liegen)
- komplexer Shop/Itemsystem (Spezialwürfel später)
- Animationen/Sounds als Muss (nice-to-have später)

## Spätere Erweiterungen (Roadmap-Ideen)
- Teamsprecher-Ansicht auf Handy (Würfeln, Entscheidungen, Quizantwort)
- Spieler-Ansicht für alle (Kahoot-style Eingaben)
- Map-Auswahl + Map-Builder (vorher erstellte Maps importieren)
- Minigame-Pack-Import (Upload) + Kategorien/Filter
- Soundboard + Effekte

## Erfolgskriterien
- In 30 Minuten Setup ist ein Spielabend möglich
- Spiel läuft 60–120 Minuten stabil (Beamer-Lesbarkeit, klare Buttons)
- Neue Minispiele als JSON hinzufügen: erscheint in der Auswahl und ist spielbar
