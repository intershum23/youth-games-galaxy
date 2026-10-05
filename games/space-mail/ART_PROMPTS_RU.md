# Графика «Космическая почта» — происхождение и воспроизведение

Использован встроенный image_gen. Оригинальные PNG находятся в `assets/icons/space-mail.png`, `assets/icons/space-mail-active.png`, `assets/splashes/space-mail.png`. Для сайта экспортированы WebP с alpha там, где требуется, через `tools/export-space-mail-art.cjs`. Шрифтовый PNG создаёт `tools/build-retro-titles.cjs` из локального Unbounded 800. Контрольные суммы итоговых ресурсов находятся в ASSET_MANIFEST_space-mail.json.

## Основная иконка

Референсы: существующие `assets/corgi.png` и `assets/cat.png` (второй закрепляет общий стиль, но на иконке только корги).

> Create a production game catalog icon for existing Russian mobile game series Игровая галактика, new game Космическая почта. Style reference Image 1 is Captain Corgi identity, adult orange-white corgi in white astronaut suit with orange trim. Image 2 is Cosmic Cat identity, white cat with mandatory equal round orange glasses. Generate a SINGLE square icon with Captain Corgi only, holding a sleek violet glowing mail parcel with white envelope glyph, three floating smaller cargo parcels with star, moon and ring emblems. Premium polished 3D cartoon, crisp plush fur and white suit material, warm ivory highlights, hot pink magenta violet and tiny cyan highlights consistent with existing cosmic games. Fully transparent background, all ears paws and parcels fully inside image with 12% transparent margin, centered compact silhouette. No words, no numbers, no UI buttons, no scenery, no backing disc, no pixel art. This is catalog default pose: smile both eyes open, holding parcel across chest.

## Активная иконка

Референс/цель редактирования: предыдущая основная иконка. Прозрачный фон сохраняется.

> Edit this transparent catalog game icon. Keep the exact same Captain Corgi identity, white orange astronaut suit, all four violet parcels, parcel glyphs, fur, lighting, camera, color palette and silhouette. Change ONLY the facial expression to playful winking ONE eye and a broader smile, slightly raise the parcel 3% but preserve proportions. This is the active hover second frame of the same icon, not a different scene. Fully transparent background, no words or UI. Keep all ears paws objects intact.

## Заставка

Референсы: `assets/splashes/energy-capsules.png`, `assets/corgi.png`, `assets/cat.png`.

> Generate a final 9:16 portrait game splash illustration for Космическая почта in the existing Игровая галактика premium space game series. Image 1 reference is existing Капсулы splash: match beautiful magenta violet nebula, electric pink neon, rich cinematic cartoon polish, modern non-pixel universe. Image 2 identity Captain Corgi adult orange-white corgi in white astronaut suit with orange trim. Image 3 identity Cosmic Cat white cat with mandatory equal-size round orange glasses white orange space suit. Scene: both heroes in lower-middle sorting floating violet mail parcels with star, crescent moon, ringed-planet stamps inside orbital station overlooking luminous nebula. Large expressive recognizable characters, dimensional white suits, neon railings but not UI. Upper fifth reserved for ornate title, write exactly two lines 'Космическая' then 'почта' in bold rounded geometric Unbounded-inspired Cyrillic, warm ivory and peach upper faces transitioning hot pink bottom, deep violet extrusion, magenta orbital halo and small stars, like reference title. No other lettering. Bottom 15% calm dark nebula reserved for real HTML start button. Do not draw any button, score, HUD, menu, card, border, watermark. Full bleed portrait one background, crisp not blurry, avoid dominant yellow-blue pairing. Preserve both hero identities.

## Точное название

Иллюстрационная надпись внутри заставки сгенерирована в стиле серии; точную принадлежность её нарисованных букв шрифту не утверждаем. Отдельное прозрачное название на карточке, выборе и игровом экране использует реальную гарнитуру Unbounded: 1600×500, два ряда, тёплый ivory/peach → pink градиент, violet extrusion, pink орбитальная линия и звёзды. Это кодовый экспорт типографики, не подмена требуемого шрифта произвольной нейросетевой надписью. Montserrat остаётся UI-шрифтом.

## Объекты и позы

Посылки, сроки, очередь и приёмники — законченные DOM/CSS-объекты с актуальным состоянием движка. Они не вырезаны из иллюстрации интерфейса. Выбор героя использует утверждённые настоящие портреты. Здесь оператор задаёт адрес; отдельные позы ловли не требуются. Для игр с движением/отскоком/прыжком, напротив, нужен отдельный набор реальных игровых поз.
