"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Template {
  slug: string;
  name: string;
  category: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  client?: { id: string; name: string; companyName?: string } | null;
}

interface Client {
  id: string;
  name: string;
  companyName?: string | null;
}

type GenerateStep = "select" | "generating" | "done";

export function BulkGenerate() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(
    new Set()
  );

  const [step, setStep] = useState<GenerateStep>("select");
  const [progress, setProgress] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [results, setResults] = useState<{
    created: number;
    documentIds: string[];
    errors?: { ref: string; error: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [templatesRes, projectsRes, clientsRes] = await Promise.all([
        fetch("/api/documents/templates"),
        fetch("/api/projects"),
        fetch("/api/clients"),
      ]);

      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (projectsRes.ok) setProjects(await projectsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggleProject(id: string) {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleClient(id: string) {
    setSelectedClientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllProjects() {
    if (selectedProjectIds.size === projects.length) {
      setSelectedProjectIds(new Set());
    } else {
      setSelectedProjectIds(new Set(projects.map((p) => p.id)));
    }
  }

  function selectAllClients() {
    if (selectedClientIds.size === clients.length) {
      setSelectedClientIds(new Set());
    } else {
      setSelectedClientIds(new Set(clients.map((c) => c.id)));
    }
  }

  const totalSelected = selectedProjectIds.size + selectedClientIds.size;

  async function handleGenerate() {
    if (!selectedTemplate || totalSelected === 0) return;
    setShowConfirm(false);
    setStep("generating");
    setError(null);
    setResults(null);
    setTotalItems(totalSelected);
    setProgress(0);

    // Simulate progress while the request is in flight
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const remaining = totalSelected - prev;
        if (remaining <= 1) return prev;
        return prev + Math.max(1, Math.floor(remaining * 0.3));
      });
    }, 500);

    try {
      const res = await fetch("/api/documents/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateSlug: selectedTemplate,
          projectIds: Array.from(selectedProjectIds),
          clientIds: Array.from(selectedClientIds),
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to generate documents");
        setStep("select");
        return;
      }

      const data = await res.json();
      setProgress(totalSelected);
      setResults(data);
      setStep("done");
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("select");
    }
  }

  function handleReset() {
    setStep("select");
    setResults(null);
    setProgress(0);
    setSelectedProjectIds(new Set());
    setSelectedClientIds(new Set());
    setSelectedTemplate("");
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Document Generation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Select template and items */}
        {step === "select" && (
          <>
            {/* Template picker */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Document Template
              </label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">Select a template...</option>
                {templates.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Projects checklist */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground">
                    Projects ({selectedProjectIds.size}/{projects.length})
                  </label>
                  <button
                    type="button"
                    onClick={selectAllProjects}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedProjectIds.size === projects.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {projects.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProjectIds.has(p.id)}
                        onChange={() => toggleProject(p.id)}
                        className="rounded border-border"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground block truncate">
                          {p.name}
                        </span>
                        {p.client && (
                          <span className="text-xs text-muted-foreground">
                            {p.client.companyName || p.client.name}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clients checklist */}
            {clients.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-foreground">
                    Clients ({selectedClientIds.size}/{clients.length})
                  </label>
                  <button
                    type="button"
                    onClick={selectAllClients}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedClientIds.size === clients.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {clients.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClientIds.has(c.id)}
                        onChange={() => toggleClient(c.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm font-medium text-foreground truncate">
                        {c.companyName || c.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Generate button */}
            <div className="flex items-center gap-3 pt-2">
              {showConfirm ? (
                <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 w-full">
                  <p className="text-sm text-yellow-800 flex-1">
                    Generate {totalSelected} document{totalSelected !== 1 ? "s" : ""}{" "}
                    using this template?
                  </p>
                  <Button size="sm" onClick={handleGenerate}>
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!selectedTemplate || totalSelected === 0}
                >
                  Generate All ({totalSelected})
                </Button>
              )}
            </div>
          </>
        )}

        {/* Step 2: Generating progress */}
        {step === "generating" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <svg
                  className="h-5 w-5 animate-spin text-primary"
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
                Generating {progress}/{totalItems}...
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalItems > 0 ? (progress / totalItems) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "done" && results && (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h3 className="text-sm font-semibold text-green-800 mb-1">
                Generation Complete
              </h3>
              <p className="text-sm text-green-700">
                {results.created} document{results.created !== 1 ? "s" : ""}{" "}
                created successfully.
              </p>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  {results.errors.length} Error{results.errors.length !== 1 ? "s" : ""}
                </h3>
                <ul className="space-y-1">
                  {results.errors.map((err, i) => (
                    <li key={i} className="text-xs text-red-600">
                      {err.ref}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.documentIds.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">
                  Generated Documents
                </h4>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {results.documentIds.map((docId) => (
                    <a
                      key={docId}
                      href={`/documents/${docId}`}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-accent/50 text-sm"
                    >
                      <span className="text-foreground font-mono text-xs truncate">
                        {docId}
                      </span>
                      <span className="text-primary text-xs whitespace-nowrap ml-2">
                        View
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleReset} variant="outline">
              Generate More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
