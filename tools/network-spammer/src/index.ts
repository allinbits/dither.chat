import dotenv from "dotenv";
import { publishSomething } from "./logic";
dotenv.config();

const interval = parseInt(process.env.INTERVAL_MS || "5000", 10);

setInterval(() => {
  publishSomething();
}, interval);

console.log(`[runner] Running every ${interval}ms`);
