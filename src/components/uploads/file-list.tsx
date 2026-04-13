"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

interface FileUploadRecord {
  id: string;
  userId: string;
  documentId: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  createdAt: string;
}

interface FileListProps {
  documentId?: string;
  userId?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isPdf(fileType: string, fileName: string): boolean {
  return (
    fileType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  );
}

function isImage(fileType: string, fileName: string): boolean {
  return (
    fileType.startsWith("image/") ||
    /\.(png|jpe?g|heic)$/i.test(fileName)
  );
}

function FileIcon({ fileType, fileName }: { fileType: string; fileName: string }) {
  if (isPdf(fileType, fileName)) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-destructive/80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }

  if (isImage(fileType, fileName)) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-primary/80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-muted-foreground"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function FileList({ documentId }: FileListProps) {
  const [files, setFiles] = useState<FileUploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (documentId) params.set("documentId", documentId);

      const res = await fetch(`/api/uploads?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load files");
      }
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load files"
      );
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this file? This cannot be undone.")) return;

      setDeletingId(id);
      try {
        const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
        if (!res.ok) {
          throw new Error("Failed to delete file");
        }
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete file"
        );
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg
          className="h-6 w-6 animate-spin text-primary"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
        <button
          onClick={fetchFiles}
          className="ml-2 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mb-3 h-10 w-10 text-muted-foreground/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p className="text-sm text-muted-foreground">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
            deletingId === file.id && "opacity-50"
          )}
        >
          {/* Icon or thumbnail */}
          <div className="flex-shrink-0">
            {isImage(file.fileType, file.fileName) ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/uploads/${file.id}`}
                  alt={file.fileName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <FileIcon fileType={file.fileType} fileName={file.fileName} />
            )}
          </div>

          {/* File info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file.fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.fileSize)} &middot; {formatDate(file.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => window.open(`/api/uploads/${file.id}`, "_blank")}
              title="View file"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleDelete(file.id)}
              disabled={deletingId === file.id}
              title="Delete file"
            >
              {deletingId === file.id ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
