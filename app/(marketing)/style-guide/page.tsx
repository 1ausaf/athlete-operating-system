"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";

export default function StyleGuidePage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Developer
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Style guide</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Reference for shadcn primitives, status badges, and common patterns.
          Tokens live in <code className="rounded bg-muted px-1">app/globals.css</code>; see{" "}
          <code className="rounded bg-muted px-1">docs/design-system.md</code>.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variants</CardTitle>
            <CardDescription>Primary actions vs quiet / destructive.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Badges</h2>
        <Card>
          <CardContent className="flex flex-wrap gap-2 pt-6">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">StatusBadge</CardTitle>
            <CardDescription>Tone mapping for booking, payment, and roster.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <StatusBadge tone="ok">OK</StatusBadge>
            <StatusBadge tone="warn">Warn</StatusBadge>
            <StatusBadge tone="bad">Bad</StatusBadge>
            <StatusBadge tone="neutral">Neutral</StatusBadge>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Form fields</h2>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid max-w-md gap-2">
              <Label htmlFor="sg-email">Email</Label>
              <Input id="sg-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid max-w-md gap-2">
              <Label htmlFor="sg-notes">Notes</Label>
              <Textarea id="sg-notes" placeholder="Optional context…" rows={3} />
            </div>
            <p className="text-xs text-destructive" role="alert">
              Example inline validation (destructive, xs).
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Tabs</h2>
        <Tabs defaultValue="a" className="max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="a">Tab A</TabsTrigger>
            <TabsTrigger value="b">Tab B</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="rounded-md border p-4 text-sm">
            Content A
          </TabsContent>
          <TabsContent value="b" className="rounded-md border p-4 text-sm">
            Content B
          </TabsContent>
        </Tabs>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Table</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium tabular-nums">
                    Mon, Jun 1 · 6:00 PM
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge tone="ok">Confirmed</StatusBadge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium tabular-nums">
                    Wed, Jun 3 · 6:00 PM
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge tone="warn">Waitlisted</StatusBadge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Select (stub)</h2>
        <Card>
          <CardContent className="space-y-2 pt-6">
            <Label>Filter</Label>
            <Select disabled>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Coming soon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Disabled placeholder — same pattern as admin filter stubs.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <p className="text-xs text-muted-foreground">
        This page is excluded from search indexing (<code className="rounded bg-muted px-1">robots: noindex</code>
        ).
      </p>
    </div>
  );
}
