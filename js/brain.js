/* =====================================================================
   Aiko's offline brain — "trained" on window.PROFILE (js/data.js).
   • Answers anything about Jhon that is in data.js
   • Handles small talk, thanks and compliments
   • Anything else → "I'm sorry, I don't have the answer for that."
   Each reply: { text, speech?, action? }
   ===================================================================== */
(function () {
  const P = window.PROFILE;
  const AI = window.AI_CONFIG.name;
  const F = P.shortName.split(" ")[0];                 // "Jhon"
  const SORRY = "I'm sorry, I don't have the answer for that.";

  /* ---------------- helpers ---------------- */
  const norm = (s) => s.toLowerCase()
    .replace(/react\s*native/g, "reactnative")
    .replace(/\b(john|jon|jhonny|johnny|jhon)\b/g, "jhon")
    .replace(/\b(ezequiel|ezekeil|ezikiel|zeke)\b/g, "ezekiel")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s+#.?]/g, " ")
    .replace(/\s+/g, " ").trim();
  const stem = (w) => {
    if (w.length <= 3) return w;
    if (w.endsWith("ies")) return w.slice(0, -3) + "y";                  // hobbies -> hobby
    if (/(ss|us|is)$/.test(w)) return w;                                // class, focus, basis
    if (/(sses|xes|ches|shes)$/.test(w)) return w.slice(0, -2);
    if (w.endsWith("s")) return w.slice(0, -1);                         // languages -> language
    return w;
  };
  const tokens = (s) => s.replace(/[?.]/g, " ").split(/\s+/).filter(Boolean).map(stem);
  const list = (arr) => arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const filled = (v) => Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const allSkills = [...P.languages, ...P.frameworks];
  const names = (arr) => arr.map((x) => x.name);
  const spokenPhone = P.phone.split("").join(" ");
  const spokenEmail = "gadiana dot jhon ezekiel at gmail dot com";
  const stripName = (s) => s.replace(new RegExp(`\\b(hey|hi|hello|ok|okay|yo)?\\s*${AI}(\\s*-?\\s*(chan|san|sama))?\\b[,!.?]*`, "gi"), " ").trim();

  const HINTS = [
    `I only know about ${F}'s skills, projects, strengths and contact details.`,
    `You can ask ${F} directly at ${P.email}.`,
    `Try asking me about ${F}'s projects, skills or how to contact him!`
  ];
  const sorry = (extra) => {
    const tail = extra || pick(HINTS);
    return { text: `${SORRY} ${tail}`, speech: `${SORRY} ${tail.replace(P.email, spokenEmail)}`, sorry: true };
  };

  const projectsUsing = (tech) => P.projects.filter((p) =>
    p.tech.some((t) => t.toLowerCase().replace(/\s/g, "") === tech.toLowerCase().replace(/\s/g, "")));
  const projectSummary = (p) => `${p.title}: ${p.description} Built with ${list(p.tech)}.` +
    (p.github ? ` Code: ${p.github}` : "") + (p.demo ? ` Demo: ${p.demo}` : "");
  const socials = () => Object.entries(P.socials || {}).filter(([, v]) => filled(v));

  /* ---------------- small talk, thanks & compliments ---------------- */
  const RE = {
    jhon: /\b(jhon|ezekiel|gadiana|he|him|his|hes|developer|programmer|owner|guy|dev)\b/,
    me: /\b(you|your|youre|yourself|u|ur|aiko)\b/,
    question: /\?|^(what|whats|who|whos|where|when|why|how|hows|is|are|does|do|did|can|could|will|would|which|tell|show|give|list)\b/,
    thanks: /\b(thank|thanks|thankyou|thx|ty|tysm|tyvm|arigato|arigatou|arigatogozaimasu|salamat|appreciate|appreciated|appreciating|obliged|cheers|grateful)\b/,
    praise: /\b(cute|kawaii|smart|clever|helpful|amazing|awesome|great|cool|nice|kind|sweet|best|beautiful|pretty|funny|brilliant|impressive|wonderful|fantastic|excellent|perfect|sugoi|legend|goat|genius|talented|skilled|love|lovely|wow|dope|fire|lit|neat|clean|good job|great job|well done|nice work|good work|10 10|outstanding)\b/,
    site: /\b(portfolio|website|site|page|design|theme|themes|animation|animations|intro|background|ui|layout)\b/,
    insult: /\b(stupid|dumb|useless|idiot|hate you|you suck|sucks|bad bot|trash|worst|annoying|boring)\b/,
    greet: /^(hi+|hello+|hey+|heya|yo|hiya|konnichiwa|konichiwa|ohayo|ohayou|good (morning|afternoon|evening|day)|kumusta|musta|hola|greetings|sup)\b/,
    bye: /\b(bye|goodbye|good bye|sayonara|see you|see ya|cya|good night|goodnight|ja ne|mata ne|later|gotta go|im leaving)\b/,
    howAreYou: /\b(how are you|how r u|how are u|hows it going|how is it going|how you doing|how do you do|whats up|wassup|how have you been|hows your day)\b/,
    laugh: /^(ha(ha)+|lol|lmao|hehe+|haha+|xd|rofl)\b/,
    ack: /^(ok|okay|k|kk|alright|got it|i see|noted|sure|cool|fine|nice|oh|ah|hmm+|yes|yeah|yep|no|nope)$/
  };

  function social(t) {
    const isQ = RE.question.test(t);
    if (RE.insult.test(t)) return { kind: "insult", text: pick([
      `Gomen nasai… 🙇 I'm still learning! Let me try again — ask me about ${F}'s skills, projects or contact details.`,
      `Ouch! I'll do my best to be more helpful. What would you like to know about ${F}?`]) };
    if (RE.thanks.test(t)) return { kind: "thanks", short: pick(["You're welcome! ", "Anytime! ", "Douitashimashite! "]), text: pick([
      `You're very welcome! 😊 Is there anything else you'd like to know about ${F}?`,
      `Douitashimashite! (That means "you're welcome"!) Happy to help anytime. 🌸`,
      `Anytime! It's my job to help. Let me know if you have more questions about ${F}.`,
      `My pleasure! Glad I could help. 💙`]) };
    if (!isQ && RE.praise.test(t)) {
      if (RE.site.test(t)) return { kind: "praise", short: "Arigatou! ", text: pick([
        `Arigatou gozaimasu! ✨ ${F} built this portfolio himself — I'll tell him you liked it! Want to see his projects?`,
        `Sugoi, right? 🌸 I'll pass your compliment to ${F}. Try switching themes with the palette button too!`]) };
      if (RE.jhon.test(t)) return { kind: "praise", short: "I agree! ", text: pick([
        `I think so too! 😄 ${F} works really hard on his backends. If you'd like to work with him, email ${P.email}.`,
        `I'll be sure to tell ${F}! He'll be happy to hear that. 😊`]) };
      if (RE.me.test(t)) return { kind: "praise", short: "Ehehe, thank you! ", text: pick([
        `E-eh?! Thank you so much! 😳💕 You're too kind. Anything else I can help you with?`,
        `Ehehe, arigatou! 😊 I try my best to be a good secretary. What else would you like to know?`,
        `Kyaa~ you're making me blush! 🌸 Thank you! Ask me anything about ${F}.`]) };
      if (t.split(" ").length <= 5) return { kind: "praise", short: "Arigatou! ", text: pick([
        `Arigatou! 😊 Glad you're enjoying it. Want to know more about ${F}?`,
        `Sugoi desu ne! 🌸 Anything else you'd like to know?`]) };
    }
    if (RE.howAreYou.test(t)) return { kind: "small", short: "I'm doing great! ", text: pick([
      `I'm doing great, thanks for asking! 😊 Ready to answer anything about ${F}.`,
      `Genki desu! I'm always happy when someone visits ${F}'s portfolio. How can I help?`]) };
    if (RE.bye.test(t)) return { kind: "bye", text: pick([
      `Sayonara! 👋 Thanks for visiting. Don't forget to contact ${F} if you need a backend built!`,
      `Mata ne! Have a great day! 🌸`]) };
    if (RE.greet.test(t)) return { kind: "greet", short: "Hello! ", text: pick([
      `Konnichiwa! 🌸 I'm ${AI}, ${F}'s AI secretary. Ask me about his skills, projects or how to contact him.`,
      `Hello there! ${AI} here. What would you like to know about ${F}?`]) };
    if (RE.laugh.test(t)) return { kind: "small", text: pick(["Hehe 😄 Anything else you'd like to know?", "Ehehe~ 😆 What else can I help you with?"]) };
    if (RE.ack.test(t)) return { kind: "small", text: pick([`Okay! Anything else you'd like to know about ${F}?`, "Got it! Feel free to ask me more. 😊"]) };
    return null;
  }

  /* ---------------- information intents ----------------
     test(ctx) returns a score; highest score ≥ 2 wins.
     Phrase matches score 10; keyword matches add their weights. */
  const kw = (raw, needSubject) => {
    const weights = {};
    Object.entries(raw).forEach(([k, v]) => { weights[stem(k)] = Math.max(weights[stem(k)] || 0, v); });
    return (c) => {
    if (needSubject && !c.subj) {
      // strong keywords (≥3) still count without a subject
      return c.tk.reduce((s, w) => s + ((weights[w] || 0) >= 3 ? weights[w] : 0), 0);
    }
    return c.tk.reduce((s, w) => s + (weights[w] || 0), 0);
    };
  };
  const re = (r, score = 10) => (c) => (r.test(c.t) ? score : 0);
  const any = (...fns) => (c) => Math.max(...fns.map((f) => f(c)));

  const intents = [
    /* --- about Aiko --- */
    { id: "creator", test: re(/\b(who|what) (made|created|built|programmed|coded|designed|developed) (you|u|this|aiko)\b|who is your (creator|boss|master|owner)/),
      reply: () => ({ text: `${F} built me into his portfolio! I'm ${AI}, his AI secretary. My job is to tell visitors about his skills, projects and how to reach him. 💼` }) },
    { id: "nameMeaning", test: re(/\b(meaning|mean)\b.*\bname\b|\bname\b.*\bmean|why (are you called|aiko)/),
      reply: () => ({ text: `${AI} (愛子) is a Japanese name — "愛" means love and "子" means child. Kawaii, right? 🌸` }) },
    { id: "self", test: re(/\b(who|what) (are|r) (you|u)\b|\byour name\b|about yourself|introduce yourself|are you (a |an )?(bot|ai|robot|human|real|person)|what is aiko|who is aiko/),
      reply: () => ({ text: `I'm ${AI} (愛子), ${F}'s AI secretary! 🌸 I know all about his skills, projects and contact details, and I can chat by text or voice. Tap the speaker icon to talk to me hands-free.` }) },
    { id: "help", test: re(/what can (you|u) do|how can (you|u) help|help me|what do (you|u) know|what (can|should) i ask|what questions|\bhelp\b|your purpose|what are you for/),
      reply: () => ({ text: `I can tell you:\n• who ${F} is and what he does\n• what he's good at\n• the languages and frameworks he uses\n• his projects\n• how to contact or hire him\nI can also switch the site theme for you. Just ask! 😊`,
        speech: `I can tell you who ${F} is, what he's good at, the languages and frameworks he uses, his projects, and how to contact him. I can also switch the site theme.` }) },
    { id: "hear", test: re(/can (you|u) hear|are (you|u) (there|listening|working|online)|\byou there\b|is this (working|on)|mic test|testing|test test|can you understand/),
      reply: () => ({ text: pick([`Hai! I can hear you loud and clear. 🎧 What would you like to know about ${F}?`, `Yes, I'm here and listening! Ask me about ${F}'s skills, projects or contact details.`]) }) },

    /* --- about Jhon --- */
    { id: "name", test: re(/\b(full|complete|real|his) name\b|what is jhon s name|whats his name|name of (the )?(owner|developer|programmer)/),
      reply: () => ({ text: `His full name is ${P.name}. In Japanese that's ${P.japanese}! He usually goes by ${P.shortName}.` }) },
    { id: "role", test: any(re(/what (does|do) (he|jhon|jhon ezekiel) do\b|what (is|s) his (job|role|work|profession|position|title|occupation)|is (he|jhon) a (frontend|front end|fullstack|full stack|backend|back end|web|mobile|software)/),
        kw({ job: 3, role: 3, profession: 3, occupation: 3, position: 2, career: 2, title: 2, frontend: 3, fullstack: 3 }, true)),
      reply: (c) => {
        const front = /front ?end|full ?stack/.test(c.t);
        return { text: `${F} is a ${P.title.toLowerCase()} — he builds APIs, databases and server-side logic.` +
          (front ? ` He isn't mainly a frontend developer, but he writes JavaScript and builds mobile apps with React Native and Flutter, so he can connect both sides.` :
            ` He also builds mobile apps with React Native and Flutter.`) };
      } },
    { id: "about", test: any(re(/\b(who is|whos|who s) (jhon|ezekiel|gadiana|he|this guy|the owner|the developer)\b|tell me about (jhon|him|ezekiel|the developer)|introduce (jhon|him)/),
        kw({ who: 2, about: 2, introduce: 3, introduction: 3, background: 2, summary: 2, describe: 2, bio: 3, jhon: 2, ezekiel: 2, gadiana: 2 }, true)),
      reply: () => ({ text: `${P.name} is a ${P.title.toLowerCase()} from the ${P.location}. He codes in ${list(names(P.languages))}, builds backends with Django, and makes mobile apps with React Native and Flutter. He's also a big anime fan! 🍥` }) },
    { id: "whyHire", test: re(/why (should|would|must) (i|we|anyone) hire|why hire|convince me|what makes (him|jhon) (special|different|good)|reason to hire/),
      reply: () => ({ text: `Because ${F} loves the backend! 💪 He's strong at ${list(P.strengths.slice(0, 3).map((s) => s.toLowerCase()))}. He works with ${list(names(allSkills))}, so he can build the API and connect it to a mobile app too. Reach him at ${P.email}.`,
        speech: `Because ${F} loves the backend! He's strong at ${list(P.strengths.slice(0, 3).map((s) => s.toLowerCase()))}. You can reach him at ${spokenEmail}.` }) },
    { id: "strengths", test: kw({ good: 2, best: 2, strength: 3, strong: 2, expert: 3, expertise: 3, specialty: 3, speciality: 3, specialize: 3, specialise: 3, skilled: 2, excel: 2, talent: 3, superpower: 3, ability: 3, forte: 3, focus: 2 }, true),
      reply: () => ({ text: `${F} is strongest on the backend. His special abilities:\n• ${P.strengths.join("\n• ")}\nHis main weapon is Python with Django. ⚔️`,
        speech: `${F} is strongest on the backend: ${list(P.strengths.slice(0, 4)).toLowerCase()}. His main weapon is Python with Django.` }) },
    { id: "spoken", test: re(/\b(speak|spoken|talk in|fluent)\b|\b(english|tagalog|filipino|cebuano|bisaya|nihongo|ilocano)\b|does he (know|understand) japanese/),
      reply: () => filled(P.spokenLanguages) ? { text: `${F} speaks ${list(P.spokenLanguages)}.` } : sorry(`${F} hasn't told me which languages he speaks yet.`) },
    { id: "skills", test: kw({ skill: 3, stack: 3, tech: 2, technology: 2, techstack: 3, know: 2, tool: 2, capable: 2 }, true),
      reply: () => ({ text: `Languages: ${list(names(P.languages))}.\nFrameworks: ${list(names(P.frameworks))}.\nHe specializes in backend work — APIs, databases and server logic.`,
        speech: `He codes in ${list(names(P.languages))}, and uses ${list(names(P.frameworks))}. His specialty is backend work.`, action: { scroll: "#skills" } }) },
    { id: "languages", test: kw({ language: 4, programming: 2, code: 1, coding: 1 }),
      reply: () => ({ text: `${F} programs in ${list(names(P.languages))}:\n` + P.languages.map((l) => `• ${l.name} — ${l.note}`).join("\n"),
        speech: `He programs in ${list(names(P.languages))}. Python is his main backend language.`, action: { scroll: "#skills" } }) },
    { id: "frameworks", test: kw({ framework: 4, library: 3 }),
      reply: () => ({ text: `Frameworks ${F} has used:\n` + P.frameworks.map((f) => `• ${f.name} — ${f.note}`).join("\n"),
        speech: `He has used ${list(names(P.frameworks))}. Django for backends, React Native and Flutter for mobile apps.`, action: { scroll: "#skills" } }) },
    { id: "mobile", test: re(/\b(mobile|android|ios|iphone|phone app|app development|cross platform)\b/, 6),
      reply: () => {
        const mp = P.projects.filter((p) => p.category === "mobile");
        return { text: `Yes! ${F} builds cross-platform mobile apps with React Native and Flutter, usually connected to his own Django backend.` + (mp.length ? ` Mobile projects: ${list(mp.map((p) => p.title))}.` : "") };
      } },
    { id: "database", test: re(/\b(database|databases|sql|mysql|postgres|postgresql|orm|db|data model|data modelling|data modeling)\b/, 6),
      reply: () => {
        const dbs = [...new Set(P.projects.flatMap((p) => p.tech).filter((t) => /sql|mongo|sqlite|redis|firebase/i.test(t)))];
        return { text: `Yes — database design is one of ${F}'s strengths. He models data with SQL and the Django ORM` + (dbs.length ? `, and has used ${list(dbs)} in his projects.` : ".") };
      } },
    { id: "api", test: re(/\b(api|apis|rest|restful|endpoint|endpoints|server side|serverside|server)\b/, 6),
      reply: () => {
        const ap = P.projects.filter((p) => p.tech.some((t) => /api/i.test(t)) || p.category === "backend");
        return { text: `Building APIs is ${F}'s specialty! He designs REST APIs with Django REST Framework and PHP, with authentication, permissions and solid business logic.` + (ap.length ? ` See: ${list(ap.map((p) => p.title))}.` : "") };
      } },
    { id: "projectCount", test: re(/how many (projects|apps|systems|works)/),
      reply: () => ({ text: `${F} has ${P.projects.length} featured projects: ${list(P.projects.map((p) => p.title))}.`, action: { scroll: "#projects" } }) },
    { id: "bestProject", test: re(/\b(best|favorite|favourite|proudest|top|biggest|main)\b.*\b(project|work|app)\b/),
      reply: () => sorry(`${F} hasn't told me his favorite project, but his featured ones are ${list(P.projects.map((p) => p.title))}.`) },
    { id: "projects", test: kw({ project: 4, portfolio: 3, built: 2, build: 2, made: 2, create: 2, created: 2, work: 2, showcase: 3, app: 2, apps: 2, system: 1, sample: 2 }),
      reply: () => ({ text: `Here are ${F}'s projects:\n` + P.projects.map((p) => `• ${p.title} (${list(p.tech)})`).join("\n") + `\nAsk me about any of them for details!`,
        speech: `He has ${P.projects.length} featured projects: ${list(P.projects.map((p) => p.title))}. Ask me about any of them.`, action: { scroll: "#projects" } }) },
    { id: "rates", test: re(/\b(rate|rates|price|pricing|cost|charge|charges|salary|fee|fees|budget|quote|how much|paid|payment)\b/),
      reply: () => filled(P.rates) ? { text: P.rates } : sorry(`For pricing, please email ${F} at ${P.email} with your project details.`) },
    { id: "availability", test: kw({ hire: 4, hiring: 4, available: 4, availability: 4, freelance: 4, freelancer: 4, commission: 3, collaborate: 3, collab: 3, opportunity: 2, open: 1, recruit: 3 }),
      reply: () => ({ text: (filled(P.availability) ? `${P.availability}. ` : `You can reach out to ${F} for backend or mobile work! `) + `Contact him at ${P.email} or ${P.phone}.`,
        speech: (filled(P.availability) ? `${P.availability}. ` : `You can reach out to ${F} for backend or mobile work. `) + `Email him at ${spokenEmail}.`, action: { scroll: "#contact" } }) },
    { id: "contact", test: kw({ contact: 4, reach: 3, email: 4, gmail: 4, mail: 3, phone: 4, number: 3, call: 3, text: 1, message: 2, mobile: 0, cellphone: 4, cp: 3, sms: 3, viber: 3, whatsapp: 3 }),
      reply: (c) => {
        const mail = /\b(email|gmail|mail)\b/.test(c.t), tel = /\b(phone|number|call|text|cellphone|cp|sms|viber|whatsapp)\b/.test(c.t);
        if (mail && !tel) return { text: `His Gmail is ${P.email}.`, speech: `His Gmail is ${spokenEmail}.` };
        if (tel && !mail) return { text: `You can call or text him at ${P.phone}.`, speech: `You can call or text him at ${spokenPhone}.` };
        return { text: `You can reach ${F} here:\n✉ ${P.email}\n☎ ${P.phone}`, speech: `You can email him at ${spokenEmail}, or call ${spokenPhone}.`, action: { scroll: "#contact" } };
      } },
    { id: "socials", test: re(/\b(github|git hub|linkedin|linked in|facebook|fb|instagram|ig|twitter|x account|social|socials|social media|accounts|profile link)\b/),
      reply: () => socials().length ? { text: `Here are ${F}'s links:\n` + socials().map(([k, v]) => `• ${cap(k)}: ${v}`).join("\n"), speech: `I've put ${F}'s links in the chat for you.` }
        : sorry(`${F} hasn't shared his social links with me yet. You can email him at ${P.email}.`) },
    { id: "resume", test: re(/\b(resume|résumé|cv|curriculum vitae|curriculum)\b/),
      reply: () => filled(P.resume) ? { text: `Here's ${F}'s resume: ${P.resume}`, speech: `I've put the link to ${F}'s resume in the chat.` } : sorry(`You can request ${F}'s resume by emailing ${P.email}.`) },
    { id: "education", test: re(/\b(school|study|studied|studying|college|university|degree|education|graduate|graduated|course|student|campus|educational)\b/),
      reply: () => filled(P.education) ? { text: `${F}'s education: ${P.education}.` } : sorry(`${F} hasn't told me about his education yet.`) },
    { id: "experience", test: any(re(/\b(experience|experienced|years of|how long (has|have|did) (he|jhon))\b/), re(/\b(senior|junior|mid level|intern)\b/, 6)),
      reply: () => filled(P.experience) ? { text: `${F}'s experience: ${P.experience}.` } : sorry(`${F} hasn't told me how many years of experience he has. His projects section shows what he's built!`) },
    { id: "age", test: re(/\b(how old|his age|age of|birthday|born|birth date|birthdate)\b/),
      reply: () => filled(P.age) ? { text: `${F} is ${P.age} years old.` } : sorry() },
    { id: "location", test: any(re(/\bwhere (is|does) (he|jhon)\b|where s he/), kw({ location: 4, country: 3, based: 3, live: 2, from: 1, city: 3, address: 2 }, true)),
      reply: () => ({ text: `${F} is based in the ${P.location}. 🇵🇭` }) },
    { id: "anime", test: re(/\b(anime|manga|otaku|weeb|waifu)\b/),
      reply: (c) => {
        if (filled(P.favoriteAnime)) return { text: `${F} is a big anime fan! 🍥 His favorites include ${list(P.favoriteAnime)}.` };
        if (/favorite|favourite|best|top|watch|recommend/.test(c.t)) return sorry(`I know ${F} is a big anime fan, but he hasn't told me his favorites yet!`);
        return { text: `Yes, ${F} is an anime person — that's why his portfolio looks like an anime opening! 🌸 Ask him about his favorites when you contact him.` };
      } },
    { id: "hobbies", test: kw({ hobby: 4, interest: 3, free: 1, fun: 2, passion: 3, like: 1, enjoy: 2 }, true),
      reply: () => ({ text: `${F}'s interests: ${list(P.interests)}. 🍥` }) },
    { id: "siteTech", test: re(/(this|the) (site|website|portfolio|page) (made|built|created|coded)|how (was|is) (this|the) (site|website|portfolio) (made|built)|what is this (site|website)/),
      reply: () => ({ text: `This portfolio is built with HTML, CSS and JavaScript — animated canvas backgrounds, four themes, an anime intro, and me, ${AI}, as the AI secretary! ✨` }) },
    { id: "theme", test: any(re(/\b(theme|dark mode|light mode|sakura|tokyo night|akatsuki|sora)\b/), kw({ theme: 4, color: 2, colour: 2 })),
      reply: (c) => {
        const t = c.t;
        let th = /sakura|pink/.test(t) ? "sakura" : /sora|sky|blue/.test(t) ? "sora" : /akatsuki|red/.test(t) ? "akatsuki"
          : /tokyo|night|neon/.test(t) ? "tokyo-night" : /light/.test(t) ? "sora" : /dark/.test(t) ? "tokyo-night" : null;
        if (!th) th = Theme.list[(Theme.list.indexOf(Theme.current()) + 1) % Theme.list.length];
        const label = { "tokyo-night": "Tokyo Night", akatsuki: "Akatsuki", sakura: "Sakura", sora: "Sora Sky" }[th];
        return { text: `Switching to the ${label} theme ✨`, action: { theme: th } };
      } },
    { id: "intro", test: re(/\b(play|replay|watch|show|start)\b.*\b(intro|opening|op|video)\b/),
      reply: () => ({ text: "Here comes the opening! 🎬", action: { intro: true } }) }
  ];

  /* ---------------- tech & project matching ---------------- */
  function techAnswer(t) {
    const hit = allSkills.find((s) => t.includes(s.name.toLowerCase().replace(/\s/g, "")) ||
      (s.name === "JavaScript" && /\b(js|java script)\b/.test(t)) || (s.name === "Python" && /\b(phython|pyhton|py)\b/.test(t)) ||
      (s.name === "Flutter" && /\bdart\b/.test(t)));
    if (!hit) return null;
    const used = projectsUsing(hit.name);
    const kind = P.languages.includes(hit) ? "languages" : "frameworks";
    let text = `Yes! ${hit.name} is one of ${F}'s ${kind} (power level ${hit.level}). ${hit.note}`;
    if (used.length) text += `\nProjects with ${hit.name}: ${list(used.map((p) => p.title))}.`;
    return { text, action: { scroll: "#skills" } };
  }

  const OTHER_TECH = /\b(java|c\+\+|c#|csharp|golang|rust|ruby|rails|laravel|vue|vuejs|angular|nodejs|node|express|spring|swift|kotlin|flask|fastapi|nextjs|next js|typescript|ts|html|css|tailwind|bootstrap|docker|kubernetes|aws|azure|gcp|firebase|mongodb|mongo|graphql|unity|unreal|wordpress|machine learning|ai development|blockchain|figma|photoshop)\b/;
  function unknownTech(t) {
    const m = t.match(OTHER_TECH);
    if (!m) return null;
    return sorry(`${cap(m[1])} isn't listed in ${F}'s skills — he works with ${list(names(allSkills))}. You can ask him directly at ${P.email}.`);
  }

  const COMMON = new Set(["app", "apps", "api", "system", "online", "management", "tracker", "anime", "mobile", "web", "the"]);
  function projectAnswer(tk) {
    const set = new Set(tk);
    let best = null, bestScore = 0;
    P.projects.forEach((p) => {
      const words = tokens(norm(p.title)).filter((w) => w.length > 2);
      const hits = words.filter((w) => set.has(w));
      const distinctive = hits.filter((w) => !COMMON.has(w)).length;
      const s = distinctive ? distinctive + hits.length / words.length : (hits.length >= 2 ? hits.length / words.length : 0);
      if (s > bestScore) { best = p; bestScore = s; }
    });
    return best && bestScore > 0.5 ? { text: projectSummary(best), speech: `${best.title}. ${best.description}`, action: { highlight: best.id } } : null;
  }

  function faqAnswer(tk, t) {
    for (const f of P.faq || []) {
      const keys = (f.keywords || []).map((k) => norm(k));
      if (keys.length && keys.every((k) => t.includes(k) || tk.includes(stem(k)))) return { text: f.answer };
    }
    return null;
  }

  /* ---------------- info answer ---------------- */
  function info(t) {
    const tk = tokens(t);
    const c = { t, tk, subj: RE.jhon.test(t) };

    const fq = faqAnswer(tk, t); if (fq) return fq;
    const pa = projectAnswer(tk); if (pa) return pa;

    let best = null, bestScore = 0;
    for (const it of intents) {
      const s = it.test(c);
      if (s > bestScore) { best = it; bestScore = s; }
    }
    const ta = techAnswer(t);
    // A specific tech mention beats weak/general intents ("is he good at python?")
    if (ta && (bestScore < 10 || ["strengths", "skills", "mobile", "api", "database"].includes(best.id)) &&
        !(best && ["languages", "frameworks", "theme", "contact"].includes(best.id) && bestScore >= 3)) return ta;
    if (best && bestScore >= 10) return best.reply(c);
    const ut = !ta && unknownTech(t); if (ut) return ut;
    if (best && bestScore >= 2) return best.reply(c);
    return null;
  }

  /* ---------------- main entry ---------------- */
  let lastText = "";
  function think(raw) {
    const calledByName = new RegExp(`\\b${AI}\\b`, "i").test(raw);
    const t = norm(stripName(raw));
    if (!t || t === "?") return calledByName
      ? { text: pick([`Hai! That's me. 😊 What would you like to know about ${F}?`, `Yes? I'm listening! Ask me anything about ${F}.`]) }
      : { text: `Hmm? Ask me anything about ${F}!` };

    // Requests to do unrelated tasks ("write me a script", "solve this")
    if (/^(please )?(write|generate|solve|translate|calculate|compute|summarize|explain|draw|code me|make me|create me|do my|fix my)\b/.test(t) && !RE.jhon.test(t))
      return sorry(`I'm ${F}'s secretary, so I can only answer questions about him — his skills, projects and contact details.`);

    const s = social(t);
    const isQ = RE.question.test(t);
    // Pure compliments / thanks / goodbyes don't need an info lookup
    if (s && (s.kind === "insult" || s.kind === "bye" || (s.kind === "praise" && !isQ))) return s;

    const inf = info(t);
    if (inf && s && s.short) return { ...inf, text: s.short + inf.text, speech: inf.speech && s.short + inf.speech };
    if (inf) return inf;
    if (s) return s;

    // Unfinished sentence like "can you" / "what about"
    if (/^(can|could|will|would|do|does|what|how|is|are|tell|and|so)( (you|u|me|he|about|is|the|i|a))*\??$/.test(t))
      return { text: `Hai? Go on, I'm listening! 😊 You can ask me about ${F}'s skills, projects, strengths or contact details.` };
    return sorry();
  }

  function answer(raw) {
    const r = think(raw || "");
    if (r.text === lastText && !r.sorry && !r.kind) r.text = pick(["Like I said: ", "As I mentioned: "]) + r.text;
    lastText = r.text;
    return r;
  }

  /* ---------------- voice helpers (interrupts & echo) ---------------- */
  // Speech recognition often mishears "Aiko", so accept close variants
  const NAME_RE = /\b(?:hey |hi |ok |okay |excuse me )?(?:aiko|eiko|aico|ayko|aikko|aiku|haiku|i ko|eye ko)(?:[ -]?(?:chan|san))?\b[,.!?]*/gi;
  const WAIT_RE = /\b(?:wait(?: a (?:sec|second|minute|moment))?|hold on|hang on|stop(?: talking)?|pause|be quiet|quiet|shush|shh+|one sec(?:ond)?|just a (?:sec|second|moment|minute)|a moment|teka(?: lang)?|sandali(?: lang)?|chotto matte|matte)\b[,.!?]*/gi;
  const FILLER_RE = /\b(?:um+|uh+|er+|ah+|hmm+|like|so|okay|ok)\b/gi;
  const words = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

  function voiceCommand(text) {
    const t = (text || "").trim();
    const call = new RegExp(NAME_RE.source, "i").test(t);
    const wait = new RegExp(WAIT_RE.source, "i").test(t);
    const rest = t.replace(NAME_RE, " ").replace(WAIT_RE, " ").replace(/\s+/g, " ").trim();
    const restWords = words(rest.replace(FILLER_RE, " ")).length;
    const endsWithWait = new RegExp(`(?:${WAIT_RE.source})\\s*$`, "i").test(t);
    const startsWithWait = new RegExp(`^(?:${NAME_RE.source})?\\s*(?:${WAIT_RE.source})`, "i").test(t);
    return { call, wait, rest, restWords, endsWithWait, startsWithWait };
  }

  // True when what the mic heard is mostly Aiko's own voice coming back through the speakers
  function isEcho(heard, spoken) {
    const h = words(heard), s = new Set(words(spoken || ""));
    if (!h.length || !s.size) return false;
    const overlap = h.filter((w) => s.has(w)).length / h.length;
    return overlap >= 0.6;
  }

  window.Brain = { answer, SORRY, voiceCommand, isEcho };
})();
