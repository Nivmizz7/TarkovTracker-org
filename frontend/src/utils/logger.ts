/**
 * Simple logger utility for client-side logging
 */
export const logger = {
  /**
   * Log an error message
   */
  error(message: string, error?: unknown): void {
    console.error(message, error);
  },

  /**
   * Log a warning message
   */
  warn(message: string, details?: unknown): void {
    console.warn(message, details);
  },

  /**
   * Log an info message
   */
  info(message: string, details?: unknown): void {
    console.info(message, details);
  },

  /**
   * Log a debug message
   */
  debug(message: string, details?: unknown): void {
    console.debug(message, details);
  },
};
