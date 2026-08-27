/*
 * Task 10 — JavaScript Promises
 *
 * Rewrites saveTaskCallback (Task 8) as a Promise-based function.
 * Uses fs.promises.appendFile which returns a Promise instead of
 * taking a callback, allowing .then() / .catch() chaining.
 */

const fs = require("fs").promises;

function saveTaskPromise(task) {
  const entry = `[${new Date().toLocaleDateString("en-IN")}] ${task}\n`;
  return fs.appendFile("tasks.txt", entry).then(() => task);
}

// Chain .then() and .catch() to handle success / failure
saveTaskPromise("Learn Promises in Node.js")
  .then((task) => {
    console.log(`Task saved successfully: "${task}"`);
  })
  .catch((err) => {
    console.log("Failed to save task:", err.message);
  });

// Output:
// Task saved successfully: "Learn Promises in Node.js"
