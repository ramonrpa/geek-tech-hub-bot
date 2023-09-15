const levelsColor = {
  info: "\x1b[32m",
  error: "\x1b[31m",
  warn: "\x1b[33m",
  debug: "\x1b[36m",
};

const printConsole = (
  level: "info" | "error" | "warn" | "debug",
  ...args: unknown[]
) => {
  const date = new Date();
  const dateString = date.toTimeString();
  const [time] = dateString.split(" ");

  const message = `${
    levelsColor[level]
  }[${time}/${level.toUpperCase()}]\x1b[0m ${args.join(" ")}`;

  console[level](message);
};

const error = (...args: unknown[]): void => {
  printConsole("error", ...args);
};

const warn = (...args: unknown[]): void => {
  printConsole("warn", ...args);
};

const info = (...args: unknown[]): void => {
  printConsole("info", ...args);
};

const debug = (...args: unknown[]): void => {
  printConsole("debug", ...args);
};

export const Logger = {
  error,
  warn,
  info,
  debug,
};
