# Other People's Houses · بيوت الآخرين

A story game in the style of point-and-click life sims: a town map, houses with rooms you can walk into, characters with daily schedules, tasks, money, a bag, a phone, and choices that decide how each person's story ends. No sexual content.

لعبة قصة بأسلوب ألعاب "التنقل والضغط": خريطة بلدة، بيوت بغرف تدخلها، شخصيات لها جدول يومي، مهام، فلوس، شنطة، جوال، وقرارات تحدد نهاية كل شخصية. بدون أي محتوى جنسي.

## Chapter 1 — Elias · الفصل الأول — إلياس
- Arrival in Saltmere, the motel, the night on the bench.
- Elias's cottage: living room, kitchen, his bedroom (private), your room, the shed.
- Town: Main Street, Sami's grocery, Marco's café, the harbor, the clinic.
- A living house: Elias fishes, showers, cooks, mends nets, plays chess and dozes on a schedule (Sundays are different). Martha cleans on Tuesdays and Fridays.
- You look after yourself too: shower, eat. Neglect gets noticed.
- 5 endings. Snoop in Elias's private things and get caught three times (by him or Martha), and he throws you out.

## Chapter 2 — Leo · الفصل الثاني — ليو
- After any of Elias's endings, the story continues in Leo's boathouse on the harbor.
- Leo (19) draws, does deliveries, owes rent to Victor's company, and won't speak to his father Frank.
- New places: the boathouse, Leo's loft (private), the dock, the boathouse bathroom, Frank's Motors.
- Ride along on deliveries, draw on the dock, play games, cook for him, meet his father, and find out what happened the night Daniel died.
- 5 endings, one of which leads straight into Margaret's chapter.

بعد أي نهاية مع إلياس، القصة تكمل في بيت القوارب حق ليو. توصيل، رسم، ألعاب، أبوه فرانك، وسر ليلة موت دانيال. ٥ نهايات، وحدة منها توصلك لفصل مارغريت.

## Chapters 3–5 and the finale · الفصول ٣–٥ والنهاية
After Leo, Sami gives you the attic above his grocery, and three doors open. Knock on them **in any order**:
- **Margaret** (Cliff Road): a grieving mother, a locked room, dinner for three, pills with a gold "G". 5 endings.
- **Evelyn** (the lighthouse): funny, odd, and the strongest horror: a child laughs in the attic every night at 3:07 (sounds only). A storm can kill you if you ignore the warnings. 5 endings.
- **Victor** (the Saltmere Grand): a free suite, then favours that cost more each time. Expose him, free Ana, or become his apprentice. A fire can kill you. 5 endings.
- **The finale** on the bench where you started: 5 endings decided by everything you did. Then you can keep living in Saltmere.

بعد ليو، سامي يعطيك الغرفة اللي فوق البقالة، وتنفتح ثلاث أبواب **بأي ترتيب**: مارغريت (أم حزينة وغرفة مقفولة)، إيفلين (المنارة وضحكة طفل الساعة ٣:٠٧ — أصوات بس)، وفيكتور (الفندق والخدمات اللي تكبر). وبعدها النهاية على الكرسي اللي بديت عنده، وتقدر تكمل تعيش في البلدة.

## Living in Saltmere · الحياة في البلدة
- **3 save slots** (phone → Settings) plus autosave. Loading from the title screen too.
- **Needs**: food, cleanliness, energy. They drop over time and change your mood. Eat, shower, sleep.
- **Jobs & mini-games**: evening café shifts at Marco's (memory game), fishing from the pier (timing game), tidying graves for Gregor.
- **People with lives**: hosts cook, eat, shower, sleep, and take the bathroom on schedules; small house moments happen at random.
- **New townspeople**: Stella (florist), Kai (surfer), Officer Rex, Ingrid (singer), Olivia (activist), Maya (fisherwoman), Gregor (gravedigger), Bella, Kell, Ana, Nora. Side quests: the lost cat, a present for Lily, Ingrid's Thursday song, the petition, the stolen boat, Operation Seagull.
- **30+ random town moments** that don't repeat until the pool runs out.
- 30 endings in total.

- ٣ خانات حفظ + حفظ تلقائي. احتياجات (أكل، نظافة، طاقة) تأثر على مزاجك. شغلات وألعاب صغيرة (المقهى، الصيد، المقبرة). شخصيات تطبخ وتاكل وتتروش وتشغل الحمام بجدول. شخصيات جديدة ومهام جانبية، وأكثر من ٣٠ موقف عشوائي ما يتكرر. المجموع ٣٠ نهاية.

## Your own pictures (optional) / صورك الخاصة (اختياري)
The game draws everything itself. To replace any drawing with a real picture, add files with these exact names and the game uses them automatically:
- Backgrounds: `img/bg/<place>.jpg` (or `.png`), e.g. `img/bg/living.jpg`, `img/bg/boathouse.jpg`
- Characters (transparent PNG, standing, head to mid-thigh): `img/chars/<name>-<expression>.png`, e.g. `img/chars/elias-neutral.png`, `img/chars/leo-smile.png`
- Expressions: `neutral`, `smile`, `sad`, `angry`, `shock`. If only `neutral` exists, it's used for all.
- Places: station, motel, street, grocery, cafe, harbor, elias_ext, living, kitchen, bath, elias_bed, your_room, shed, clinic, boathouse, loft, bh_bath, dock, garage, sami_attic, cliff_road, marg_living, marg_kitchen, marg_guest, marg_bed, dan_room, marg_bath, lh_ext, lh_living, lh_kitchen, lh_room, lh_bath, lh_tower, lh_attic, hotel_lobby, hotel_suite, hotel_office, hotel_staff, beach, cemetery, florist, police
- Names: elias, sami, marco, irene, martha, leo, frank, margaret, nora, evelyn, victor, kell, ana, bella, stella, kai, rex, ingrid, maya, olivia, gregor

