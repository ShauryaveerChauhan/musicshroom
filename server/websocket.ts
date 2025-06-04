import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

try {
  // Your server initialization code here...

} catch (error) {
  console.error('Failed to start server:', error);
  process.stderr.write(`Failed to start server: ${error}\n`);
  process.exit(1);
}

async function getUserInfo(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    process.stderr.write(`Error getting user info: ${error}\n`);
    return null;
  }
}
