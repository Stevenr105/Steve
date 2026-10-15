# STURMGLAS – Final Build 1.0
## Verbindliche Produktions- und Abnahmespezifikation
Stand: 15. Oktober 2026

## 1. Produktziel
Ein vollständiges, auf iPhones in Safari direkt über HTTPS spielbares nautisches Action-Geschicklichkeitsspiel mit vier Gebieten, jeweils drei Akten, einer interaktiven Abenteuerkarte, Werft und Trophäenraum. Die hochwertige fotografische Flaschenoptik, sichtbares Wasser, passgenaue Kollisionen und durchgängig zuverlässige Touchsteuerung haben Vorrang vor zusätzlichen grafischen Effekten. Ein Release darf nicht als spielbar bezeichnet werden, bevor Start, Navigation, alle Akte und Speichern geprüft sind.

## 2. Unantastbare Referenz
**Gebiet 1, Akt 1** der zuletzt vom Nutzer ausdrücklich gelobten Version dient als visuelles und technisches Master: dieselbe Flaschenform, Flaschenproportionen, Glasrand, Bodenintegration, räumliche Komposition, Wassertextur, Shader, Füllhöhe (ungefähr drei Viertel), Wasser- und Bootsbewegung, Reflexe. **Wasser und Füllstand nicht ändern.** Die Flasche muss in allen Gebieten dieselbe Qualität haben und darf nicht durch eine neue KI-generierte Flaschenform ersetzt werden. Die vom Nutzer bereitgestellten Screenshots der älteren Gebiete 2–4 sind verbindliche Atmosphärenreferenzen, nicht zum Einblenden samt UI vorgesehen.

## 3. Zwölf Akte / Atmosphäre
| Gebiet | Akt 1 | Akt 2 – immer Abend | Akt 3 – Boss |
|---|---|---|---|
| 1 Muschelküste | Heller tropischer Strand, ruhige Dünung, Treibholz | Goldener Sonnenuntergang mit warmen Reflexen, erste stärkere Wellen | Bedrohlicher Strand, Küstennebel, **Klauenkönig** |
| 2 Offene See | Weites Meer, Walsilhouetten, tiefes Blau, Schwertfische | Abendhimmel über offener See, golden-blaue Kontraste, Böen | Hoher Seegang, Sprühwasser, **Tiefenzahn** |
| 3 Dunkle Höhle | Natürliches Höhlengestein, Kristalle und Lichtkegel, kein Strand | Abendlicht von Höhleneingängen, kühles Inneres, warme Ränder | Dichtes Dunkel, biolumineszente Effekte, **Krake der Tiefe** |
| 4 Piratenschiff | Schiff, Hafenreste/Wrackteile, Segel und Taue | Abend über der Piratenbucht, glühende Laternen und stärkere Böen | Dramatische Sturmfront, Blitze, **Kapitän Totenbrand** |

**Gebietswechsel:** Nur die Kulisse/Objekte und Wetterintensität ändern; niemals eine zweite komplette Flasche oder ein buntes SVG über die bekannte Flasche legen. Jede Szene bekommt ein eindeutiges Asset, das beim Wechsel auf genau einen Hintergrund gesetzt wird.

