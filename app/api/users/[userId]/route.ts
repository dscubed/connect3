import { NextRequest, NextResponse } from "next/server";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";

interface RouteParameters {
    params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParameters) {
    const { userId } = await params;

    // Validate userId - return 400 if null, undefined, or "null" string
    if (!userId || userId === "null" || userId === "undefined") {
        return NextResponse.json(
            { error: "Invalid user ID" },
            { status: 400 }
        );
    }

    try {
        const user = await fetchUserDetails(userId);
        if (user) {
            return NextResponse.json(user, { status: 200 });
        }
        return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: `Could not find user: ${error}` },
            { status: 404 }
        );
    }
}