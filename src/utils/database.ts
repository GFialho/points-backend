import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export const getConnection = () => {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
};
