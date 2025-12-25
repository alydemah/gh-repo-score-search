type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const CURRENT_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[CURRENT_LEVEL];
}

function format(level: LogLevel, message: string, meta?: unknown) {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  return meta ? `${base} ${JSON.stringify(meta)}` : base;
}

export const logger = {
  debug(message: string, meta?: unknown) {
    if (shouldLog("debug")) {
      console.debug(format("debug", message, meta));
    }
  },

  info(message: string, meta?: unknown) {
    if (shouldLog("info")) {
      console.info(format("info", message, meta));
    }
  },

  warn(message: string, meta?: unknown) {
    if (shouldLog("warn")) {
      console.warn(format("warn", message, meta));
    }
  },

  error(message: string, meta?: unknown) {
    if (shouldLog("error")) {
      console.error(format("error", message, meta));
    }
  },
};
