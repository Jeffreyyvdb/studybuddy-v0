// app/api/speech-to-text/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { audioData } = await req.json();
  const subscriptionKey = process.env.AZURE_API_KEY;
  const speechApiUrl = `${process.env.AZURE_COGNITIVE_SERVICE_ENDPOINT}`;
  const response = await fetch(speechApiUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey || "",
      "Content-Type": "audio/wav",
    },
    body: audioData,
  });

  if (!response.ok) {
    return NextResponse.json({ error: response.statusText }, { status: 500 });
  }
  const data = await response.json();
  return NextResponse.json({ transcript: data.DisplayText });
}
