# v16.18: установленные иллюстрации и промпты
Использован встроенный image_gen, режим reference style-transfer для названий и stylized-concept для сцен. Новые заставки не создавались, герои и позы сохранены. Рабочие ресурсы: assets/titles/{energy-capsules,space-mail,radio-beacon}.png и assets/retro-props/{capsule-station,mail-terminal,radio-observatory}.{png,webp}. PNG названий имеют реальный альфа-канал. Нативные размеры и SHA перечислены в ASSET_MANIFEST каждой игры. Растровое начертание повторяет референс, оно не выдаётся за детерминированную выгрузку реального файла Unbounded. Все живые шрифты UI остались Montserrat/Unbounded.

## Названия — общий промпт
Use case: style-transfer. Production transparent PNG title logo for browser game. Reference image 1 is the exact style reference: Sudoku logo. Create a SEPARATE title reading exactly "{title}" in Russian. Match reference tightly: HUGE plump heavy gently slanted rounded Unbounded ExtraBold-inspired letters, glossy cream-to-peach-to-coral-to-hot-pink VERTICAL gradient, cream bevel highlight, thick dark violet extruded depth, bright pink outline; bright magenta/electric violet orbital swoosh and little gold-white sparkles behind the word. Wide compact centered horizontal logo; letters occupy 75% width, NO large empty ring framing tiny letters. For Космическая почта use balanced TWO lines with large equal-weight letters. Surround ONLY with {decor}. No Sudoku elements, no other words, no characters, no UI/buttons. Genuine alpha-transparent background outside the logo. Keep generous safe margins, no clipped elements. High resolution crisp mobile/desktop game wordmark. Exact Cyrillic spelling, no extra letters.

| title | decor |
|---|---|
| Капсулы | floating glossy energy capsules, no numbers, no board tiles |
| Космическая почта | small glossy purple parcels and envelopes, no board tiles |
| Радиомаяк | small glossy pink radio receiver and antenna signal arcs, no board tiles |

## Сцены — общая оболочка промпта
Use case: stylized-concept. Asset type: browser game PLAY FIELD background illustration, square composition. {scene} Full bleed square image, crisp at 1024+, no typography or watermark. Lighting rich purple, fuchsia, peach, warm white. Preserve legibility for overlays with dark unobtrusive central background.

### capsule-station
Front-view whimsical premium 3D space station energy intake chamber, violet glass floor circular reactor dais positioned bottom center at 83% height, FOUR bright capsule launch tubes protruding from left/right wall at 14% and 54% image height, magenta coral copper chrome accents, softly glowing pink energy pipes around edges. Center hero region between 45% and 80% height MUST be clear for interactive character overlay. No rails/lines across center, no people/animals/capsules. Bottom-center reactor vivid bright pink white core. Mid-center safe dark violet open play space. Cinematic toy-like glossy materials, welcoming colorful videogame environment, not technical schematic.

### mail-terminal
Front view whimsical premium 3D intergalactic mail sorting terminal. Purple magenta glossy space-station desk/conveyor curving across bottom third, illuminated copper pink chrome rails at sides, three small destination windows at very top showing orange pink star nebula, lavender moon, coral ringed planet. Center area 30% to75% height intentionally spacious and dark violet for overlayed LARGE parcel and real UI. No text, no numbers, no symbols, no controls, no parcel, no people. Colorful polished toy-like videogame location, airy violet glass and coral light, charming detailed scene rather than blueprint.

### radio-observatory
Front-view premium whimsical 3D space observatory radio desk environment. Panoramic violet magenta nebula window across upper third with small distant satellite transmitting pink rings to station, vivid copper coral metallic window frame and glowing pink LED strip. Bottom two thirds dark violet transparent polished glass console, open uncluttered central area for real interactive receiver and tuning controls. No receiver, no people, no text, no numbers, no UI dials, no buttons baked in. Colorful rich toy-like glossy videogame illustration, cozy space listening station, subtle stars. No yellow/blue dominant pairing.

## Музыка
Оригинальная композиция «Тихая орбита», 64 сек., стерео MP3 128 kbit/s. Воспроизводима: tools/build-ambient.py. Четыре мягких аккорда Am9/Fmaj7/Cmaj7/Gsus, редкие тихие колокольчики, без ударных и сторонних семплов. Проигрыватель ambient-music.js, громкость .22, один экземпляр, gesture unlock, mute preference, pause при игре/другой панели/скрытии вкладки. Сгенерированный WAV — промежуточный, в сборке только MP3.
