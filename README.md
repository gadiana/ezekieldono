# Jhon Ezekiel B. Gadiana — Anime Portfolio

An anime-themed portfolio with an animated background, 4 themes and **Aiko**, an AI secretary you can chat with by text or voice.

## Run it

**Simplest:** open `index.html` in Chrome or Edge.

**With the local server** (best for voice mode, because browsers allow the mic on localhost):
```powershell
python server/server.py
```
Then open http://localhost:8000

**Online:** the site is a plain static site, so it runs on Netlify, GitHub Pages or any static host without a build step.

## Edit your info and projects

Everything is in **`js/data.js`**: name, about text, skills, strengths and **projects**.
The page and Aiko both read from this file, so editing it is how you "train" the AI.
For each project, fill in `github` / `demo` to show the links.

`data.js` also has optional fields: education, experience, availability, spoken languages,
favorite anime, age, rates, resume and social links. When one is filled in, Aiko uses it.
When it's empty, she replies *"I'm sorry, I don't have the answer for that."* and never makes something up.
To teach her anything else, add entries to `faq`:
```js
faq: [
  { keywords: ["favorite", "food"], answer: "Jhon loves sinigang!" },
],
```

## Anime intro

- The opening plays once per browser session: speed lines, a title slam with your name, rapid cuts of your tech stack, a sakura burst, then an "EPISODE 01" title card.
- To skip it: click **Skip**, press Esc, Enter or Space, or double-click.
- To replay it: use the ▶ button in the navigation bar, or "Replay opening" in the footer.
- **🔊 Sound** turns on the sound effects.
- Settings are in `js/config.js` under `INTRO_CONFIG`:
  - `enabled: false` turns the intro off.
  - `everyVisit: true` plays it on every page load.
  - `video: "assets/intro.mp4"` plays your own video file instead.
- Add `?intro=0` to the URL to skip it while testing.

## Themes

Sora Sky is the default theme.

| Dark | Light |
|---|---|
| Tokyo Night 星: stars and shooting stars | Sakura 桜: falling cherry petals |
| Akatsuki 暁: rising embers | Sora Sky 空: clouds and leaves |

- Use the palette button to pick a theme. The sun/moon button switches between the light and dark pair.
- You can also ask Aiko: "switch to sakura theme".

## Aiko, the AI secretary

- **Text chat:** the 秘 button in the bottom-right corner.
- **Voice mode** is off by default. Press the speaker icon in the chat header to turn it on.
  - It stays on until you press the speaker icon again or close the chat.
  - Aiko keeps listening the whole time, even while she's talking.
  - **She answers after 2 seconds of silence.** A small bar under the orb fills up while she waits. Short pauses mid-sentence are fine. Change the timing with `voice.silenceMs` in `js/config.js`.
  - **Interrupt her** by saying her name ("Aiko!", "Aiko, where is he from?") or "wait", "stop", "hold on", "teka" or "sandali". She stops right away. If you asked a new question, she answers it; if you only said her name, she asks what you need.
  - **"Wait" on its own** makes her reply "Okay, I'll wait" and stay quiet until you speak again. If you say "what is his… wait", she holds the start of your sentence until you finish it.
  - Tapping the orb also interrupts her.
  - Her own voice coming back through the speakers is ignored. Headphones work best.
- **What she answers:**
  - Anything about you that's in `data.js`.
  - Thanks and compliments (to her, to you, or about the site), greetings and small talk.
  - Anything else gets: *"I'm sorry, I don't have the answer for that."*
- **Mic button:** speak a single question instead of typing it.
- **Brain:** `js/brain.js` is an intent engine built from `js/data.js`. It runs entirely in the browser, with no API keys and no server.
- Voice input needs Chrome or Edge (Web Speech API). Spoken replies work in all modern browsers.
- Settings such as the voice, pitch and silence timing are in `js/config.js`.

## Files
```
index.html          page structure
css/style.css       themes, animations, layout
js/data.js          your profile + projects (edit me!)
js/background.js    animated canvas per theme
js/theme.js         theme switching with circular reveal
js/brain.js         offline AI brain
js/intro.js         anime opening intro
js/assistant.js     chat + voice UI
js/main.js          rendering, scroll reveals, filters, tilt
server/server.py    local dev server (stdlib only)
```
