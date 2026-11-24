/* =====================================================================
   Aiko — AI secretary UI: text chat + hands-free voice conversation.
   Speech-to-text: Web Speech API (SpeechRecognition)
   Text-to-speech: speechSynthesis
   Brain: js/brain.js (trained on js/data.js)
   ===================================================================== */
(function () {
  const CFG = window.AI_CONFIG, P = window.PROFILE;
  const $ = (id) => document.getElementById(id);
  const chat = $("chat"), body = $("chatBody"), form = $("chatForm"), input = $("chatInput");
  const micBtn = $("micBtn"), voiceBtn = $("voiceModeBtn"), stage = $("voiceStage"), orb = $("orb");
  const hint = $("voiceHint"), heard = $("voiceHeard"), status = $("chatStatus"), avatar = $("avatar");

  let voiceMode = false, listening = false, speaking = false, busy = false, greeted = false;

  /* ---------------- Rendering ---------------- */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function linkify(s) {
    return esc(s)
      .replace(/https?:\/\/[^\s)]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`)
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, (m) => `<a href="mailto:${m}">${m}</a>`)
      .replace(/\b09\d{9}\b/g, (m) => `<a href="tel:${P.phoneIntl}">${m}</a>`);
  }
  function addMsg(text, who) {
    const el = document.createElement("div");
    el.className = "msg " + who;
    el.innerHTML = who === "bot" ? linkify(text) : esc(text);
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }
  function typing() {
    const el = document.createElement("div");
    el.className = "msg bot typing"; el.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(el); body.scrollTop = body.scrollHeight;
    return el;
  }
  function setOrb(state) {
    orb.className = "orb " + (state || "");
    const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    hint.textContent = {
      listening: "🎙 I'm listening… I'll answer after 2 seconds of silence.",
      speaking: `${CFG.name} is talking… say "${CFG.name}" or "wait" to interrupt.`,
      thinking: "Thinking…",
      waiting: `⏸ Waiting — take your time. Ask when you're ready, or call "${CFG.name}".`
    }[state] || (hasSR ? "Just talk to me, or type." : "Voice input isn't supported in this browser — type and I'll answer out loud.");
  }

  const SUGGEST = ["Who is Jhon?", "What is he good at?", "Show me his projects", "What languages does he know?", "How can I contact him?", "Switch to Sakura theme"];
  $("chatSuggest").innerHTML = SUGGEST.map((s) => `<button type="button">${s}</button>`).join("");
  $("chatSuggest").addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") ask(e.target.textContent); });

  /* ---------------- Open / close ---------------- */
  function open(withVoice) {
    chat.classList.add("open"); chat.setAttribute("aria-hidden", "false");
    document.body.classList.add("chat-open");
    if (!greeted) {
      greeted = true;
      addMsg(`Konnichiwa! 🌸 I'm ${CFG.name}, ${P.shortName}'s AI secretary. Ask me about his skills, projects, or how to reach him. Tap the speaker icon to talk to me with your voice!`, "bot");
    }
    if (withVoice) setVoiceMode(true); else setTimeout(() => input.focus(), 300);
  }
  function close() {
    chat.classList.remove("open"); chat.setAttribute("aria-hidden", "true");
    document.body.classList.remove("chat-open");
    setVoiceMode(false);
  }
  document.querySelectorAll("[data-open-chat]").forEach((b) => b.addEventListener("click", () => open(false)));
  $("chatClose").addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && chat.classList.contains("open")) close(); });
  window.Assistant = { open, ask: (q) => { open(false); ask(q); } };

  /* ---------------- Text-to-speech ---------------- */
  const synth = window.speechSynthesis;
  let voice = null;
  function chooseVoice() {
    if (!synth) return;
    const vs = synth.getVoices();
    for (const name of CFG.voice.preferred) {
      const v = vs.find((x) => x.name.includes(name) && x.lang.startsWith("en"));
      if (v) { voice = v; return; }
    }
    voice = vs.find((x) => x.lang === CFG.voice.lang) || vs.find((x) => x.lang.startsWith("en")) || null;
  }
  if (synth) { chooseVoice(); synth.onvoiceschanged = chooseVoice; }

  function toSpeech(text) {
    return text
      .replace(new RegExp(P.email.replace(/\./g, "\\."), "g"), "gadiana dot jhon ezekiel at gmail dot com")
      .replace(/\b09\d{9}\b/g, (m) => m.split("").join(" "))
      .replace(/https?:\/\/\S+/g, "the link in the chat")
      .replace(/[•▸✉☎✦]/g, ", ")
      .replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u{FE0F}\u{200D}]/gu, "")
      .replace(/[*_#`]/g, "")
      .replace(/\s*\n+\s*/g, ". ")
      .replace(/(\.\s*){2,}/g, ". ");
  }

  let speechId = 0, currentLine = "", prevLine = "", lineEndedAt = 0;
  function speak(text) {
    return new Promise((resolve) => {
      if (!synth) return resolve();
      synth.cancel();
      const id = ++speechId;                 // a newer speak() or stopSpeaking() makes this one obsolete
      // Chrome cuts off long utterances, so speak sentence by sentence
      lastSpoken = toSpeech(text);
      const parts = lastSpoken.match(/[^.!?]+[.!?]*/g) || [text];
      speaking = true; avatar.classList.add("talking"); setOrb("speaking");
      let i = 0, guard = null;
      const keep = [];                       // hold references so Chrome doesn't garbage-collect them
      const next = () => {
        clearTimeout(guard);
        if (id !== speechId) return resolve();             // interrupted / replaced
        if (currentLine) { prevLine = currentLine; lineEndedAt = Date.now(); }
        if (i >= parts.length || !speaking) {
          speaking = false; spokeEndedAt = Date.now(); currentLine = ""; avatar.classList.remove("talking");
          setOrb(voiceMode ? (waiting ? "waiting" : "listening") : ""); return resolve();
        }
        const line = parts[i++].trim();
        if (!/[a-z0-9]/i.test(line)) return next();        // nothing speakable (e.g. only an emoji)
        currentLine = line;
        const u = new SpeechSynthesisUtterance(line);
        keep.push(u);
        if (voice) u.voice = voice;
        u.lang = CFG.voice.lang; u.rate = CFG.voice.rate; u.pitch = CFG.voice.pitch;
        let done = false;
        const finish = () => { if (!done) { done = true; next(); } };
        u.onend = finish; u.onerror = finish;
        // Watchdog: if the browser never fires onend, move on anyway
        guard = setTimeout(finish, 2500 + line.split(" ").length * 500 / CFG.voice.rate);
        synth.speak(u);
      };
      next();
    });
  }
  function stopSpeaking() {
    speechId++;
    if (speaking) { spokeEndedAt = Date.now(); prevLine = currentLine; lineEndedAt = Date.now(); }
    speaking = false; currentLine = ""; synth && synth.cancel(); avatar.classList.remove("talking");
  }
  // What Aiko might be "hearing back" right now: the sentence she's saying,
  // plus the previous one for a moment (the mic lags behind the speakers)
  function recentSpeech() {
    return currentLine + " " + (Date.now() - lineEndedAt < 1200 ? prevLine : "");
  }

  /* ---------------- Speech-to-text ----------------
     How voice mode works:
     • The mic stays on the whole time voice mode is on — even while Aiko talks —
       so she can be interrupted.
     • While Aiko is talking or thinking, saying her name ("Aiko") or "wait / stop /
       hold on" stops her immediately. Her own voice coming back through the speakers
       is filtered out (echo check).
     • When you talk, she waits for 2 seconds of silence before answering.
     • "Wait" on its own puts her on hold: she stays quiet until you speak again.
     ------------------------------------------------ */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SILENCE_MS = CFG.voice.silenceMs || 2000;
  const silenceBar = $("silenceBar");
  let rec = null, dictation = false, listenStarted = 0;
  let buffer = "", interimText = "", silenceT = null, pendingCall = false, waiting = false;
  let consumedIdx = -1, lastIdx = -1;     // recognition results already used (per session)
  let lastSpoken = "", spokeEndedAt = 0, turn = 0;

  const ding = (() => {                    // soft "I'm listening" chime when interrupted
    let a = null;
    return () => {
      try {
        a = a || new (window.AudioContext || window.webkitAudioContext)();
        const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
        o.type = "sine"; o.frequency.setValueAtTime(880, t); o.frequency.setValueAtTime(1320, t + .09);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.2, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
        o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + .32);
      } catch (_) {}
    };
  })();

  function showHeard() {
    const txt = (buffer + " " + interimText).trim();
    heard.textContent = txt;
    if (!voiceMode && dictation) input.value = txt;
  }
  function armSilence() {
    clearTimeout(silenceT);
    silenceT = setTimeout(onSilence, SILENCE_MS);
    if (silenceBar) {                      // visual 2-second countdown
      silenceBar.classList.remove("run"); void silenceBar.offsetWidth;
      silenceBar.style.setProperty("--ms", SILENCE_MS + "ms");
      silenceBar.classList.add("run");
    }
  }
  function disarmSilence() { clearTimeout(silenceT); silenceBar && silenceBar.classList.remove("run"); }
  function consumeHeard() { consumedIdx = lastIdx; buffer = ""; interimText = ""; showHeard(); }

  function enterWaiting(sayOkay) {
    waiting = true;
    setOrb("waiting");
    if (sayOkay) speak(pick(["Okay, I'll wait.", "Sure, take your time.", "Hai, I'm waiting."])).then(() => { setOrb("waiting"); });
  }

  // Someone called Aiko or told her to wait while she was talking/thinking
  function interrupt(cmd, finalPart) {
    turn++;                                // cancels the answer in progress
    stopSpeaking();
    lastSpoken = "";                       // don't treat what they say next as echo
    busy = false;
    document.querySelectorAll(".msg.typing").forEach((d) => d.remove());
    ding();
    buffer = finalPart ? Brain.voiceCommand(finalPart).rest : "";
    interimText = "";
    if (cmd.wait && cmd.restWords < 3) { pendingCall = false; buffer = ""; consumedIdx = lastIdx; return enterWaiting(true); }
    pendingCall = cmd.call;
    waiting = false;
    setOrb("listening");
    showHeard();
    armSilence();
  }

  function onSilence() {
    silenceBar && silenceBar.classList.remove("run");
    const text = (buffer + " " + interimText).trim();
    consumeHeard();
    if (!text) {
      if (pendingCall) { pendingCall = false; ask(CFG.name, true); }
      return;
    }
    pendingCall = false;
    const cmd = Brain.voiceCommand(text);
    // "wait" / "hold on" by itself → stay quiet and keep listening
    if (cmd.wait && cmd.restWords < 3) return enterWaiting(true);
    // "what is his… wait" → still thinking: keep what was said, don't answer yet
    if (cmd.endsWithWait && cmd.restWords >= 1) { buffer = cmd.rest; showHeard(); return enterWaiting(false); }
    waiting = false;
    if (!voiceMode) dictation = false;
    ask(cmd.startsWithWait ? cmd.rest : text, true);
  }

  function handleHeard(fin, interim) {
    const latest = (fin + " " + interim).trim();
    if (!latest) return;
    if (speaking || busy) {
      if (Brain.isEcho(latest, recentSpeech())) return;            // that's Aiko's own voice
      const cmd = Brain.voiceCommand(latest);
      if (cmd.call || cmd.wait) interrupt(cmd, fin);
      return;                                // anything else while she talks is ignored
    }
    // Just finished talking: the mic may still be catching the tail of her own voice
    if (Date.now() - spokeEndedAt < 1500 && Brain.isEcho(latest, lastSpoken)) return;
    if (fin) buffer = (buffer + " " + fin).trim();
    interimText = interim;
    if (waiting) waiting = false;
    setOrb("listening");
    showHeard();
    armSilence();                            // answer after 2 s of silence
  }

  if (SR) {
    rec = new SR();
    rec.lang = CFG.voice.lang; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1;
    rec.onstart = () => {
      listening = true; consumedIdx = -1; lastIdx = -1; listenStarted = Date.now();
      micBtn.classList.add("listening");
      if (!speaking && !busy && !waiting) setOrb("listening");
    };
    rec.onresult = (e) => {
      let fin = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        lastIdx = Math.max(lastIdx, i);
        if (i <= consumedIdx) continue;
        const r = e.results[i];
        if (r.isFinal) { fin += r[0].transcript + " "; if (!speaking && !busy) consumedIdx = i; }
        else interim += r[0].transcript + " ";
      }
      listenStarted = Date.now();
      handleHeard(fin.trim(), interim.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        addMsg("I can't hear you — microphone access was blocked. Allow the mic in your browser settings (or run the site from http://localhost:8000), then turn voice mode on again. You can still type to me!", "bot");
        setVoiceMode(false);
      } else if (e.error === "audio-capture") {
        hint.textContent = "I can't find a microphone. Plug one in, or type your question — I'll still answer out loud.";
      }
      // "no-speech", "aborted", "network"… → just keep listening (keep-alive restarts it)
    };
    rec.onend = () => {
      listening = false; micBtn.classList.remove("listening");
      if (voiceMode || dictation) setTimeout(listen, 300);
    };
  }

  function listen() {
    if (!rec || listening) return;
    if (!voiceMode && !dictation) return;
    try { rec.start(); listenStarted = Date.now(); } catch (_) { /* already started */ }
  }
  function stopListening() { disarmSilence(); if (rec && listening) rec.abort(); }

  // Keep-alive: in voice mode the mic is never off until voice mode is turned off or the chat is closed
  setInterval(() => {
    if (!voiceMode || document.hidden) return;
    if (!listening) listen();
    else if (Date.now() - listenStarted > 45000) { try { rec.abort(); } catch (_) {} }  // un-stick a frozen session
  }, 1500);

  micBtn.addEventListener("click", () => {
    if (!SR) return addMsg("Voice input isn't supported in this browser. Try Chrome or Edge — or just type!", "bot");
    if (voiceMode) return;                   // voice mode already listens all the time
    if (dictation) { dictation = false; return stopListening(); }
    stopSpeaking();
    dictation = true; buffer = ""; interimText = ""; listen();
  });
  orb.addEventListener("click", () => {
    if (speaking || busy) return interrupt({ call: true, wait: false, restWords: 0 }, "");
    if (!listening) listen();
  });

  function setVoiceMode(on) {
    voiceMode = on;
    voiceBtn.setAttribute("aria-pressed", on);
    stage.hidden = !on;
    voiceBtn.title = on ? "Voice mode is ON — click to turn off" : "Turn on voice conversation";
    chat.classList.toggle("voice-on", on);
    status.textContent = on ? "🎙 Voice mode ON · I'm always listening" : `${P.shortName}'s AI secretary · online`;
    disarmSilence(); buffer = ""; interimText = ""; waiting = false; pendingCall = false;
    if (on) {
      listen();
      speak(`Hi! I'm ${CFG.name}. What would you like to know about ${P.shortName}?`);
    } else { turn++; stopListening(); stopSpeaking(); dictation = false; setOrb(); }
  }
  voiceBtn.addEventListener("click", () => setVoiceMode(!voiceMode));

  /* ---------------- Thinking ---------------- */
  function runAction(a) {
    if (!a) return;
    if (a.theme) Theme.setTheme(a.theme);
    if (a.scroll && innerWidth > 700) document.querySelector(a.scroll)?.scrollIntoView({ behavior: "smooth" });
    if (a.highlight && window.Portfolio) Portfolio.highlight(a.highlight);
    if (a.intro && window.Intro) setTimeout(() => Intro.play(), 600);
  }

  async function ask(q, fromVoice) {
    q = (q || "").trim();
    if (!q) return;
    const my = ++turn;
    disarmSilence();
    if (!voiceMode) { dictation = false; if (listening) stopListening(); }
    busy = true; waiting = false;
    stopSpeaking();
    addMsg(q, "user");
    input.value = ""; heard.textContent = "";
    setOrb("thinking");
    const dots = typing();

    const local = Brain.answer(q);
    const text = local.text, speech = local.speech;
    await new Promise((r) => setTimeout(r, 350 + Math.random() * 300)); // natural pause
    dots.remove();
    if (my !== turn) return;               // interrupted while thinking → drop this answer
    addMsg(text, "bot");
    busy = false;
    // Actions: theme switch, scroll, highlight, intro
    runAction(local.action);

    if (voiceMode || fromVoice) {
      await speak(speech || text);
      if (voiceMode && my === turn) { consumedIdx = lastIdx; setOrb("listening"); listen(); }
    } else setOrb();
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
})();
