import { Metadata } from "next";
import SpeechToText from "@/components/speech-to-text/speech-to-text";

export const metadata: Metadata = {
  title: "Speech to Text",
  description: "Convert speech to text using Azure Cognitive Services",
};

export default function SpeechToTextPage() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Speech to Text Conversion</h1>
      <p className="text-muted-foreground mb-6">
        Use this tool to convert your speech to text. You can speak into your
        microphone, upload an audio file, or try the text-to-speech demo.
      </p>
      <SpeechToText className="max-w-3xl" />
    </main>
  );
}
