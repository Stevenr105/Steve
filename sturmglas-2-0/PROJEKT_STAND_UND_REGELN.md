# STURMGLAS 2.0 – Verbindlicher Entwicklungsstand / Änderungsregeln
Stand: 20.10.2026. Diese Datei ist die *Projekt-Referenz für Folgeänderungen*, kein Beweis, dass sämtliche Wünsche bereits fertig implementiert und auf iPhones getestet wurden.

## 1. Technischer Ausgangspunkt (verifiziert)
- GitHub-Repo: `Stevenr105/Steve`
- Hauptzweig für STURMGLAS 2.0: `sturmglas-2-0-fuenf-meere`
- Code: `sturmglas-2-0/index.html`, `game.js`, `water.js`
- Release: https://sturmglas-2-0-fuenf-meere.vercel.app/
- Vercel-Projekt `sturmglas-2-0-fuenf-meere`, Deployment `dpl_AoL2mB1S7b1dpRJnMUohwa7Pmuon`, Status READY, öffentliche Anmeldung deaktiviert.
- Build-Stand der Veröffentlichung: 49 Dateien inkl. 46 WebP-Dateien (laut vorhandener Projektdokumentation). GitHub enthält gegenwärtig die drei Quellcode-Dateien; sämtliche binären Grafiken sind noch nicht langfristig im Git-Repo gesichert.
- `sturmglas-cinematic`, `sturmglas-boss-rush`, `sturmglas-boss-quartett` sind historische/testbezogene Zweige, **nicht** die neue Basis für STURMGLAS 2.0.
- Keine Aussage über vollständige Funktions- oder Performance-Abnahme auf dem konkreten iPhone ohne erneuten Test.

## 2. Unverhandelbare freigegebene Designvorgaben
- Gebiet 1 (Muschelküste) ist die visuelle Master-Referenz für Perspektive, Flaschenqualität, Füllstand und Wasserintegration. Shader/Wassertextur/-animation/-reflexionen **nicht ohne ausdrücklichen Auftrag verändern**.
- Für die anderen Gebiete keine doppelt gerenderte Flasche, keine unpassende Overlay-Schicht. Gleichwertige grafische Qualität; anderes Szenenbild und Untergrund.
- Akt 2 ist **in jedem Gebiet Abendstimmung** und mechanisch schwieriger.
- Hochwertige, fotorealistische Render-Grafik für Bosse, Steine, Treibholz, Wrackobjekte, Schiffe. Keine billigen Wurm-/Comicobjekte und keine sichtbaren rechteckigen Ausschnitte.
- Bossanimationen müssen sichtbar *wirkliche Bewegungen* zeigen: Scheren öffnen/schlagen, Maul öffnet/schnappt, Tentakel biegen sich und schlagen zu, Seeschlangenkörper gleitet durchs Wasser. Nicht nur starres Bild hin- und herschieben. 24 FPS Animationsstil als mögliche Vorlage, flüssige Spielsteuerung.
- Bossarena dichter am Geschehen, eigenes Schiff etwas größer, Glasränder bleiben sichtbar. Kreaturen sind durch Masken, Spritzwasser, Tiefe und Licht glaubhaft im Wasser eingebettet.
- Spieler bei der Navigation: Finger ziehen. Bei Bossen direkt auf Kreatur tippen/drücken zum Zielen und Schießen; während des Schießens keine gleichzeitige Schiffssteuerung. **Kein separater FEUER-Knopf**. Separater schneller AUSWEICHEN-Knopf ohne sichtbaren Cooldown; bei Tiefenzahn ausdrücklich auch nach oben/unten ausweichen.
- Schiffsprogression: Floß (schwach/träge) → Fischerboot → Segelschiff → große Galeone/Galeere (robust/stark/wendig). Vorgeschlagene Kanonenintervalle: 3,2 / 2,6 / 1,85 / 1,25 Sekunden; als Balance-Startwerte, weiter testen.
- Hindernisse in normalen Akten: glaubhafte Einzelobjekte aus Steinen, Brettern, Treibholz, Wrackteilen; zufällige Platzierung, in schwierigeren Akten mehr Objekte, präzise Kollision/physischer Abprall. Unpassende Standard-Fische und Würmer *nicht* einfach wieder aktivieren.
- Karte: illustrierte Seekarte mit tatsächlichem Fortschritt, Sternen, Münzen und Freischaltungen. Historische Werft mit Schiffen und Upgrades und Kapitänskajüte mit näherem Trophäenschrank als anwählbare Orte **in der Karte**. Trophäen nur als gewonnen darstellen.

