/**
 * Move PrismaClient global handling here; avoid new PrismaClient() in multiple files.
 */

import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient();

// Gracefully handle shutdown
process.on("beforeExit", async () => {
  logger.info("Process beforeExit: shutting down Prisma");
  await prisma.$disconnect();
});

export default prisma;
export { prisma };
