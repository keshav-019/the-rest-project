import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { email } = await req.json(); // 👈 NEW

        const secret = generateSecret();

        const uri = generateURI({
            issuer: "API Nexus",
            label: email || "user", // 👈 REAL USER
            secret,
        });

        const qrCode = await QRCode.toDataURL(uri);

        return NextResponse.json({
            secret,
            qrCode,
        });

    } catch (error: any) {
        console.error("2FA SETUP ERROR:", error);

        return NextResponse.json(
            { error: error.message || "Failed to generate 2FA" },
            { status: 500 }
        );
    }
}