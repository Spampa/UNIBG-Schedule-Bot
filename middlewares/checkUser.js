import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const checkUser = async (username) => {
    const user = await prisma.user.findUnique({
        where: {
            username
        }
    });
    return user ? true : false;
}