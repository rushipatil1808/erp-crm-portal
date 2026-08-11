import { prisma } from '../config/db';

export async function generateChallanNo(): Promise<string> {
  const count = await prisma.challan.count();
  const nextNum = (count + 1).toString().padStart(5, '0');
  const year = new Date().getFullYear();
  return `CH-${year}-${nextNum}`;
}
