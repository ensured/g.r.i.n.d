// Simple in-memory log store
const browserLogs: string[] = [];
const MAX_BROWSER_LOGS = 100;

// Define a type for the log data that can be any JSON-serializable value
type LoggableData = string | number | boolean | null | undefined | object | Array<unknown>;

const formatLogMessage = (message: string, data?: LoggableData): string => {
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
    } catch (error) {
      console.error('Failed to stringify log data:', error);
      logMessage += ' [Error stringifying data]';
    }
  }
  
  return logMessage + '\n';
};

export class GameLogger {
  static log(message: string, data?: LoggableData) {
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

  // Define a more specific type for the game state
  static logGameState(state: { deck?: unknown[]; currentCard?: { name?: string }; [key: string]: unknown } | null | undefined) {
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

  // Define a more specific type for the turn object
  static logTurn(turn: Record<string, unknown>) {
    this.log('Turn Processed', turn);
  }

  static logError(error: unknown) {
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
