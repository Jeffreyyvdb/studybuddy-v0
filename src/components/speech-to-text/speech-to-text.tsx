"use client";

import React, { useState } from "react";
import { getTokenOrRefresh } from "@/lib/speech-token";
import * as speechsdk from "microsoft-cognitiveservices-speech-sdk";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SpeechToTextProps {
  className?: string;
}

export function SpeechToText({ className }: SpeechToTextProps) {
  const [displayText, setDisplayText] = useState("Ready to transcribe speech");
  const [isListening, setIsListening] = useState(false);
  const [player, setPlayer] = useState<{
    audioDestination?: speechsdk.SpeakerAudioDestination;
    muted: boolean;
  }>({ muted: false });
  const [recognizer, setRecognizer] =
    useState<speechsdk.SpeechRecognizer | null>(null);

  async function sttFromMic() {
    try {
      const tokenObj = await getTokenOrRefresh();

      if (!tokenObj.authToken) {
        setDisplayText(`ERROR: ${tokenObj.error}`);
        return;
      }

      setIsListening(true);
      setDisplayText("Listening... speak into your microphone");

      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
        tokenObj.authToken,
        tokenObj.region
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizerInstance = new speechsdk.SpeechRecognizer(
        speechConfig,
        audioConfig
      );

      // Fix the event handlers for real-time transcription
      recognizerInstance.recognized = (s, e) => {
        if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          // Only add the final recognized text if it's not empty
          if (e.result.text.trim()) {
            setDisplayText((prev) => {
              // Remove any interim results first
              const finalText = prev
                .split("\n")
                .filter((line) => !line.endsWith("..."))
                .join("\n");

              // Add the new final result
              return `${finalText}\n${e.result.text}`;
            });
          }
        }
      };

      recognizerInstance.recognizing = (s, e) => {
        // This shows interim results while the user is speaking
        if (e.result.reason === speechsdk.ResultReason.RecognizingSpeech) {
          setDisplayText((prev) => {
            // Remove any previous interim results (keeping only final results)
            const finalText = prev
              .split("\n")
              .filter((line) => !line.endsWith("..."))
              .join("\n");

            // Add the new interim result with "..." marker
            return `${finalText}\n${e.result.text}...`;
          });
        }
      };

      recognizerInstance.canceled = (s, e) => {
        setIsListening(false);
        if (e.reason === speechsdk.CancellationReason.Error) {
          setDisplayText((prev) => `${prev}\nERROR: ${e.errorDetails}`);
        }
        recognizerInstance.stopContinuousRecognitionAsync();
      };

      recognizerInstance.sessionStopped = () => {
        setIsListening(false);
        recognizerInstance.stopContinuousRecognitionAsync();
      };

      // Clear any previous text and start listening
      setDisplayText("Listening...");

      // Start continuous recognition
      recognizerInstance.startContinuousRecognitionAsync(
        () => {
          // Success callback
          setRecognizer(recognizerInstance); // Store the recognizer
        },
        (error) => {
          console.error(error);
          setIsListening(false);
          setDisplayText("ERROR: Could not start speech recognition.");
        }
      );

      // Add a stop button functionality
      return recognizerInstance; // Store this in a state if you want to stop recognition later
    } catch (error) {
      console.error(error);
      setIsListening(false);
      setDisplayText(
        "ERROR: Could not connect to speech service. Please check your configuration."
      );
      return null;
    }
  }

  async function textToSpeech() {
    try {
      const tokenObj = await getTokenOrRefresh();

      if (!tokenObj.authToken) {
        setDisplayText(`ERROR: ${tokenObj.error}`);
        return;
      }

      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
        tokenObj.authToken,
        tokenObj.region
      );
      const audioDestination = new speechsdk.SpeakerAudioDestination();
      setPlayer({ audioDestination, muted: false });

      const audioConfig =
        speechsdk.AudioConfig.fromSpeakerOutput(audioDestination);
      const synthesizer = new speechsdk.SpeechSynthesizer(
        speechConfig,
        audioConfig
      );

      const textToSpeak =
        "This is an example of speech synthesis for a long passage of text. Pressing the mute button should pause or resume the audio output.";
      setDisplayText(`Speaking text: ${textToSpeak}...`);

      synthesizer.speakTextAsync(
        textToSpeak,
        (result) => {
          if (
            result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted
          ) {
            setDisplayText(`Synthesis finished for "${textToSpeak}".`);
          } else if (result.reason === speechsdk.ResultReason.Canceled) {
            setDisplayText(
              `Synthesis failed. Error detail: ${result.errorDetails}.`
            );
          }
          synthesizer.close();
        },
        (error) => {
          setDisplayText(`Error: ${error}.`);
          synthesizer.close();
        }
      );
    } catch (error) {
      console.error(error);
      setDisplayText(
        "ERROR: Could not connect to speech service. Please check your configuration."
      );
    }
  }

  function handleMute() {
    setPlayer((prevState) => {
      if (!prevState.audioDestination) return prevState;

      if (!prevState.muted) {
        prevState.audioDestination.pause();
        return { ...prevState, muted: true };
      } else {
        prevState.audioDestination.resume();
        return { ...prevState, muted: false };
      }
    });
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const audioFile = event.target.files[0];
    const fileInfo = `${audioFile.name} (${audioFile.size} bytes)`;
    setDisplayText(fileInfo);

    try {
      const tokenObj = await getTokenOrRefresh();

      if (!tokenObj.authToken) {
        setDisplayText(`ERROR: ${tokenObj.error}`);
        return;
      }

      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
        tokenObj.authToken,
        tokenObj.region
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
      const recognizer = new speechsdk.SpeechRecognizer(
        speechConfig,
        audioConfig
      );

      recognizer.recognizeOnceAsync((result) => {
        if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          setDisplayText(`${fileInfo} - RECOGNIZED: ${result.text}`);
        } else {
          setDisplayText(
            "ERROR: Speech was cancelled or could not be recognized."
          );
        }
      });
    } catch (error) {
      console.error(error);
      setDisplayText("ERROR: Could not process audio file.");
    }
  }

  function stopRecognition() {
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          setIsListening(false);
          setRecognizer(null);
        },
        (error) => {
          console.error("Error stopping recognition:", error);
        }
      );
    }
  }

  return (
    <div className={`speech-container ${className}`}>
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Speech Recognition</h2>

        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <Button
              onClick={isListening ? stopRecognition : sttFromMic}
              className="flex items-center gap-2"
            >
              <span className="material-icons">
                {isListening ? "stop" : "mic"}
              </span>
              {isListening ? "Stop Listening" : "Convert Speech to Text"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("audio-file")?.click()}
                className="flex items-center gap-2"
              >
                <span className="material-icons">audio_file</span>
                Upload Audio File
              </Button>
              <input
                type="file"
                id="audio-file"
                onChange={handleFileChange}
                accept="audio/wav"
                className="hidden"
              />
            </div>

            <Button
              onClick={textToSpeech}
              variant="outline"
              className="flex items-center gap-2"
            >
              <span className="material-icons">volume_up</span>
              Text to Speech Demo
            </Button>

            <Button
              onClick={handleMute}
              variant="outline"
              disabled={!player.audioDestination}
              className="flex items-center gap-2"
            >
              <span className="material-icons">
                {player.muted ? "volume_off" : "volume_mute"}
              </span>
              {player.muted ? "Resume Audio" : "Pause Audio"}
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-md min-h-[100px] whitespace-pre-wrap">
            {displayText}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SpeechToText;
