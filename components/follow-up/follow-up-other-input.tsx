"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FollowUpOtherInput({
  onSave,
  onCancel,
  disabled = false,
  placeholder = "Tell us more",
}: {
  onSave: (value: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="max-w-md"
        autoFocus
      />
      <Button
        size="sm"
        disabled={disabled || !value.trim()}
        onClick={() => onSave(value.trim())}
      >
        Save
      </Button>
      <Button size="sm" variant="ghost" disabled={disabled} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
