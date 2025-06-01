/* eslint-disable no-console */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogLevelConfig = {
  debug: number;
  info: number;
  warn: number;
  error: number;
};

type LogStyleConfig = {
  debug: string;
  info: string;
  warn: string;
  error: string;
};

type ConsoleMethodConfig = {
  debug: 'debug' | 'log';
  info: 'info' | 'log';
  warn: 'warn' | 'log';
  error: 'error' | 'log';
};

type LoggerOptions = {
  level?: LogLevel;
  prefix?: string;
};

type LoggerConfig = {
  level: LogLevel;
  prefix: string;
  threshold: number;
};

const LOG_LEVEL = (import.meta.env.DEV ? 'debug' : 'warn') satisfies LogLevel;

const LEVELS: LogLevelConfig = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

const STYLES: LogStyleConfig = {
  debug: 'color: #9AA2AA; font-weight: bold',
  info: 'color: #659AD2; font-weight: bold',
  warn: 'color: #F9C749; font-weight: bold',
  error: 'color: #EC3D47; font-weight: bold',
};

const METHODS: ConsoleMethodConfig = {
  debug: typeof console.debug === 'function' ? 'debug' : 'log',
  info: typeof console.info === 'function' ? 'info' : 'log',
  warn: typeof console.warn === 'function' ? 'warn' : 'log',
  error: typeof console.error === 'function' ? 'error' : 'log',
};

/**
 * Enhanced Logger class with explicit log methods.
 */
class Logger {
  private config: LoggerConfig;

  constructor(options: LoggerOptions = {}) {
    const { prefix = '', level = LOG_LEVEL } = options;

    this.config = {
      level,
      prefix,
      threshold: LEVELS[level],
    };
  }

  /**
   * Log a debug message.
   * @param message Message to log
   * @param data Additional data (optional)
   */
  debug(message: string, data?: object): void {
    this.log('debug', message, data);
  }

  /**
   * Log an info message.
   * @param message Message to log
   * @param data Additional data (optional)
   */
  info(message: string, data?: object): void {
    this.log('info', message, data);
  }

  /**
   * Log a warning message.
   * @param message Message to log
   * @param data Additional data (optional)
   */
  warn(message: string, data?: object): void {
    this.log('warn', message, data);
  }

  /**
   * Log an error message.
   * @param message Message to log
   * @param data Additional data (optional)
   */
  error(message: string, data?: object): void {
    this.log('error', message, data);
  }

  /**
   * Generic log method.
   * @param level Log level
   * @param message Message to log
   * @param data Additional data
   */
  log(level: LogLevel, message: string, data?: object): void {
    if (!(level in LEVELS)) level = 'info';

    const levelValue = LEVELS[level];
    const { threshold } = this.config;

    if (levelValue < threshold) return;

    const method = METHODS[level];
    const style = STYLES[level];
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';

    const timestamp = new Date().toISOString();
    const logArgs: unknown[] = [`%c${timestamp} ${prefix}[${level}]`, style, message];
    if (data) logArgs.push(data);

    console[method](...logArgs);
  }

  /**
   * Create a new logger with extended configuration.
   * @param options Additional logger options
   * @returns New Logger instance
   */
  clone(options: LoggerOptions = {}): Logger {
    return new Logger({
      level: this.config.level,
      prefix: this.config.prefix,
      ...options,
    });
  }
}

const logger = new Logger();

export default logger;
export { Logger, type LoggerOptions };
