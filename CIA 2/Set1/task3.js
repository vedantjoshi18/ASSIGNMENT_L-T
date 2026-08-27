/*
 * Task 3: NodeJS Resources & Working with NodeJS Examples
 *
 * Official documentation referenced:
 *   https://nodejs.org/docs/latest/api/fs.html
 *
 * fs module methods used in this file:
 *   1. fs.readFile()  — reads a file asynchronously (non-blocking)
 *   2. fs.writeFile() — writes data to a file asynchronously
 *
 * The example below is adapted from the fs.readFile() docs:
 *   https://nodejs.org/docs/latest/api/fs.html#fsreadfilepath-options-callback
 */

const fs = require("fs");

// Adapted from the official Node.js fs.readFile() example
fs.readFile("tasks.txt", "utf-8", (err, data) => {
  if (err) {
    console.error("Could not read file:", err.message);
    return;
  }

  console.log("Tasks from tasks.txt:");
  console.log(data);
});

// Output:
// Tasks from tasks.txt:
// Buy groceries
// Finish Node.js assignment
// Review CIA 2 notes
// Submit lab report
