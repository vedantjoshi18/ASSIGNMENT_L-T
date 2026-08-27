/*
 * How V8 and libuv work together:
 *
 * V8  – Parses and executes our JavaScript on a single thread.
 * libuv – Handles async I/O (file reads, network) in background
 *         threads and pushes callbacks onto the Event Loop once done.
 *
 * So V8 runs code line-by-line, offloads async work to libuv,
 * and never waits — that's why Node.js is non-blocking.
 */

/*
 * Task 4 — REPL-tested date snippet:
 *   > new Date().toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'2-digit' })
 *   // "27 Aug 2026"
 */

const fs = require("fs");

// Date formatting snippet (tested in Node REPL first)
function getTimestamp() {
  return new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

console.log("Task Logger Started");

// Task 5 — Accept task from command-line argument (process.argv)
const task = process.argv.slice(2).join(" ");

if (!task) {
  console.log("Usage: node logger.js <task description>");
  process.exit(1);
}

/*
 * Task 7 — Debugging
 *
 * Bug introduced: typo "taks" instead of "task" on the line below.
 * How it was found: ran `node --inspect logger.js "Test task"` which
 * threw "ReferenceError: taks is not defined" at line 39, col 48.
 * The stack trace pointed directly to the template literal below.
 * Fix: corrected "taks" → "task".
 */
console.log(`\nNew task: [${getTimestamp()}] ${task}`);

// Prompt user for confirmation using process.stdin
process.stdout.write("Save this task? (y/n): ");

process.stdin.once("data", (input) => {
  const answer = input.toString().trim().toLowerCase();

  if (answer === "y") {
    const entry = `[${getTimestamp()}] ${task}\n`;
    fs.appendFile("tasks.log", entry, (err) => {
      if (err) return console.error("Error saving:", err.message);
      console.log("Task saved to tasks.log!");
    });
  } else {
    console.log("Task discarded.");
  }

  process.stdin.destroy();
});

// Output (example):
// Task Logger Started
//
// New task: [27 Aug 2026] Complete homework
// Save this task? (y/n): y
// Task saved to tasks.log!

/*
 * Task 6 — Nodemon Setup
 *
 * Installed:  npm install --save-dev nodemon
 * Script:    "dev": "nodemon logger.js -- Demo task"
 * Run:        npm run dev
 *
 * Nodemon watches for file changes and automatically restarts
 * the app. Example: editing this file while nodemon is running
 * triggers "[nodemon] restarting due to changes..." in the terminal.
 */
