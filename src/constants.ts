export const GAME_SETTINGS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 16,
  GAME_WORD: "GRIND",
  SKATE_LETTERS: ["G", "R", "I", "N", "D"],
} as const;

export const MESSAGES = {
  PLAYER_REQUIREMENT: `Game requires ${GAME_SETTINGS.MIN_PLAYERS}-${GAME_SETTINGS.MAX_PLAYERS} players`,
  DEFAULT_PLAYER_NAME: (index: number) => `Player ${index + 1}`,
} as const;

export const GAME_HISTORY_CACHE_TIME = 10;
