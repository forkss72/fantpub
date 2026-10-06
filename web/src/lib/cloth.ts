import type { ClothKey } from "./types";

/**
 * Clothbound series: every story is a cloth book stamped with a repeating foil motif.
 * Genre lives in the cloth colour, never in the UI theme.
 */
export type Cloth = {
  bg: string; // cloth base
  deep: string; // spine / shadow side
  foil: string; // stamped motif + title
  foilHi: string; // foil highlight
  label: string; // paper title label
  labelInk: string;
};

export const CLOTHS: Record<ClothKey, Cloth> = {
  forest: { bg: "#2b3a24", deep: "#1c2617", foil: "#cdb27a", foilHi: "#f1dea8", label: "#efe7d2", labelInk: "#1d1c17" },
  oxblood: { bg: "#5a2422", deep: "#3d1716", foil: "#d4b07a", foilHi: "#f4dcaa", label: "#f1e6d0", labelInk: "#2a1412" },
  ink: { bg: "#1f2a3d", deep: "#141c2a", foil: "#c9b27e", foilHi: "#efe0b0", label: "#ece5d3", labelInk: "#141c2a" },
  teal: { bg: "#1e4848", deep: "#133131", foil: "#d2bb85", foilHi: "#f2e2b2", label: "#ece6d4", labelInk: "#102828" },
  plum: { bg: "#432c4a", deep: "#2d1d32", foil: "#d6b98a", foilHi: "#f3e1b8", label: "#efe6d6", labelInk: "#24172a" },
  ochre: { bg: "#b48a3c", deep: "#8a6828", foil: "#2a2116", foilHi: "#4a3b25", label: "#f5eedc", labelInk: "#2a2116" },
  terracotta: { bg: "#a54d33", deep: "#7c3825", foil: "#f0d9a6", foilHi: "#fff0c9", label: "#f6eee0", labelInk: "#3a1a10" },
  olive: { bg: "#56612f", deep: "#3d4521", foil: "#e3cf96", foilHi: "#fbecc0", label: "#f1ead6", labelInk: "#262b14" },
  slate: { bg: "#3a4048", deep: "#272b31", foil: "#d1bd8c", foilHi: "#f0e2b9", label: "#ece7da", labelInk: "#1d2024" },
  sage: { bg: "#b9cf84", deep: "#93a862", foil: "#26301c", foilHi: "#3f4c2c", label: "#fbf8ee", labelInk: "#1d1c17" },
};

export function clothVars(key: ClothKey): Record<string, string> {
  const c = CLOTHS[key] ?? CLOTHS.forest;
  return {
    "--cloth": c.bg,
    "--cloth-deep": c.deep,
    "--foil": c.foil,
    "--foil-hi": c.foilHi,
    "--label": c.label,
    "--label-ink": c.labelInk,
  };
}

/** Human genre label colour chips (UI accents). */
export const GENRE_LABELS: Record<string, string> = {
  фантастика: "Фантастика",
  хоррор: "Жуткое",
  мистика: "Мистика",
  притча: "Притча",
  юмор: "Юмор",
  детектив: "Детектив",
  реализм: "Реализм",
  приключения: "Приключения",
  сказка: "Сказка",
};
