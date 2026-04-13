"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

// Extend Window to include webkitSpeechRecognition
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export function VoiceRecorder({
  onTranscript,
  placeholder = "Tap the mic and start talking...",
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support on mount
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as unknown as Record<string, unknown>).SpeechRecognition ||
          (window as unknown as Record<string, unknown>).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new (SpeechRecognition as new () => {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: (e: SpeechRecognitionEvent) => void;
      onerror: (e: SpeechRecognitionErrorEvent) => void;
      onend: () => void;
      start: () => void;
      stop: () => void;
      abort: () => void;
    })();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setFinalText((prev) => {
          const updated = prev ? prev + " " + final : final;
          onTranscript(updated);
          return updated;
        });
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      // "aborted" is normal when user stops — don't treat as error
      if (e.error !== "aborted") {
        console.error("Speech recognition error:", e.error);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleRecording = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      // Reset for a new session
      setInterimText("");
      setFinalText("");
      try {
        recognition.start();
        setIsRecording(true);
      } catch {
        // Already started — stop and restart
        recognition.stop();
      }
    }
  }, [isRecording]);

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-6 w-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">
          Voice input not available
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Your browser does not support speech recognition. Try Chrome or Edge
          on desktop, or Safari on iOS.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mic Button */}
      <button
        type="button"
        onClick={toggleRecording}
        className={`relative flex h-16 w-16 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isRecording
            ? "bg-destructive text-white shadow-lg"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
        }`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {/* Pulsing ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" />
        )}
        <svg
          className="relative z-10 h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          {isRecording ? (
            // Stop icon
            <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
          ) : (
            // Mic icon
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          )}
        </svg>
      </button>

      {/* Status Label */}
      <p className="text-sm font-medium text-muted-foreground">
        {isRecording ? "Listening... Tap to stop" : placeholder}
      </p>

      {/* Live Transcript */}
      {(finalText || interimText) && (
        <div className="w-full rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-sm text-foreground">
            {finalText}
            {interimText && (
              <span className="text-muted-foreground italic">
                {finalText ? " " : ""}
                {interimText}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Clear button */}
      {finalText && !isRecording && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setFinalText("");
            setInterimText("");
            onTranscript("");
          }}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
