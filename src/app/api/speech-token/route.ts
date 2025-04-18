import { NextResponse } from "next/server";

export async function GET() {
  const speechKey = process.env.AZURE_API_KEY;
  const speechRegion = process.env.AZURE_REGION;

  if (!speechKey || !speechRegion) {
    return NextResponse.json(
      { error: "Speech service configuration is missing" },
      { status: 400 }
    );
  }

  const headers = {
    "Ocp-Apim-Subscription-Key": speechKey,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  try {
    const tokenResponse = await fetch(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: "POST",
        headers: headers,
      }
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get token" },
        { status: tokenResponse.status }
      );
    }

    const token = await tokenResponse.text();
    return NextResponse.json({ token, region: speechRegion });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to issue token" },
      { status: 500 }
    );
  }
}
