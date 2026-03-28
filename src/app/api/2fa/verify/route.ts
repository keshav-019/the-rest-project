import { NextResponse } from "next/server";
import { verify } from "otplib";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { token, secret } = await req.json();

        if (!token || !secret) {
            throw new Error("Missing token or secret");
        }

        // ✅ Verify token
        const result = await verify({ secret, token });

        return NextResponse.json({
            verified: result.valid,
        });

    } catch (error: any) {
        console.error("2FA VERIFY ERROR:", error);

        return NextResponse.json(
            { error: error.message || "Verification failed" },
            { status: 500 }
        );
    }
}