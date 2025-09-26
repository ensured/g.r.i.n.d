export const GAME_SETTINGS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 16,
  GAME_WORD: 'GRIND',
} as const;

export const MESSAGES = {
  PLAYER_REQUIREMENT: `Game requires ${GAME_SETTINGS.MIN_PLAYERS}-${GAME_SETTINGS.MAX_PLAYERS} players`,
  DEFAULT_PLAYER_NAME: (index: number) => `Player ${index + 1}`,
} as const;
