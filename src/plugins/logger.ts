/**
 * Logger plugin for console logging state changes.
 *
 * @module plugins/logger
 */

// Global type declarations
declare const window: {
  document: unknown;
} | undefined;

import type { Plugin, Store } from '../types.js';

/**
 * Log level for filtering messages.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger options.
 */
export interface LoggerOptions<TState = unknown> {
  /** Log level filter (default: 'debug') */
  level?: LogLevel;
  /** Custom logger (default: console) */
  logger?: Console;
  /** Use collapsed console groups (default: true) */
  collapsed?: boolean;
  /** Show state diff (default: true) */
  diff?: boolean;
  /** Colorize output (default: true in browsers) */
  colors?: boolean;
  /** Show timestamp (default: true) */
  timestamp?: boolean;
  /** Filter function to skip certain changes */
  filter?: (state: TState, prevState: TState) => boolean;
  /** Transform state before logging */
  stateTransformer?: (state: TState) => unknown;
  /** Custom action name (default: 'STATE_CHANGE') */
  actionName?: string | ((state: TState, prevState: TState) => string);
  /** Name for this logger instance */
  name?: string;
  /** Enabled flag (default: true) */
  enabled?: boolean;
}

/**
 * Log level priority.
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Console colors for different parts of the log.
 */
const COLORS = {
  title: '#9E9E9E',
  prevState: '#9E9E9E',
  action: '#03A9F4',
  nextState: '#4CAF50',
  error: '#F44336',
  diff: {
    added: '#4CAF50',
    removed: '#F44336',
    changed: '#2196F3',
  },
};

/**
 * Format timestamp.
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Calculate diff between two states.
 */
function calculateDiff<T>(prevState: T, nextState: T): Record<string, { prev: any; next: any }> {
  const diff: Record<string, { prev: any; next: any }> = {};

  if (typeof prevState !== 'object' || typeof nextState !== 'object') {
    if (prevState !== nextState) {
      diff['value'] = { prev: prevState, next: nextState };
    }
    return diff;
  }

  if (prevState === null || nextState === null) {
    if (prevState !== nextState) {
      diff['value'] = { prev: prevState, next: nextState };
    }
    return diff;
  }

  const allKeys = new Set([
    ...Object.keys(prevState as object),
    ...Object.keys(nextState as object),
  ]);

  for (const key of allKeys) {
    const prev = (prevState as any)[key];
    const next = (nextState as any)[key];

    if (prev !== next) {
      diff[key] = { prev, next };
    }
  }

  return diff;
}

/**
 * Check if running in browser.
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}

/**
 * Create a logger plugin.
 *
 * @param options - Logger options
 * @returns A logger plugin
 *
 * @example
 * ```typescript
 * import { createStore, logger } from '@oxog/state';
 *
 * // Basic usage
 * const store = createStore({ count: 0 })
 *   .use(logger());
 *
 * // With options
 * const store = createStore({ count: 0 })
 *   .use(logger({
 *     level: 'info',
 *     collapsed: false,
 *     diff: true,
 *     name: 'CounterStore',
 *   }));
 *
 * // Disabled in production
 * const store = createStore({ count: 0 })
 *   .use(logger({
 *     enabled: process.env.NODE_ENV !== 'production',
 *   }));
 * ```
 */
