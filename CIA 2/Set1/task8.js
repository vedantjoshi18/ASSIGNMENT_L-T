/*
 * Task 8 — Asynchronous Programming & Callback Functions
 *
 * Demonstrates the error-first callback pattern used in Node.js.
 * fs.appendFile hands the result to our callback: (err) => { ... }
 * If err is null, the operation succeeded; otherwise it failed.
 */

const fs = require("fs");

// Error-first callback pattern
function saveTaskCallback(task, callback) {
  const entry = `[${new Date().toLocaleDateString("en-IN")}] ${task}\n`;
  fs.appendFile("tasks.txt", entry, (err) => {
    callback(err, task);
  });
}

// Call the function and handle result in the callback
saveTaskCallback("Complete Node.js assignment", (err, task) => {
  if (err) {
    console.log("Failed to save task:", err.message);
  } else {
    console.log(`Task saved successfully: "${task}"`);
  }
});

// Output:
// Task saved successfully: "Complete Node.js assignment"