## 4. Spielmechanik
- 4 Schiffe in der Werft: Floß, Fischerboot, Segelschiff und Galeone; vorhandene Werte und Kaufprogression respektieren. Waffen: Entermesser, Stahlsäbel, Kapitänsklinge, goldener Säbel.
- Schiff folgt dem Finger oder optional Gyro. Bei aktiver Touchsteuerung darf die Seite nicht scrollen, alle Menüknöpfe bleiben anklickbar. Sichtbare Treffer- und Schadensanzeige; Pause unterbricht Zeit und Bewegung vollständig.
- Treibholz und Felsen sichtbar kleiner als zuvor; kontinuierliche Kollision entlang der Bewegungsstrecke beider Objekte, passend zum dargestellten Umriss. Kollision muss das Schiff abdrängen, auch während einer kurzen Schaden-Unverwundbarkeit. Keine unsichtbaren großen Trefferkreise, kein Durchgleiten.
- Schwertfisch: startet **vor** dem Schiff im Strömungsverlauf, springt in Schwimmrichtung aus dem Wasser, taucht vollständig ab, erscheint zufällig **weiter voraus** in derselben Richtung; nie hinter der letzten Position. Während er taucht, besteht keine Kollision. Tentakel dürfen später auch hinter oder seitlich wieder auftauchen.
- 10 Münzen je normalem Akt; persistente Fortschritte; 80 sammelbare Münzen aus 8 Nicht-Boss-Akten. Endgegner erst durch Kampf erfolgreich abschließbar.

## 5. Endgegner: sichtbar, steuerbar, fair
Vier eigene, hochwertige Gegnermotive und Animationen, jeweils passend zum Gebiet. Keine statisch gezeichnete Figur, die neben einer kampflosen Schaltfläche steht. Drei lesbare Phasen: **Angriff ankündigen** (rot), **angreifen/ausweichen**, **Verwundbarkeit** (goldene Aura). Schuss ist auf mittlere Distanz möglich, Säbel effektiv im Nahbereich; sichtbare Reichweiten, Trefferreaktion, HP-Leiste und Rückmeldung bei verfehltem Treffer. Nach jeder Attacke eine sichere, erkennbare Kontermöglichkeit. Boss 1 Klauenschlag, Boss 2 Ansturm, Boss 3 Tentakelvorwarnung, Boss 4 Kanonensalve/Enterphase.

## 6. Abenteuerkarte
Verbindliche Stilreferenz: vom Nutzer bereitgestelltes Bild einer auf Holz liegenden illustrierten Seekarte mit vier Stationen Muschelküste, Offene See, Höhle und Piratenschiff. **Die Karte ist ein aktives Menü**, keine bloße Fotografie mit nutzlosen gedruckten Schaltflächen. Jede Station hat drei anklickbare Akte. Fortschritt wird dauerhaft und eindeutig sichtbar: offenes Akt-Symbol, Schloss auf noch gesperrtem Akt, Auszeichnungssterne für bestandene Akte, Goldbestand und gesammelte Münzen. Bereits gespielte Akte bleiben wiederholbar. Bei einem neuen Spielstand dürfen keine erfundenen Erfolge angezeigt werden. 

Sternlogik für die neue Version: 1 Stern für Abschluss, 2 Sterne bei mindestens 7/10 Münzen, 3 Sterne bei 10/10 Münzen und mindestens 50 % Rest-Rumpf. Bossakt: 1 Stern Sieg, 2 Sterne Sieg mit mindestens 30 % Rest-Rumpf, 3 Sterne Sieg mit mindestens 60 % Rest-Rumpf. Bestwert je Akt speichern; frühere Spielstände ohne Sterndaten nicht verlieren, sondern konservativ als absolviert anzeigen.

## 7. Werft
Kulisse: die vom Nutzer ausdrücklich akzeptierte **alte hölzerne Werft am Wasser bei Sonnenuntergang** mit realen Schiffen im Trockendock und Hafen, warmen Laternen und Seilen. Keine flache, generische Shop-Tabelle. Funktionale Overlay-Karten für die vier bekannten Schiffe plus Waffen; Kaufkosten und Kontostand sichtbar, ausgewähltes Schiff deutlich markiert, Upgrades nur bei ausreichendem Gold, Zurück-Taste ständig erreichbar. Keine neuen fiktiven Ressourcen (Holz/Metall/Seile) als Kaufbedingung ohne eigene Freigabe.

