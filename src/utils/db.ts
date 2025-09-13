/**
 * Move PrismaClient global handling here; avoid new PrismaClient() in multiple files.
 */

import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient();

(prisma as any).$on("beforeExit", async () => {
  logger.info("Prisma beforeExit");
});

export default prisma;
export { prisma };
