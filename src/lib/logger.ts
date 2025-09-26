// Simple in-memory log store
const browserLogs: string[] = [];
const MAX_BROWSER_LOGS = 100;

const formatLogMessage = (message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (data) {
    try {
      logMessage += '\n' + JSON.stringify(data, (key, value) => {
        // Handle circular references
        if (typeof value === 'object' && value !== null) {
          return value;
        }
        return value;
      }, 2);
    } catch (e) {
      logMessage += ' [Error stringifying data]';
    }
  }
  
  return logMessage + '\n';
};

export class GameLogger {
  static log(message: string, data?: any) {
    const logMessage = formatLogMessage(message, data);
    
    // Always log to console
    console.log(`[GAME] ${logMessage}`);
    
    // Store logs in memory
    browserLogs.push(logMessage);
    // Keep only the most recent logs
    if (browserLogs.length > MAX_BROWSER_LOGS) {
      browserLogs.shift();
    }
  }

  static logGameState(state: any) {
    if (!state) {
      this.log('Game State Update: No state provided');
      return;
    }
    
    const { deck, currentCard, ...rest } = state;
    this.log('Game State Update', {
      ...rest,
      deckSize: Array.isArray(deck) ? deck.length : 0,
      currentCard: currentCard?.name || 'None',
    });
  }

  static logTurn(turn: any) {
    this.log('Turn Processed', turn);
  }

  static logError(error: any) {
    const errorMessage = error instanceof Error 
      ? error.stack || error.message 
      : typeof error === 'object' 
        ? JSON.stringify(error) 
        : String(error);
    this.log(`ERROR: ${errorMessage}`);
  }
  
  // Method to get logs (useful for debugging in browser)
  static getLogs(): string[] {
    return [...browserLogs];
  }
}

// Export the static GameLogger class directly
export const logger = GameLogger;
