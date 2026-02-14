import { NextResponse } from "next/server";
import sharp from "sharp";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export async function POST(req: Request) {
  // Parse the incoming file from the request
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Blur the image using sharp
  const blurredBuffer = await sharp(buffer)
    .resize(256, 256, { fit: "cover" })
    .blur(32)
    .png()
    .toBuffer();

  // Return the blurred image as a response
  return new NextResponse(new Uint8Array(blurredBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="blurred.png"`,
    },
  });
}
