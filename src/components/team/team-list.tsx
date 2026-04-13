"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface TeamMember {
  id: string;
  ownerId: string;
  memberId: string;
  role: string;
  active: boolean;
  createdAt: string;
  member: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    createdAt: string;
  };
}

const ROLE_OPTIONS = [
  { value: "FIELD_WORKER", label: "Field Worker" },
  { value: "MANAGER", label: "Manager" },
  { value: "BOOKKEEPER", label: "Bookkeeper" },
] as const;

const ROLE_BADGE_VARIANT: Record<string, "default" | "success" | "warning"> = {
  FIELD_WORKER: "default",
  MANAGER: "success",
  BOOKKEEPER: "warning",
};

function roleName(role: string): string {
  return (
    ROLE_OPTIONS.find((r) => r.value === role)?.label ??
    role.replace(/_/g, " ").toLowerCase()
  );
}

export function TeamList() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("FIELD_WORKER");
  const [adding, setAdding] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.filter((m: TeamMember) => m.active));
      }
    } catch {
      toast("Failed to load team.", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast("Email is required.", "error");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (res.ok) {
        toast("Team member added.", "success");
        setEmail("");
        setRole("FIELD_WORKER");
        setShowForm(false);
        load();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to add member.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }
    setAdding(false);
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setUpdatingRole(memberId);
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast("Role updated.", "success");
        load();
      } else {
        toast("Failed to update role.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }
    setUpdatingRole(null);
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remove this team member?")) return;
    setRemoving(memberId);
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      if (res.ok) {
        toast("Team member removed.", "success");
        load();
      } else {
        toast("Failed to remove member.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }
    setRemoving(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your employees and team members
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Add Member</Button>
      </div>

      {/* Add member modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4">Add Team Member</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                id="member-email"
                label="Email *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="worker@example.com"
              />
              <div className="space-y-1.5">
                <label
                  htmlFor="member-role"
                  className="block text-sm font-medium text-foreground"
                >
                  Role
                </label>
                <select
                  id="member-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" loading={adding}>
                  Add Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team list */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <svg
              className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <p className="text-lg font-semibold mb-1">No team members yet</p>
            <p className="text-sm">
              Add employees and subcontractors to manage your crew.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((tm) => (
            <Card key={tm.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {tm.member.image ? (
                        <img
                          src={tm.member.image}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {(tm.member.name || tm.member.email)[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">
                          {tm.member.name || tm.member.email.split("@")[0]}
                        </p>
                        <Badge
                          variant={ROLE_BADGE_VARIANT[tm.role] || "default"}
                        >
                          {roleName(tm.role)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {tm.member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Role dropdown */}
                    <select
                      value={tm.role}
                      disabled={updatingRole === tm.id}
                      onChange={(e) => handleRoleChange(tm.id, e.target.value)}
                      className="h-8 rounded-lg border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      loading={removing === tm.id}
                      onClick={() => handleRemove(tm.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary footer */}
      {!loading && members.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">
              Team Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold text-foreground">
                  {members.length}
                </span>{" "}
                <span className="text-muted-foreground">Total members</span>
              </div>
              {ROLE_OPTIONS.map((r) => {
                const count = members.filter((m) => m.role === r.value).length;
                if (count === 0) return null;
                return (
                  <div key={r.value}>
                    <span className="font-semibold text-foreground">
                      {count}
                    </span>{" "}
                    <span className="text-muted-foreground">{r.label}s</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
