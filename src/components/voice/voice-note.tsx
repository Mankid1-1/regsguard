"use client";

import { useState, useCallback } from "react";
import { VoiceRecorder } from "@/components/voice/voice-recorder";
import { Button } from "@/components/ui/button";

interface VoiceNoteProps {
  projectId?: string;
  onSave?: (note: string) => void;
}

export function VoiceNote({ projectId, onSave }: VoiceNoteProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleTranscript = useCallback((text: string) => {
    setNote(text);
    setSaved(false);
  }, []);

  const handleSave = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      if (projectId) {
        const res = await fetch(`/api/projects/${projectId}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: trimmed, source: "voice" }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to save note");
        }
      }

      setSaved(true);
      onSave?.(trimmed);

      // Clear after short delay so user sees the success state
      setTimeout(() => {
        setNote("");
        setSaved(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Voice Recorder */}
      <VoiceRecorder
        onTranscript={handleTranscript}
        placeholder="Tap mic to dictate a note"
      />

      {/* Editable Textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="voice-note-text"
          className="block text-sm font-medium text-foreground"
        >
          Note
        </label>
        <textarea
          id="voice-note-text"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
          placeholder="Your voice transcript appears here. You can also type or edit..."
          rows={4}
          className="flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="md"
          loading={saving}
          disabled={!note.trim() || saving}
          onClick={handleSave}
        >
          {saved ? "Saved!" : "Save Note"}
        </Button>

        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Note saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
