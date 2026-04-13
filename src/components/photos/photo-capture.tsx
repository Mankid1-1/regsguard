"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface CapturedPhoto {
  file: File;
  previewUrl: string;
  latitude?: number;
  longitude?: number;
}

interface PhotoCaptureProps {
  projectId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpload?: (photo: any) => void;
}

export function PhotoCapture({ projectId, onUpload }: PhotoCaptureProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, "pending" | "done" | "error">>({});
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // Location denied or unavailable — not critical
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    });
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Get GPS coordinates once for all photos in this batch
      const location = await getLocation();

      const newPhotos: CapturedPhoto[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const previewUrl = URL.createObjectURL(file);
        newPhotos.push({
          file,
          previewUrl,
          latitude: location?.latitude,
          longitude: location?.longitude,
        });
      }

      setPhotos((prev) => [...prev, ...newPhotos]);
      setError("");

      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleUpload = async () => {
    if (photos.length === 0) return;

    setUploading(true);
    setError("");

    const progress: Record<number, "pending" | "done" | "error"> = {};
    photos.forEach((_, i) => {
      progress[i] = "pending";
    });
    setUploadProgress({ ...progress });

    let hasErrors = false;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const formData = new FormData();
      formData.append("file", photo.file);
      if (photo.latitude != null) {
        formData.append("latitude", String(photo.latitude));
      }
      if (photo.longitude != null) {
        formData.append("longitude", String(photo.longitude));
      }

      try {
        const res = await fetch(`/api/projects/${projectId}/photos`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Upload failed");
        }

        const result = await res.json();
        progress[i] = "done";
        setUploadProgress({ ...progress });
        onUpload?.(result);
      } catch {
        progress[i] = "error";
        setUploadProgress({ ...progress });
        hasErrors = true;
      }
    }

    if (!hasErrors) {
      // Clear all photos on full success
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotos([]);
      setUploadProgress({});
    } else {
      setError("Some photos failed to upload. You can retry.");
    }

    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Take Photo Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
            />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Take Photo</p>
          <p className="text-xs text-muted-foreground">
            Camera or gallery
          </p>
        </div>
      </button>

      {/* Thumbnail Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={`Captured photo ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Upload status overlay */}
              {uploadProgress[index] === "done" && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/30">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
              {uploadProgress[index] === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/30">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}

              {/* Remove button */}
              {!uploading && (
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* GPS badge */}
              {photo.latitude != null && (
                <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                  GPS
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Upload Button */}
      {photos.length > 0 && (
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full"
          loading={uploading}
          disabled={uploading}
          onClick={handleUpload}
        >
          Upload {photos.length} Photo{photos.length > 1 ? "s" : ""}
        </Button>
      )}
    </div>
  );
}
