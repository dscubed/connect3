import { NextRequest, NextResponse } from "next/server";
import { fetchUserDetails } from "@/lib/users/fetchUserDetails";

interface RouteParameters {
    params: Promise<{ userId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParameters) {
    const { userId } = await params;
    try {
        const user = await fetchUserDetails(userId);
        console.log(user);
        if (!!user) {
            return NextResponse.json(
                user,
                { status: 200},
            )
        }
    } catch (error) {
       return NextResponse.json(
        { error: `Could not find user: ${error}` },
        { status: 404 }
      ); 
    }
    
}