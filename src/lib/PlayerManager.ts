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
    return this.players.filter(p => !p.isEliminated);
  }

  public addLetter(playerId: number): boolean {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) return false;

    const wordParts = this.GAME_WORD.split(".");
    if (player.letters.length >= wordParts.length) return false;

    // Get the next letter based on the current number of letters
    const nextLetter = wordParts[player.letters.length];
    player.letters.push(nextLetter);

    // Check if player has all letters of the word (without dots)
    if (player.letters.join("") === wordParts.join("")) {
      player.isEliminated = true;
      return true; // Player was eliminated
    }
    
    return false; // Player was not eliminated
  }

  public checkGameOver(): boolean {
    return this.getActivePlayers().length <= 1;
  }

  public getWinner(): Player | null {
    const activePlayers = this.getActivePlayers();
    return activePlayers.length === 1 ? activePlayers[0] : null;
  }

  public updatePlayer(playerId: number, updates: Partial<Player>): void {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      Object.assign(player, updates);
    }
  }

  public resetStreaks(): void {
    this.players.forEach(player => {
      player.streak = 0;
    });
  }
}
