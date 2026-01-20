/**
 * Level Names Configuration - Mining Progression Theme
 * 
 * Each level represents a progression in the mining operation
 * Level represents mining progression, not guaranteed outcomes.
 */

const LEVEL_NAMES = {
  1: {
    name: "Prospect",
    icon: "⛏️",
    description: "Awal eksplorasi",
    fullDescription: "Mining journey begins here",
    color: "#8B7355",
    order: 1
  },
  2: {
    name: "Surveyor",
    icon: "🧭",
    description: "Mapping & orientasi sistem",
    fullDescription: "Understanding the system structure",
    color: "#A0A080",
    order: 2
  },
  3: {
    name: "Excavator",
    icon: "🚜",
    description: "Mulai menggali struktur",
    fullDescription: "Deepening participation",
    color: "#B8860B",
    order: 3
  },
  4: {
    name: "Driller",
    icon: "🛠️",
    description: "Akses ke layer lebih dalam",
    fullDescription: "Access to deeper layers",
    color: "#CD853F",
    isStreamA: true,
    streamANote: "Stream A Entry Point",
    order: 4
  },
  5: {
    name: "Extractor",
    icon: "🪨",
    description: "Pengambilan resource",
    fullDescription: "Resource extraction phase",
    color: "#D2B48C",
    order: 5
  },
  6: {
    name: "Processor",
    icon: "⚙️",
    description: "Pemrosesan data / resource",
    fullDescription: "Processing and optimization",
    color: "#DAA520",
    order: 6
  },
  7: {
    name: "Refiner",
    icon: "🧪",
    description: "Penyaringan & efisiensi",
    fullDescription: "Refinement and efficiency",
    color: "#DEB887",
    order: 7
  },
  8: {
    name: "Smelter",
    icon: "🔥",
    description: "Transformasi tahap lanjut",
    fullDescription: "Advanced transformation",
    color: "#FF8C00",
    isStreamB: true,
    streamBNote: "Stream B Entry Point",
    order: 8
  },
  9: {
    name: "Engineer",
    icon: "📐",
    description: "Kontrol sistem",
    fullDescription: "System control and design",
    color: "#FFA500",
    order: 9
  },
  10: {
    name: "Operator",
    icon: "🖥️",
    description: "Eksekusi & monitoring",
    fullDescription: "Execution and monitoring",
    color: "#FFB347",
    order: 10
  },
  11: {
    name: "Foreman",
    icon: "🪖",
    description: "Koordinasi & oversight",
    fullDescription: "Coordination and oversight",
    color: "#FFC976",
    order: 11
  },
  12: {
    name: "Master Miner",
    icon: "🏔️",
    description: "Full system mastery",
    fullDescription: "Full system mastery and expertise",
    color: "#FFD700",
    order: 12
  }
};

/**
 * Get level name by level number
 */
export const getLevelName = (levelNumber) => {
  return LEVEL_NAMES[levelNumber]?.name || `Level ${levelNumber}`;
};

/**
 * Get full level info by level number
 */
export const getLevelInfo = (levelNumber) => {
  return LEVEL_NAMES[levelNumber] || null;
};

/**
 * Get level icon by level number
 */
export const getLevelIcon = (levelNumber) => {
  return LEVEL_NAMES[levelNumber]?.icon || "📊";
};

/**
 * Get level color by level number
 */
export const getLevelColor = (levelNumber) => {
  return LEVEL_NAMES[levelNumber]?.color || "#DEB887";
};

/**
 * Get all level names in order
 */
export const getAllLevelNames = () => {
  return Object.values(LEVEL_NAMES)
    .sort((a, b) => a.order - b.order)
    .map(level => ({
      number: level.order,
      name: level.name,
      icon: level.icon,
      description: level.description
    }));
};

/**
 * Check if level is Stream A entry point
 */
export const isStreamA = (levelNumber) => {
  return LEVEL_NAMES[levelNumber]?.isStreamA || false;
};

/**
 * Check if level is Stream B entry point
 */
export const isStreamB = (levelNumber) => {
  return LEVEL_NAMES[levelNumber]?.isStreamB || false;
};

/**
 * Get disclaimer text
 */
export const LEVEL_DISCLAIMER = "Level represents mining progression, not guaranteed outcomes.";

/**
 * Create level badge component props
 */
export const createLevelBadgeProps = (levelNumber) => {
  const info = getLevelInfo(levelNumber);
  if (!info) return null;

  return {
    name: info.name,
    icon: info.icon,
    color: info.color,
    description: info.description,
    fullDescription: info.fullDescription,
    disclaimer: LEVEL_DISCLAIMER,
    isStreamA: info.isStreamA,
    isStreamB: info.isStreamB
  };
};

export default LEVEL_NAMES;
