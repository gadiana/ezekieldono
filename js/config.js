/* =====================================================================
   AI secretary settings
   ===================================================================== */
window.INTRO_CONFIG = {
  enabled: true,      // set to false to turn the anime intro off
  everyVisit: false,  // false = once per browser session, true = every page load
  // Optional: path to your own intro video, e.g. "assets/intro.mp4".
  // Leave empty to use the built-in animated opening.
  video: ""
};

window.AI_CONFIG = {
  // Name and persona of the secretary
  name: "Aiko",

  // Voice settings (Web Speech API)
  voice: {
    lang: "en-US",
    rate: 1.03,
    pitch: 1.25,
    // Aiko answers after this much silence (milliseconds)
    silenceMs: 2000,
    // Voices tried in order (first match wins). Partial names are fine.
    preferred: ["Google US English", "Microsoft Aria", "Microsoft Jenny", "Samantha", "Zira", "Female"]
  }
};