## 3. Verbindlicher Spielumfang
Fünf Gebiete mit je drei Akten = **15 Akte**:
1. **Muschelküste** – Strand, Felsen/Treibholz, abendlicher Akt 2, Krabbenkönig.
2. **Offene See** – Ozean, Tiefe und maritime Hindernisse, abendlicher Akt 2, Tiefenzahn.
3. **Höhle** – Felsen/Kristalle, dunklere Schatten, abendlicher Akt 2, Kraken.
4. **Piratenschiff** – Schiffswelt/Wracks, Sturm, abendlicher Akt 2, Leviathan.
5. **Die verfluchte Flotte** – Wracks und Kanonenfeuer, abendlicher Akt 2, Skelettadmiral auf großer Galeone/Galeere.

Zusatzmodus: **BOSS RUSH** als fester Ort auf der Karte. Fünf Bosse hintereinander; Schiffszustand mit begrenzter Reparatur dazwischen; Sieg-/Fortschrittsanzeige; erneut spielbar.

## 4. Bossregeln (nicht vereinheitlichen!)
- **Krabbenkönig:** Beine teilweise im Wasser; Scheren bewegt/geschlossen = Panzer schützt. Angriff gut sichtbar ankündigen, Spieler weicht aus, kurze verwundbare Öffnung direkt danach. Direkter Schuss auf geschlossene Scheren ohne Schaden.
- **Tiefenzahn:** Unterwasserschatten, halber Kopf am Wasser, kein ständig sichtbarer Körper. Kurzes plötzliches Auftauchen mit **offenem Maul**; nur dann verwundbar UND gefährlich. Ausweichen insbesondere vertikal.
- **Kraken:** hochwertiger teilweise versunkener Kopf, Texturen mindestens Krabben-Qualität; separat deformierende Tentakel mit Saugstruktur. 2–3 schnelle Schläge an wechselnden Stellen; wenn Augen offen/Kopf sichtbar, gezielt schießbar. Keine unansehnlichen Wurmgrafiken.
- **Leviathan:** sehr schnell. Schatten kündigt beliebig positionierten **umgedrehten U-Körperbogen** an; später eine Angriffslinie und langgestreckter Kopf/Körper-Schlag von links oder rechts. Nur kurze Trefferfenster, fließender Übergang ins Wasser.
- **Skelettadmiral:** großer bewaffneter Geister-Galeonen-Boss, sichtbarer Skelettpirat. Große, relativ langsame Kanonenkugeln, ausweichbar; Spieler muss mit eigenem Kanonenfeuer reagieren. Grafisch derselbe hohe Standard.

## 5. Änderungsregeln – ab jetzt zwingend
1. **Eine Hauptversion:** Stets den nachweislich neuesten funktionsfähigen `sturmglas-2-0-fuenf-meere`-Code abrufen. Keine stillen Neustarts mit einem älteren Prototyp.
2. **Nur genannte Dimension ändern:** Eine neue Benutzeranweisung ist ein Delta, kein Anlass, vorhandene Funktionen, Grafiken oder Entscheidungen zu entfernen.
3. **Vorher-/Nachher-Protokoll:** Vor der Bearbeitung Branch/Commit, zu ändernde Dateien und unverändert zu haltende Bereiche erfassen. Nachher Änderungen in CHANGELOG festhalten.
4. **Wasser sperren:** Jede Änderung an `water.js` oder dem abgestimmten Füllstand braucht explizite Zustimmung.
5. **Getrennte Stati:** "gewünscht", "programmiert", "lokal getestet", "auf Vercel READY", "am echten iPhone geprüft" klar auseinanderhalten.
6. **Zuerst reparieren, dann veröffentlichen:** Wenn ein Upload oder Test fehlschlägt, Diagnose dokumentieren; nicht wiederholt den gesamten Build neu erfinden. Kein neuer Link, bevor die Deployment-URL wirklich bestätigt ist.
7. **Nichts als abgeschlossen deklarieren**, solange zentrale Spielmechanik oder grafische Abnahme fehlt. Insbesondere 24-FPS-Videos und starre Sprite-Bewegung nicht mit interaktiver vollständiger Charakteranimation verwechseln.
8. **Vollständige Ressourcen sichern:** Alle 46 WebP-Assets dauerhaft versioniert bereitstellen, sonst droht trotz GitHub-Code erneut Grafikverlust.

## 6. Nächste konkrete Arbeit
Die veröffentlichte Version 2.0 mit fünf Meeren als **Baseline** gegen diese Liste abgleichen. Fehlende / nur provisorische Punkte pro Abschnitt markieren (besonders echte Bossanimation, Szenenqualität und mobile Steuerung). Dann inkrementell die benannten Lücken beheben, End-to-End auf Safari testen und kontrolliert als Version 2.1 veröffentlichen – **nicht** wieder STURMGLAS 2.0 von vorne beginnen.
