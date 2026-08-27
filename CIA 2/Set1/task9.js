/*
 * Task 9 — Node Timers & Global Objects
 *
 * setTimeout  — runs a callback once after a delay
 * setInterval — runs a callback repeatedly at a fixed interval
 * clearInterval — stops a running interval
 * These are Node.js global objects (no require needed).
 */

const fs = require("fs");

console.log("Task Logger Started\n");

// setTimeout — reminder after 5 seconds
setTimeout(() => {
  console.log("[Reminder] Review your tasks!\n");
}, 5000);

// setInterval — print task count every 3 seconds
const intervalId = setInterval(() => {
  const data = fs.readFileSync("tasks.txt", "utf-8");
  const count = data.trim().split("\n").filter(Boolean).length;
  console.log(`Tasks logged so far: ${count}`);
}, 3000);

// clearInterval — stop after 15 seconds
setTimeout(() => {
  clearInterval(intervalId);
  console.log("\n[Interval cleared after 15 seconds]");
}, 15000);

// Output (approximate):
// Task Logger Started
//
// Tasks logged so far: 5       (at 3s)
// [Reminder] Review your tasks! (at 5s)
// Tasks logged so far: 5       (at 6s)
// Tasks logged so far: 5       (at 9s)
// Tasks logged so far: 5       (at 12s)
// Tasks logged so far: 5       (at 15s)
//
// [Interval cleared after 15 seconds]
