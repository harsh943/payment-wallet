"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function createOnRampTx(amount: number, provider: string) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const token  = Math.random().toString();
    // ? is chaining the optional property access operator to the user object
    if(!userId){
        return {
            message: "User not found"
        }
    }
    await prisma.onRampTransaction.create({
        data: {
            amount:amount*100,
            userId:Number(userId),
            status:"Processing",
            startTime:new Date().toISOString(),
            provider,
            token:token
        }
    })
    return {
        message: "Onramp Transaction created"
    }
}