## 8. Trophäenraum
Kulisse: **Kapitänskajüte**, Kamera ein bis zwei Schritte näher zum großen dunklen Schrank, warme Messinglampen und verglaste Meeresfenster. Trophäen werden nach den tatsächlichen Erfolgen in **klar erkennbaren Regalplätzen** sichtbar; noch gesperrte Plätze leer oder schattiert. Berühren zeigt die Trophäe groß mit Titel, Herkunft und freigeschaltetem Status. Fortschritt 0–4 Boss-Trophäen plus tatsächliche Münz-/Flottenleistungen; keine vorgetäuschten Erfolge durch im Hintergrundbild fest eingezeichnete Trophäen.

## 9. Technik und Veröffentlichung
- iPhone Safari als primäre Zielplattform; Browser-WebGL/WebGPU mit sicherem Fallback. Kein Unreal- oder Expo-Etikett auf einer reinen Browserversion.
- Asset-Bilder vorzugsweise WebP, auf Mobilauflösung angepasst, mit Preloading der unmittelbar benötigten Spielgrafik und nachvollziehbarem Ladeindikator.
- Dynamische Grafikqualität: hochwertiger Standard, reduzierter Akku-Modus ohne Änderung von Kollision, Bewegung, Speicherstand oder Spiellogik. Beim Umschalten nie den Level neu beginnen.
- Kompatibles Savegame im localStorage mit Schema-Version und defensiver Migration; kein Überschreiben von Fortschritten bei einem Release. Wiederholbarkeit von 12 Akten, Shop-Käufe und Trophäen.
- GitHub als Quellcode, Vercel als HTTPS-Hosting, publizierter iPhone-Spiel-Link, Version im Menü erkennbar. Links erst nach bestätigter Bereitstellung mitteilen.

## 10. Abnahmetests vor Finalfreigabe
1. Hauptmenü öffnet ohne Anmeldung/Fehler; Karte und alle Schaltflächen funktionieren auf einer iPhone-typischen schmalen Bildschirmbreite ohne Seitenscrollen.
2. Gebiet 1 Akt 1 als Pixel-/Funktionsreferenz: Wassergrafik, Flaschenfüllstand und Flaschenmaske unverändert.
3. Gebiet 1 Akt 2 sowie Gebiete 2/3/4 verwenden jeweils die richtige Kulisse, ohne Doppelglas oder überlagerte Strandgrafik.
4. Start, Pause, Ende, erneutes Spielen und Rückkehr zur Karte funktionieren in allen 12 Akten.
5. Kleine Felsen und Holzstücke: bei Berührung kollidiert das Schiff am sichtbaren Objekt; kein Durchrutschen.
6. Schwertfisch taucht komplett ab und springt bei neuem Erscheinen nur weiter voraus; kein Schaden während der Unterwasserphase.
7. Alle vier Bosse sind mit Schiffsteuerung, Schuss und Säbel tatsächlich besiegbar, mit klar sichtbarer Gefahren- und Konterphase.
8. Erspielte Münzen, Sterne, gekaufte Schiffe und Trophäen bleiben nach Schließen und erneutem Öffnen erhalten.
9. Werft und Trophäenkajüte besitzen die freigegebenen Motive; Bedienelemente und tatsächlicher Fortschritt sind unabhängig vom Hintergrundbild.
10. Veröffentlichung über öffentlichen HTTPS-Link wird im Browser erfolgreich geladen. Performance auf echter Hardware testen; 60 FPS anstreben, bei Bedarf stabilen 30-FPS-Modus bieten.

## 11. Nicht Bestandteil der Abnahme
Keine weiteren Änderungen des als perfekt bestätigten Wassers. Keine zusätzliche zweite Flasche. Keine grundlegende Änderung der Schiffskaufökonomie. Keine Platzhaltergrafiken anstelle der freigegebenen Stilvorlagen. Kein als Unreal bezeichnetes WebGL-Spiel.

**Freigabekriterium:** Ein spielbarer Final-Build 1.0 existiert erst, wenn die Umsetzung dieser Spezifikation und die Prüfschritte 1–10 nachgewiesen sind. Dieses Dokument allein ist keine fertige, getestete Spielversion.