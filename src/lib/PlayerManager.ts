import { Player } from "@/types/types";

export class PlayerManager {
  private players: Player[] = [];
  private readonly GAME_WORD = "G.R.I.N.D";

  constructor(players: Player[] = []) {
    this.players = [...players];
  }

  public getPlayers(): Player[] {
    return [...this.players];
  }

  public getActivePlayers(): Player[] {
    return this.players.filter((p) => !p.isEliminated);
  }

  public addLetter(playerId: number): boolean {
    let playerEliminated = false;

    this.players = this.players.map((player) => {
      if (player.id !== playerId || player.isEliminated) return player;

      const wordParts = this.GAME_WORD.split(".");
      if (player.letters.length >= wordParts.length) return player;

      const nextLetter = wordParts[player.letters.length];
      const newLetters = [...player.letters, nextLetter];

      // Check if player has all letters of the word (without dots)
      if (newLetters.join("") === wordParts.join("")) {
        playerEliminated = true;
        return { ...player, letters: newLetters, isEliminated: true };
      }

      return { ...player, letters: newLetters };
    });

    return playerEliminated;
  }

  public checkGameOver(): boolean {
    return this.getActivePlayers().length <= 1;
  }

  public getWinner(): Player | null {
    const activePlayers = this.getActivePlayers();
    return activePlayers.length === 1 ? activePlayers[0] : null;
  }

  /**
   * Initialize players with the given names
   * @param playerNames Array of player names
   */
  public initializePlayers(playerNames: string[]): void {
    this.players = playerNames.map((name, index) => ({
      id: index,
      name,
      score: 0,
      tricksLanded: 0,
      tricksAttempted: 0,
      streak: 0,
      isEliminated: false,
      letters: [],
      isLeader: index === 0, // First player is the initial leader
    }));
  }

  public updatePlayer(playerId: number, updates: Partial<Player>): void {
    this.players = this.players.map((player) => {
      if (player.id === playerId) {
        return { ...player, ...updates };
      }
      return player;
    });
  }

  public resetStreaks(): void {
    this.players.forEach((player) => {
      player.streak = 0;
    });
  }
}
