import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  getAdminOverview,
  listUsers,
  setUserRole,
} from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldCheck, Users, BookMarked, ClipboardCheck, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Islamic World" },
      {
        name: "description",
        content:
          "Manage members, roles and platform activity across the Islamic World community.",
      },
      { property: "og:title", content: "Admin Panel — Islamic World" },
      {
        property: "og:description",
        content: "Manage members, roles and platform activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <ShieldOff className="h-10 w-10 mx-auto text-muted-foreground" />
      <h1 className="font-display text-3xl mt-4">Access denied</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {String(error?.message ?? "").includes("Forbidden")
          ? "Your account does not have administrator privileges."
          : "Something went wrong loading the admin panel."}
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number | undefined;
  Icon: typeof Users;
}) {
  return (
    <Card className="glass">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-display leading-none">
            {value === undefined ? <Skeleton className="h-7 w-12" /> : value}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminPage() {
  const qc = useQueryClient();
  const overviewFn = useServerFn(getAdminOverview);
  const usersFn = useServerFn(listUsers);
  const roleFn = useServerFn(setUserRole);
  const [q, setQ] = useState("");

  const overview = useQuery({ queryKey: ["admin", "overview"], queryFn: () => overviewFn({}) });
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: () => usersFn({}) });

  const mutate = useMutation({
    mutationFn: (vars: { userId: string; role: "admin" | "moderator"; grant: boolean }) =>
      roleFn({ data: vars }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update role"),
  });

  const filtered = (users.data ?? []).filter((u) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      u.email.toLowerCase().includes(s) ||
      (u.displayName ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest gold-text">
          <ShieldCheck className="h-4 w-4" /> Administration
        </div>
        <h1 className="font-display text-4xl mt-1">Admin Panel</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Members, roles and platform activity at a glance.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Members" value={overview.data?.users} Icon={Users} />
        <StatCard label="Administrators" value={overview.data?.admins} Icon={ShieldCheck} />
        <StatCard label="Prayer entries" value={overview.data?.prayerEntries} Icon={ClipboardCheck} />
        <StatCard label="Bookmarks" value={overview.data?.bookmarks} Icon={BookMarked} />
      </div>

      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="font-display">Members</CardTitle>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by email or name"
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {users.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="hidden lg:table-cell">Last sign-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => {
                  const isAdmin = u.roles.includes("admin");
                  const isMod = u.roles.includes("moderator");
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="font-medium">{u.displayName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {u.location ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {isAdmin && <Badge>Admin</Badge>}
                          {isMod && <Badge variant="secondary">Moderator</Badge>}
                          {!isAdmin && !isMod && (
                            <Badge variant="outline">Member</Badge>
                          )}
                          {!u.confirmed && (
                            <Badge variant="outline">Unconfirmed</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {u.lastSignInAt
                          ? new Date(u.lastSignInAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full mr-2"
                          disabled={mutate.isPending}
                          onClick={() =>
                            mutate.mutate({ userId: u.id, role: "moderator", grant: !isMod })
                          }
                        >
                          {isMod ? "Remove mod" : "Make mod"}
                        </Button>
                        <Button
                          size="sm"
                          variant={isAdmin ? "outline" : "default"}
                          className="rounded-full"
                          disabled={mutate.isPending}
                          onClick={() =>
                            mutate.mutate({ userId: u.id, role: "admin", grant: !isAdmin })
                          }
                        >
                          {isAdmin ? "Revoke admin" : "Make admin"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
