"use client";

import { useMemo, useState } from "react";

import { isMinorFromDateOfBirth } from "@/lib/is-minor";
import type { MessagingAthleteOption } from "@/lib/data/messaging";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { createStaffThreadAction } from "../actions";

export function NewThreadForm({ athletes }: { athletes: MessagingAthleteOption[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [extra, setExtra] = useState("");

  const anyMinorSelected = useMemo(() => {
    return athletes.some(
      (a) =>
        selected.has(a.profileId) &&
        isMinorFromDateOfBirth(a.dateOfBirth),
    );
  }, [athletes, selected]);

  function toggle(profileId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) next.delete(profileId);
      else next.add(profileId);
      return next;
    });
  }

  return (
    <form action={createStaffThreadAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Athletes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {athletes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No athletes visible to your account.
            </p>
          ) : (
            athletes.map((a) => (
              <label
                key={a.profileId}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="athleteProfileId"
                  value={a.profileId}
                  checked={selected.has(a.profileId)}
                  onChange={() => toggle(a.profileId)}
                  className="rounded border"
                />
                <span>
                  {a.fullName}
                  {isMinorFromDateOfBirth(a.dateOfBirth) ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (minor)
                    </span>
                  ) : null}
                </span>
              </label>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Additional adults (profile UUIDs)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            For threads with a minor athlete, add at least one other adult
            (guardian or second coach). Separate multiple UUIDs with commas or
            spaces.
          </p>
          <textarea
            name="extraAdultProfileIds"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="e.g. 8b7c…-…-…"
          />
          {anyMinorSelected && !extra.trim() ? (
            <p className="text-sm text-amber-700 dark:text-amber-500">
              Include at least one additional adult profile ID before
              starting this conversation.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={!athletes.length}>
          Start conversation
        </Button>
      </div>
    </form>
  );
}
