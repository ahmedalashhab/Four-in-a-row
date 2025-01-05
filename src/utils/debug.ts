// Debug flags with default values and localStorage persistence
export const DEBUG = {
  FIREBASE: false,
  GAME: false,
  ROOMS: false,
  MOVES: false,
  AUTH: false,
};

// Load saved debug settings
if (process.env.NODE_ENV === "development") {
  try {
    const savedDebug = localStorage.getItem("debug-settings");
    if (savedDebug) {
      const parsed = JSON.parse(savedDebug);
      Object.assign(DEBUG, parsed);
    }
  } catch (e) {
    console.error("Error loading debug settings");
  }

  // Add to window for runtime control
  (window as any).DEBUG = DEBUG;

  // Save debug settings when they change
  (window as any).setDebug = (category: keyof typeof DEBUG, value: boolean) => {
    DEBUG[category] = value;
    localStorage.setItem("debug-settings", JSON.stringify(DEBUG));
    console.table(DEBUG);
  };

  // Toggle all debug settings
  (window as any).toggleAllDebug = (value: boolean) => {
    Object.keys(DEBUG).forEach((key) => {
      DEBUG[key as keyof typeof DEBUG] = value;
    });
    localStorage.setItem("debug-settings", JSON.stringify(DEBUG));
    console.table(DEBUG);
  };
}

// Debug logger
export const debugLog = (
  type: keyof typeof DEBUG,
  message: string,
  data?: any,
) => {
  if (DEBUG[type]) {
    if (data) {
      console.log(`🔵 [${type}] ${message}:`, data);
    } else {
      console.log(`🔵 [${type}] ${message}`);
    }
  }
};

export const debugError = (
  type: keyof typeof DEBUG,
  message: string,
  error?: any,
) => {
  if (DEBUG[type]) {
    if (error) {
      console.error(`🔴 [${type}] ${message}:`, error);
    } else {
      console.error(`🔴 [${type}] ${message}`);
    }
  }
};
