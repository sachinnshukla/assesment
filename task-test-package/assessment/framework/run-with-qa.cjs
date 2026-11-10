const readline = require("node:readline");
const { Writable } = require("node:stream");
const { spawn } = require("node:child_process");

async function main() {
  const separator = process.argv.indexOf("--");
  if (separator !== 2 || !process.argv[3]) {
    throw new Error("Usage: node assessment/framework/run-with-qa.cjs -- <test command> [arguments]");
  }
  const env = { ...process.env };
  if (!env.QA_BASE_URL || !env.QA_PASSWORD) {
    if (!process.stdin.isTTY) {
      throw new Error("Set QA_BASE_URL and QA_PASSWORD or run this command in an interactive terminal.");
    }
    let muted = false;
    const output = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) process.stdout.write(chunk, encoding);
        callback();
      },
    });
    const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
    const ask = (question) => new Promise((resolve) => rl.question(question, resolve));
    try {
      if (!env.QA_BASE_URL) env.QA_BASE_URL = await ask("Local QA server URL: ");
      if (!env.QA_EMAIL) env.QA_EMAIL = (await ask("Login email [seeded admin]: ")).trim();
      if (!env.QA_PASSWORD) {
        process.stdout.write("Password (hidden): ");
        muted = true;
        env.QA_PASSWORD = await ask("");
        muted = false;
        process.stdout.write("\n");
      }
    } finally {
      rl.close();
    }
  }
  if (!env.QA_BASE_URL || !env.QA_PASSWORD) throw new Error("Server URL and password are required.");
  const url = new URL(env.QA_BASE_URL);
  if (!["http:", "https:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) ||
      url.username || url.password) {
    throw new Error("The QA server URL must be local and must not contain credentials.");
  }
  const child = spawn(process.argv[3], process.argv.slice(4), { env, stdio: "inherit" });
  child.on("error", (error) => {
    console.error(`Unable to start test command: ${error.message}`);
    process.exitCode = 1;
  });
  child.on("exit", (code, signal) => {
    if (signal) {
      console.error(`Test command stopped by ${signal}.`);
      process.exitCode = 1;
    } else {
      process.exitCode = code;
    }
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
