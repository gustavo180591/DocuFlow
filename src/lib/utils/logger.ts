export const log = {
  info: (...args: unknown[]) => {
    console.log(`[${new Date().toISOString()}]`, ...args);
  },
  error: (...args: unknown[]) => {
    console.error(`[${new Date().toISOString()}]`, ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(`[${new Date().toISOString()}]`, ...args);
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${new Date().toISOString()}]`, ...args);
    }
  }
};
