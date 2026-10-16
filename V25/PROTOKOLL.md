# STURMGLAS – Verbindliches Protokoll (V25)

Stand 16.10.2026. Dieses Repository ist die zentrale fortlaufende Referenz. Chatbeiträge werden nicht automatisch wörtlich importiert; wichtige Anforderungen und Fortschritte werden manuell protokolliert.

## Unveränderliche Entscheidungen
- 5 Welten × 3 Akte = 15 Akte; Akt 2 Abendstimmung; Akt 3 Endgegner.
- Hochwertiges geneigtes Glas auf Muschel-/Sandboden wie die ursprüngliche Muschelküste. Eine Glasgrafik, keine überlagerte zweite Flasche. Alte Master-Vorlage von 14.10. behalten.
- Der bewährte Wasser-Shader und Füllstand bleiben unverändert.
- Glas-Kollisionen und sichtbarer Glasbruch/Glas-Zerbersten bei Schiffbruch.
- Schiffe: Floß (3,2s), Fischerboot (2,6s), Segelschiff (1,85s), Galeone (1,25s) Schussintervall; unterschiedliche Stärke, Stabilität und Wendigkeit.
- Im Bosskampf auf Boss tippen zum Schießen, dabei nicht steuern; Ausweichknopf ohne sichtbaren Timer, Fisch-Ausweichen vertikal.
- Bosse: Krabbe (geschlossene Scheren geschützt, Öffnung nach Schlag), Tiefenzahn (Tauchen / offenes Maul), Kraken (hochwertiger Kopf / 2–3 Tentakel), Leviathan (U-Wasserbogen / Seitenstoß), Skelettadmiral (Geistergaleone mit langsamen Kanonenkugeln).
- Zufällige kleine hochauflösende Felsen, Bretter und Wrackteile in den normalen Levels, mehr bei höherer Schwierigkeit, korrekte Kollision, härtere Stöße in Akt 2; keine schlechten Wurm- oder Fischbilder.
- Abenteuerkarte mit sichtbaren tatsächlichen Erfolgen, Werft, Kapitänskajüte mit Trophäenschrank und Boss Rush durch fünf Bosse.
- Neue Versionsstände nur als neue nummerierte Builds mit bestandenen Tests; nicht still auf ältere Dateien zurückspringen.

## Sichtbare Nutzeränderungen
- 15.10.: Vier hochwertige Bosse; Boss Rush; Echt-Animationen statt bewegter Standbilder.
- 15.10.: Neues Gebiet 5, Geistergaleone und Skelettadmiral.
- 16.10. vormittags: geneigte Flasche im Muschelsand und Glasbruch unbedingt zurück.
- 16.10. 13:12: dauerhaftes Protokoll aller Änderungen und tatsächlichen Arbeitsstände gegen wiederholte Neustarts.
- 16.10. 13:14: V25 vollständig säubern, doppeltes Rendering und ungebrauchte Dateien finden, komprimieren, alten Qualitätsstand sichern und überholte Versionen danach löschen.

## Fehleranalyse
- V2.0-Quellarchiv hat 49 Dateien. bg0 enthält bereits eine Flasche; darüber wurde bottle.webp als zweite Flasche gelegt.
- V2.0 hat Schiffsschaden, aber keinen eigentlichen gezeichneten Glasbruch.
- Vorhandene Skripte laden zahlreiche Assets global ohne Levelbezug.

## Schutzregeln
Keine alten aktiven URLs oder Backups löschen, bevor V25 wirklich fertig und öffentlich nachweisbar erreichbar ist. Alte Master-Flaschen-Vorlage und unverändertes Wasser sichern.

## Journal
- 2026-10-16: Audit gestartet; 5-Meere-Ausgangspaket und ältere Strand-Flaschen-Master-Vorlage identifiziert; doppelte Bildlagen und fehlenden Glasbruch nachgewiesen. V25-Branch angelegt.
