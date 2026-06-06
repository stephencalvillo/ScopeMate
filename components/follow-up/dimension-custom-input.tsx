"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatExactDimensionAnswer } from "@/lib/follow-up/dimension-answer";

export function DimensionCustomInput({
  onSave,
  onCancel,
  disabled = false,
}: {
  onSave: (value: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const [lengthFt, setLengthFt] = useState("");
  const [widthFt, setWidthFt] = useState("");

  const parsedLength = Number(lengthFt);
  const parsedWidth = Number(widthFt);

  const sqFt = useMemo(() => {
    if (
      !Number.isFinite(parsedLength) ||
      !Number.isFinite(parsedWidth) ||
      parsedLength <= 0 ||
      parsedWidth <= 0
    ) {
      return null;
    }

    return Math.round(parsedLength * parsedWidth);
  }, [parsedLength, parsedWidth]);

  return (
    <div className="space-y-3 rounded-[4px] border border-[var(--border)] bg-neutral-50 p-3">
      <p className="text-sm text-neutral-900">
        Enter the length and width in feet. We&apos;ll calculate the square footage.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dimension-length">Length (ft)</Label>
          <Input
            id="dimension-length"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={lengthFt}
            onChange={(event) => setLengthFt(event.target.value)}
            disabled={disabled}
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimension-width">Width (ft)</Label>
          <Input
            id="dimension-width"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={widthFt}
            onChange={(event) => setWidthFt(event.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
      {sqFt ? (
        <p className="text-sm text-[var(--muted)]">
          Estimated area: {sqFt.toLocaleString()} sq ft
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={disabled || sqFt === null}
          onClick={() => {
            if (sqFt === null) return;
            onSave(formatExactDimensionAnswer(parsedLength, parsedWidth));
          }}
        >
          Save dimensions
        </Button>
        <Button size="sm" variant="ghost" disabled={disabled} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
