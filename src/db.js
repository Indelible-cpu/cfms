import { PrismaClient } from '@prisma/client';

// Start a single reusable connection instance
export const prisma = new PrismaClient();

// Example function: Add a new user
export async function createUser(email, name) {
  const newUser = await prisma.user.create({
    data: { email, name },
  });
  return newUser;
}

// Example function: Fetch all users
export async function getAllUsers() {
  return await prisma.user.findMany();
}
