import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis("redis://127.0.0.1:6379");
const queue = new Queue("booking", { connection });

async function checkJobs() {
  const waiting = await queue.getWaiting();
  const active = await queue.getActive();
  const completed = await queue.getCompleted();
  const failed = await queue.getFailed();

  console.log("Waiting:", waiting.map(j => j.id));
  console.log("Active:", active.map(j => j.id));
  console.log("Completed:", completed.map(j => j.id));
  console.log("Failed:", failed.map(j => j.id));
}

checkJobs();
