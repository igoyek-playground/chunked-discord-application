import chalk from "chalk";

function timestamp(): string {
  return chalk.gray(`[${new Date().toLocaleTimeString("pl-PL")}]`);
}

export const logger = {
  success(message: string): void {
    console.log(`${timestamp()} ${chalk.green("✓")} ${message}`);
  },

  error(message: string, error?: unknown): void {
    console.log(`${timestamp()} ${chalk.red("✗")} ${chalk.red(message)}`);
    if (error !== undefined) {
      console.error(chalk.red(error instanceof Error ? (error.stack ?? error.message) : error));
    }
  },

  warn(message: string): void {
    console.log(`${timestamp()} ${chalk.yellow("!")} ${chalk.yellow(message)}`);
  },

  info(message: string): void {
    console.log(`${timestamp()} ${chalk.cyan("i")} ${message}`);
  },

  debug(message: string): void {
    if (process.env.NODE_ENV !== "development") return;
    console.log(`${timestamp()} ${chalk.magenta("»")} ${chalk.gray(message)}`);
  },

  welcomer(): void {
    console.log(`${timestamp()} ${chalk.red("~")} ${chalk.redBright("Bot created with \❤️  by igoyek <3")}`);
  }
};
