# STURMGLAS – Krabbenkönig (Spieltest)

Spielbare Browser-Prototyp-Version des ersten Endgegners; die Hauptkampagne ist unverändert.

## Sofort testen

https://sturmglas-krabbenkoenig-test.vercel.app/

## Steuerung

- iPhone: Finger innerhalb der Szene ziehen, FEUER halten, AUSWEICHEN antippen.
- Tastatur: Pfeiltasten/WASD bewegen, Leertaste feuern, Shift ausweichen.
- ⚠ Roter Scherenhinweis: vor dem Angriff aus der Zielzone kommen.
- ✦ Goldener Schwachpunkt: nach der Scherenattacke schnell mit der Kanone treffen.

## Technik

Die Basis ist eine HTML-/Canvas-Demo mit dem bestehenden STURMGLAS-Wasser-Fragmentshader (WebGL-1 mit 2D-Fallback), nicht Unreal Engine. Die Originalgrafiken werden im Vercel-Deployment als Asset-Dateien bereitgestellt: `assets/bottle.webp`, `assets/water.webp`, `assets/crab.webp`, `assets/ship.webp`, `assets/beach_scene.webp`, `assets/trophy-beach.webp`. Für eine lokale Kopie müssen diese Bilder im Unterordner `assets/` liegen.

Die Bosslogik ist in `boss.js`, der Einstieg in `index.html`. Sieg/Niederlage/Neustart und mobile Steuerung wurden in einem emulierten mobilen Chromium-Browser getestet. Der Test direkt auf einem iPhone steht noch aus.
