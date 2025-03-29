"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function p2pTransfer(to: string, amount: number) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        throw new Error("Not authenticated");
    }

    // Convert amount to paise
    const amountInPaise = Math.round(amount * 100);
    
    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        throw new Error("Recipient not found");
    }

    if (Number(from) === toUser.id) {
        throw new Error("Cannot transfer to yourself");
    }

    await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
        const fromBalance = await tx.balance.findUnique({
            where: { userId: Number(from) },
        });
        
        if (!fromBalance || fromBalance.amount < amountInPaise) {
            throw new Error('Insufficient funds');
        }

        await tx.balance.update({
            where: { userId: Number(from) },
            data: { amount: { decrement: amountInPaise } },
        });

        await tx.balance.update({
            where: { userId: toUser.id },
            data: { amount: { increment: amountInPaise } },
        });

        await tx.p2pTransfer.create({
            data: {
                fromUserId: Number(from),
                toUserId: toUser.id,
                amount: amountInPaise,
                timestamp: new Date().toISOString()
            }
        });
    });
}