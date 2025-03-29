import { NextResponse } from "next/server"
import prisma from "@repo/db/client";
export const dynamic = 'force-dynamic'
export const GET = async () => {
    await prisma.user.create({
        data: {
            email: "asd",
            name: "adsads",
            number: "123",
            password: "123"
        }
    })
    return NextResponse.json({
        message: "hi there"
    })
}