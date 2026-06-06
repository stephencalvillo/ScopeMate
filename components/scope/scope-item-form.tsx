"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCOPE_CATEGORIES, type ScopeItem } from "@/types";

export function ScopeItemForm({
  projectId,
  onCreated,
}: {
  projectId: string;
  onCreated: (item: ScopeItem) => void;
}) {
  const [category, setCategory] = useState<string>("other");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/projects/${projectId}/scope-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, text, priority: "recommended" }),
    });

    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      onCreated(data);
      setText("");
      setCategory("other");
    }
  }

  return (
    <Card className="border-dashed bg-stone-50">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              Add a scope item
            </h3>
            <p className="text-xs text-stone-500">
              Use this if the AI missed something important.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCOPE_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope-text">Description</Label>
            <Input
              id="scope-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Install new under-cabinet lighting"
              required
            />
          </div>

          <Button type="submit" disabled={loading || !text.trim()}>
            {loading ? "Adding..." : "Add item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