export function logger<TState = unknown>(
  options: LoggerOptions<TState> = {}
): Plugin<TState> {
  const {
    level = 'debug',
    logger: customLogger = console,
    collapsed = true,
    diff = true,
    colors = isBrowser(),
    timestamp = true,
    filter,
    stateTransformer,
    actionName = 'STATE_CHANGE',
    name = 'Store',
    enabled = true,
  } = options;

  const minLevel = LOG_LEVELS[level];

  return {
    name: 'logger',
    version: '1.0.0',

    install(store: Store<TState>) {
      if (!enabled) return;

      // Subscribe to state changes
      store.subscribe((state, prevState) => {
        // Check filter
        if (filter && !filter(state, prevState)) {
          return;
        }

        // Skip if log level too low
        if (LOG_LEVELS.info < minLevel) {
          return;
        }

        const now = new Date();
        const action = typeof actionName === 'function'
          ? actionName(state, prevState)
          : actionName;

        // Transform states if needed
        const displayPrevState = stateTransformer ? stateTransformer(prevState) : prevState;
        const displayNextState = stateTransformer ? stateTransformer(state) : state;

        // Build title
        const timeStr = timestamp ? ` @ ${formatTime(now)}` : '';
        const title = `${name} ${action}${timeStr}`;

        // Log with grouping
        if (colors && isBrowser()) {
          logWithColors(
            customLogger,
            title,
            displayPrevState,
            displayNextState,
            collapsed,
            diff ? calculateDiff(prevState, state) : undefined
          );
        } else {
          logPlain(
            customLogger,
            title,
            displayPrevState,
            displayNextState,
            collapsed,
            diff ? calculateDiff(prevState, state) : undefined
          );
        }
      });
    },
  };
}

/**
 * Log with colors (browser).
 */
function logWithColors(
  log: Console,
  title: string,
  prevState: unknown,
  nextState: unknown,
  collapsed: boolean,
  diff?: Record<string, { prev: any; next: any }>
): void {
  const titleStyle = `color: ${COLORS.title}; font-weight: lighter;`;
  const groupMethod = collapsed ? 'groupCollapsed' : 'group';

  log[groupMethod](`%c${title}`, titleStyle);

  log.log('%cprev state', `color: ${COLORS.prevState}; font-weight: bold;`, prevState);
  log.log('%cnext state', `color: ${COLORS.nextState}; font-weight: bold;`, nextState);

  if (diff && Object.keys(diff).length > 0) {
    log.log('%cdiff', `color: ${COLORS.action}; font-weight: bold;`);
    for (const [key, { prev, next }] of Object.entries(diff)) {
      log.log(
        `  %c${key}:`,
        `color: ${COLORS.diff.changed};`,
        prev,
        '→',
        next
      );
    }
  }

  log.groupEnd();
}

/**
 * Log without colors (Node.js or no color support).
 */
function logPlain(
  log: Console,
  title: string,
  prevState: unknown,
  nextState: unknown,
  collapsed: boolean,
  diff?: Record<string, { prev: any; next: any }>
): void {
  const hasGroupCollapsed = typeof log.groupCollapsed === 'function';
  const groupMethod = collapsed && hasGroupCollapsed ? 'groupCollapsed' : 'group';
  const hasGroup = typeof log[groupMethod] === 'function';

  if (hasGroup) {
    log[groupMethod](title);
  } else {
    log.log(`=== ${title} ===`);
  }

  log.log('prev state:', prevState);
  log.log('next state:', nextState);

  if (diff && Object.keys(diff).length > 0) {
    log.log('diff:');
    for (const [key, { prev, next }] of Object.entries(diff)) {
      log.log(`  ${key}:`, prev, '→', next);
    }
  }

  if (hasGroup) {
    log.groupEnd();
  } else {
    log.log('===');
  }
}

/**
 * Create a logger with preset options.
 *
 * @param defaultOptions - Default options
 * @returns A logger factory function
 *
 * @example
 * ```typescript
 * const devLogger = createLogger({
 *   enabled: process.env.NODE_ENV === 'development',
 *   collapsed: true,
 * });
 *
 * const store = createStore({ count: 0 })
 *   .use(devLogger({ name: 'Counter' }));
 * ```
 */
export function createLogger<TState = unknown>(
  defaultOptions: LoggerOptions<TState> = {}
): (options?: LoggerOptions<TState>) => Plugin<TState> {
  return (options = {}) => logger({ ...defaultOptions, ...options });
}
