# Игровая галактика v16.13 — «Энергокапсулы»

**Статус: INTEGRATION / QA CANDIDATE.** Новая игра реализована и подключена к платформе. Полный production-like HTTP/iframe browser QA в этой среде заблокирован браузерной политикой `net::ERR_BLOCKED_BY_ADMINISTRATOR`, поэтому сборка честно не называется FULL_QA_READY.

## Основа

- Эталон: `YouthGames_Platform_v16_12_FOUNDATIONS_FIRST_TAP_150MS.zip`.
- Проверенный SHA-256 входного ZIP: `24967fb8490a0205c3e26f7842ba4b4735261bbc56afc869fe1afa8b5fb578d1`.
- 16 исходных папок игр побайтово сравнены с эталоном: **0 изменённых файлов**.
- Общие `game-shell.js`, `game-shell.css`, `game-lifecycle.js`, `records.js`, `typography.css` не переписывались ради новой игры.

## Что добавлено

Новая игра `energy-capsules` / **«Энергокапсулы»** из направления «Ретро-орбита».

Основной цикл: выбранный герой занимает одну из четырёх фиксированных позиций перехвата. По четырём линиям движутся энергокапсулы. Правильная позиция в момент прибытия даёт очки, промах отнимает жизнь. После трёх промахов раунд завершается.

Режимы:

- `GAME A`: одна активная капсула, мягкое ускорение;
- `GAME B`: до двух активных капсул и более быстрый темп;
- `TURBO`: до трёх активных капсул, максимальное ускорение и двойная базовая цена перехвата.

Управление:

- телефон: четыре экранные кнопки ↖ ↗ ↙ ↘;
- ПК: Q/E/Z/C или 7/9/1/3;
- Space: пауза.

Добавлены pause, sound, новая партия, возврат в меню, fullscreen, итоговый dialog и локальные рекорды по режимам.

## Ресурсы

Созданы и установлены:

- `assets/icons/energy-capsules.webp` — 512×512, alpha;
- `assets/icons/energy-capsules-active.webp` — 512×512, alpha;
- `assets/titles/energy-capsules.png` — 1024×341, alpha, текст построен из локального Unbounded 800;
- `assets/splashes/energy-capsules.webp` — 1080×1920.

Иллюстрации собраны из канонических `corgi.png`, `cat.png`, общего космического background и игровых capsule/orbit элементов. Стандартные герои выбора не перегенерировались.

## Интеграция

- В `games-manifest.json` добавлена одна запись новой игры.
- `node tools/build-catalog.cjs`: **Catalog validated: 17**.
- Счётчики главной страницы обновлены с 16 до 17.
- `platform.js::asRows` получил узкий formatter для канонических records новой игры.
- Категория: `arcade`.
- Existing first-tap 150 ms механизм не копировался и остаётся владельцем `platform.js`.

## Функциональная проверка новой игры в настоящем Chromium renderer

Из-за запрета навигации в окружении страница была собрана для QA как standalone synthetic document с тем же production HTML/CSS/JS, локальными fonts/images как data URLs и mock localStorage. Это **реальный Chromium rendering/input test**, но не HTTP/iframe test.

Результат `qa/results/energy-capsules/synthetic-browser-results.json`:

| viewport | status | проверено |
|---|---|---|
| 360×800 | PASS | menu, hero, GAME A, реальный перехват, pause freeze, rotation/layout |
| 390×844 | PASS | всё выше + три натуральных промаха, result, запись records, GAME B, TURBO |
| 430×932 | PASS | menu, hero, GAME A, реальный перехват, pause freeze, rotation/layout |
| 1280×800 | PASS | desktop layout, Q/E/Z/C, Space pause |
| 1920×1080 | PASS | desktop layout, Q/E/Z/C, Space pause |

Сохранены screenshots splash/menu/game/result/landscape/desktop в `qa/results/energy-capsules/`.

## Каталог

Synthetic Chromium catalog test: **PASS**.

Проверено:

- каталог строит 17 карточек;
- карточка `energy-capsules` существует;
- короткий touch pointerup запускает entry новой игры после существующей 150 ms preview задержки;
- движение pointer более 10 px не запускает карточку.

Файл: `qa/results/energy-capsules/catalog-synthetic-results.json`.

## Статический аудит

PASS:

- SHA исходника совпал с заявленным пользователем;
- 17 уникальных manifest ID;
- все новые manifest paths существуют;
- 12 ссылок HTML новой игры проверены, 0 missing;
- четыре новых bitmap-ресурса декодируются;
- alpha подтверждён для обеих иконок и title PNG;
- `node --check` проходит для `platform.js`, `catalog.generated.js`, `games/energy-capsules/game.js`, обновлённого `qa/browser-qa.cjs`;
- 16 исходных game directories не изменены.

## Что НЕ подтверждено

Chromium 144 в данном окружении блокирует любую настоящую URL-навигацию (`http://127.0.0.1`, container IP, `file://`, внешние HTTP/HTTPS) с `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Поэтому не выполнены:

- реальный local HTTP запуск platform → iframe → game;
- 17×3 = 51 production-like HTTP mobile rows;
- реальная network/HTTP 404 телеметрия из браузера;
- reload persistence через реальную URL-навигацию;
- физическое Android-устройство.

`qa/browser-qa.cjs` обновлён для `energy-capsules`: добавлена игровая поверхность и реальный сценарий перехвата. Его нужно запустить в нормальном Playwright окружении с доступной URL-навигацией перед маркировкой FULL_QA_READY.

## Приёмка следующего шага

На нормальном окружении выполнить:

1. `python3 -m http.server 8080` из корня платформы;
2. browser QA для 17×3 мобильных сценариев;
3. отдельно `energy-capsules` на 1280×800 и 1920×1080, iframe + standalone;
4. проверить catalog first tap, swipe-cancel, result storage после реального reload;
5. регрессию существующих 16 игр.
