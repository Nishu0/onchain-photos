import { NextResponse, NextRequest } from "next/server";
import { pinata } from "~/utils/config"

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const upload = await pinata.upload.public.file(file);
    
    // Create a simple gateway URL using the CID
    const gatewayUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${upload.cid}`;
    
    return NextResponse.json({ 
      url: gatewayUrl, 
      cid: upload.cid, 
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type 
    }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 