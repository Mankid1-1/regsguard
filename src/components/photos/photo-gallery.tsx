"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  filePath: string;
  caption: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

interface PhotoGalleryProps {
  projectId: string;
  refreshKey?: number;
}

export function PhotoGallery({ projectId, refreshKey }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/photos`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch {
      // Silently fail — user can refresh
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos, refreshKey]);

  const handleDelete = async (photoId: string) => {
    if (!confirm("Delete this photo?")) return;

    setDeleting(photoId);
    try {
      const res = await fetch(`/api/projects/${projectId}/photos?photoId=${photoId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCoords = (lat: number, lng: number) => {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg className="h-6 w-6 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
        <svg
          className="mx-auto h-10 w-10 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
          />
        </svg>
        <p className="mt-2 text-sm text-muted-foreground">No photos yet</p>
      </div>
    );
  }

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/${photo.filePath}`}
              alt={photo.caption || "Job photo"}
              className="h-full w-full object-cover"
            />

            {/* Hover overlay with caption */}
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white">{photo.caption}</p>
              </div>
            )}

            {/* GPS indicator */}
            {photo.latitude != null && (
              <div className="absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white">
                GPS
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPhoto(null);
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-background shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Full size image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/${selectedPhoto.filePath}`}
              alt={selectedPhoto.caption || "Job photo"}
              className="w-full rounded-t-xl object-contain"
              style={{ maxHeight: "60vh" }}
            />

            {/* Photo details */}
            <div className="space-y-3 p-4">
              {selectedPhoto.caption && (
                <p className="text-sm font-medium text-foreground">
                  {selectedPhoto.caption}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{formatDate(selectedPhoto.createdAt)}</span>
                {selectedPhoto.latitude != null && selectedPhoto.longitude != null && (
                  <span>
                    {formatCoords(selectedPhoto.latitude, selectedPhoto.longitude)}
                  </span>
                )}
              </div>

              {/* Delete */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  loading={deleting === selectedPhoto.id}
                  disabled={deleting === selectedPhoto.id}
                  onClick={() => handleDelete(selectedPhoto.id)}
                >
                  Delete Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