اللعبة ترسم كل شي بنفسها. ولو تبي تستبدل أي رسمة بصورة، حط الملف بالاسم بالضبط واللعبة تستخدمه تلقائياً (الأسماء فوق).

## Real illustrated art, drawn for free · رسومات حقيقية مجاناً
`.github/workflows/art.yml` runs on GitHub's computers the first time you upload these files. Start it from the **Actions** tab ("Draw the game art" → Run workflow). It runs on up to 16 GitHub computers at once with the open-source model **DreamShaper XL Turbo** (Stable Diffusion XL) to draw all 21 characters with 5 expressions (the expressions are redrawn from the neutral picture so it stays the same person) and all 42 backgrounds, removes the character backgrounds, saves them in `img/`, then rebuilds the website and the Android app. It costs nothing on a public repository. Run it again to fill in anything missing, or with **redo = yes** to redraw everything. Until a picture exists, the game uses its own drawing.

من تبويب **Actions** تشغّل «Draw the game art»، وGitHub يشغّله على أجهزته ويرسم كل الشخصيات (٥ تعابير) والخلفيات بذكاء اصطناعي مفتوح المصدر، ويشيل خلفيات الشخصيات، ويحطها في `img/`، وبعدين يعيد بناء الموقع والتطبيق. ياخذ تقريباً ساعتين لثلاث، ومجاني. تتابعه من تبويب **Actions**.

## Play / التشغيل
Open `index.html` in a browser. No build step, no server needed.

افتح `index.html` في أي متصفح. ما يحتاج تثبيت ولا سيرفر.

## Publish on GitHub Pages / النشر على GitHub Pages
1. Upload all files to your repository, keeping the folders (`css/`, `js/`, `.github/`).
2. Repository **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` publishes the game. The link appears in the **Actions** tab, under the run.

1. ارفع كل الملفات للمستودع مع المجلدات (`css/` و `js/` و `.github/`).
2. من **Settings → Pages** اختر **Source: GitHub Actions**.
3. كل push على `main` ينشر اللعبة، والرابط يطلع في تبويب **Actions** داخل التشغيل.

## Android app (APK + AAB) / تطبيق أندرويد
Every push to `main` runs **Build Android app** in the **Actions** tab. It produces:
- `OtherPeoplesHouses.apk` — install it on your phone.
- `OtherPeoplesHouses.aab` — the file Google Play wants.

Both are attached to a new **Release** on the repository page, and the in-game button **Download the Android app** opens the latest one.

كل push على `main` يشغّل **Build Android app** في تبويب **Actions**، ويطلع:
- `OtherPeoplesHouses.apk` تثبته على جوالك.
- `OtherPeoplesHouses.aab` الملف اللي يطلبه قوقل بلاي.

الاثنين ينضافون لـ **Release** جديد في صفحة المستودع، وزر **حمّل تطبيق أندرويد** داخل اللعبة يفتح آخر واحد.

### Signing for Google Play / التوقيع للمتجر
Without secrets the APK is debug-signed (fine for testing) and the AAB is unsigned (Play rejects it). Add these in **Settings → Secrets and variables → Actions**:
`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`. Never upload the `.jks` file itself.

بدون الأسرار، الـ APK يشتغل للتجربة، والـ AAB غير موقّع والمتجر يرفضه. أضف الأربعة في **Settings → Secrets and variables → Actions**، ولا ترفع ملف `.jks` نفسه أبداً.

If your repository is not `ij1471163-prog/other-peoples-houses`, change `GAME.REPO` in `js/main.js` (on GitHub Pages it is detected automatically).

لو مستودعك مو `ij1471163-prog/other-peoples-houses`، غيّر `GAME.REPO` في `js/main.js` (على GitHub Pages ينكشف تلقائياً).

## Files / الملفات
| File | What it does |
|---|---|
| `index.html` | The page |
| `css/game.css` | Layout and look |
| `js/engine.js` | The engine: locations, hotspots, dialogue scripts, time, stats, quests, phone, map, saving |
| `js/art.js` | All backgrounds and character portraits, drawn as SVG |
| `js/world.js` | The town: characters and schedules, locations, items, tasks, UI text |
| `js/elias.js` | Chapter 1: prologue, Elias's story, Martha, talk topics, events, endings |
| `js/leo.js` | Chapter 2: Leo, Frank, the boathouse, events, endings |
| `js/people.js` | Character drawings (body, outfit, face, hair) and the optional picture loader |
| `js/art2.js` | Chapter 2 backgrounds |
| `js/art3.js` | Room builder + backgrounds for chapters 3–5 and the new town places |
| `js/town.js` | New townspeople, side quests, beach/cemetery/florist/police, random moments |
| `js/margaret.js`, `js/evelyn.js`, `js/victor.js` | Chapters 3–5 |
| `js/systems.js` | Needs, jobs, mini-games, Sami's attic, chapter flow, the finale |
| `assets/` | App icon and splash screen for Android |
| `capacitor.config.json` | Android app name and id (`com.naif.otherpeopleshouses`) |
| `.github/workflows/android.yml` | Builds the APK and AAB and publishes the release |
| `.github/workflows/pages.yml` | Publishes the web version to GitHub Pages |

## Adding a chapter / إضافة فصل
A new house is a new file like `js/elias.js`: its scripts, talk topics, events and endings, plus its rooms and characters in `js/world.js`, and its art in `js/art.js`. Load it in `index.html` before `js/systems.js`.

Text is written as `T('English', 'العربي')`. Inside text, `{name}` is the player's name and `{man|woman}` picks the word by the player's gender.
