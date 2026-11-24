/* ==========================================================================
   PROFILE DATA — the single source of truth.
   The website AND the AI secretary both read from this file, so whatever you
   put here is what the AI "knows". Edit freely.
   ========================================================================== */

window.PROFILE = {
  name: "Jhon Ezekiel B. Gadiana",
  shortName: "Jhon Ezekiel",
  nickname: "Ezekiel",
  japanese: "ジョン・エゼキエル",
  title: "Backend Programmer",
  tagline: "Backend programmer. I build the engine room — APIs, databases and the logic that keeps apps alive.",
  location: "Philippines",
  email: "gadiana.jhonezekiel@gmail.com",
  phone: "09364202029",
  phoneIntl: "+639364202029",

  about: [
    "I'm Jhon Ezekiel B. Gadiana, a backend programmer who loves building the parts of an app nobody sees but everybody depends on: clean APIs, solid data models and server logic that just works.",
    "I write PHP, Python and JavaScript, build backends with Django, and ship mobile apps with React Native and Flutter. When I'm not coding I'm probably watching anime, which is why this site looks the way it does."
  ],

  languages: [
    { name: "Python", level: 88, note: "His main backend language: Django, scripting and automation." },
    { name: "PHP", level: 80, note: "Server-side web apps, REST endpoints, MySQL." },
    { name: "JavaScript", level: 78, note: "Frontend glue, Node tooling and React Native." }
  ],

  frameworks: [
    { name: "Django", level: 85, note: "Models, ORM, auth, Django REST Framework APIs." },
    { name: "React Native", level: 72, note: "Cross-platform mobile apps that talk to my APIs." },
    { name: "Flutter", level: 68, note: "Cross-platform mobile UI with Dart." }
  ],

  strengths: [
    "Designing REST APIs and backend architecture",
    "Database design and data modelling (SQL, Django ORM)",
    "Authentication, permissions and server-side business logic",
    "Connecting mobile apps (React Native / Flutter) to a backend",
    "Debugging and keeping systems stable"
  ],

  interests: ["Anime", "Backend architecture", "Mobile apps", "Learning new tech"],

  /* ------------------------------------------------------------------------
     OPTIONAL INFO — fill these in and Aiko will answer questions about them.
     Leave a field empty ("" or []) and Aiko will politely say she doesn't
     have the answer, instead of making something up.
     ------------------------------------------------------------------------ */
  education: "",          // e.g. "BS Information Technology — Your University"
  experience: "",         // e.g. "2 years of freelance backend development"
  availability: "",       // e.g. "Open to freelance and full-time backend roles"
  spokenLanguages: [],    // e.g. ["English", "Filipino"]
  favoriteAnime: [],      // e.g. ["Naruto", "Attack on Titan"]
  age: "",                // e.g. "22"
  rates: "",              // e.g. "Rates depend on the project — message me"
  resume: "",             // link to your CV/resume
  socials: {              // links; empty ones are ignored
    github: "",
    linkedin: "",
    facebook: ""
  },

  /* ------------------------------------------------------------------------
     CUSTOM Q&A — teach Aiko anything else. If a question contains the
     keywords, she replies with your answer.
     ------------------------------------------------------------------------ */
  faq: [
    // { keywords: ["favorite", "food"], answer: "Jhon loves sinigang!" },
  ],

  /* ------------------------------------------------------------------------
     PROJECTS — ⚠ These are SAMPLE entries. Replace them with your real
     projects (title, description, tech, links). The AI will learn them
     automatically.
     ------------------------------------------------------------------------ */
  projects: [
    {
      id: "inventory-api",
      title: "Inventory Management API",
      arc: "Arc 01",
      kanji: "倉",
      description: "A Django REST Framework backend for tracking stock, suppliers and sales, with token authentication, role-based permissions and reporting endpoints.",
      highlights: ["JWT/token auth with roles", "Low-stock alerts", "Sales reports endpoint"],
      tech: ["Python", "Django", "REST API", "PostgreSQL"],
      category: "backend",
      github: "",
      demo: ""
    },
    {
      id: "campus-app",
      title: "Campus Companion App",
      arc: "Arc 02",
      kanji: "学",
      description: "A React Native mobile app for students to view schedules, announcements and grades, backed by a Django API.",
      highlights: ["Push announcements", "Offline schedule cache", "Django backend"],
      tech: ["React Native", "JavaScript", "Django"],
      category: "mobile",
      github: "",
      demo: ""
    },
    {
      id: "reservation-system",
      title: "Online Reservation System",
      arc: "Arc 03",
      kanji: "約",
      description: "A PHP and MySQL web system for booking rooms and services, with an admin dashboard, booking conflict checks and email confirmations.",
      highlights: ["Conflict-free booking logic", "Admin dashboard", "Email confirmations"],
      tech: ["PHP", "MySQL", "JavaScript"],
      category: "web",
      github: "",
      demo: ""
    },
    {
      id: "anime-tracker",
      title: "Anime Watchlist Tracker",
      arc: "Arc 04",
      kanji: "見",
      description: "A Flutter app to track the anime I'm watching, with episode progress, ratings and a seasonal list synced to a small Python backend.",
      highlights: ["Episode progress tracking", "Seasonal lists", "Python sync API"],
      tech: ["Flutter", "Dart", "Python"],
      category: "mobile",
      github: "",
      demo: ""
    }
  ]
};
