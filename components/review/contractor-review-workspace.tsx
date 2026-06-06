"use client";

import { useState } from "react";
import { SharedPhotoGallery } from "@/components/share/shared-photo-gallery";
import { SharedScopeList } from "@/components/share/shared-scope-list";
import { ScopeSummary } from "@/components/scope/scope-summary";
import { PageSection, SectionSurface } from "@/components/layout/page-section";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatProjectLocation } from "@/lib/location/parse";
import type { SharedPhoto } from "@/lib/phase2/client";
import {
  formatProjectTypeLabel,
  SCOPE_CATEGORIES,
  type ContractorInvitation,
  type ContractorReview,
  type ProjectWithScope,
  type ScopeItem,
  type ScopeSuggestion,
  type SuggestionFollowUp,
} from "@/types";

type ReviewSuggestion = ScopeSuggestion & { follow_ups?: SuggestionFollowUp[] };

type ReviewPayload = {
  invitation: ContractorInvitation;
  review: ContractorReview;
  project: ProjectWithScope;
  photos: SharedPhoto[];
  suggestions: ReviewSuggestion[];
};

export function ContractorReviewWorkspace({
  token,
  payload,
  onRefresh,
}: {
  token: string;
  payload: ReviewPayload;
  onRefresh: () => void;
}) {
  const { invitation, review, project, photos } = payload;
  const [suggestions, setSuggestions] = useState(payload.suggestions);
  const [notes, setNotes] = useState(review.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [suggestionType, setSuggestionType] = useState<ScopeSuggestion["suggestion_type"]>("add");
  const [targetItemId, setTargetItemId] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [suggestedText, setSuggestedText] = useState("");
  const [contractorNote, setContractorNote] = useState("");
  const [creating, setCreating] = useState(false);

  const reviewSubmitted = review.status === "submitted";
  const editable = !reviewSubmitted;

  async function saveNotes() {
    setSavingNotes(true);
    setError(null);
    const response = await fetch(`/api/review/${token}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(false);
    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not save notes.");
    }
  }

  async function createSuggestion() {
    setCreating(true);
    setError(null);
    const response = await fetch(`/api/review/${token}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        suggestion_type: suggestionType,
        target_scope_item_id: targetItemId || undefined,
        category: suggestionType === "add" ? category : undefined,
        suggested_text: suggestedText || undefined,
        contractor_note: contractorNote || undefined,
      }),
    });
    const data = await response.json();
    setCreating(false);

    if (!response.ok) {
      setError(data.error ?? "Could not add suggestion.");
      return;
    }

    setSuggestions((current) => [...current, data.suggestion]);
    setSuggestedText("");
    setContractorNote("");
    setTargetItemId("");
  }

  async function removeSuggestion(suggestionId: string) {
    const response = await fetch(
      `/api/review/${token}/suggestions/${suggestionId}`,
      { method: "DELETE" }
    );
    if (response.ok) {
      setSuggestions((current) => current.filter((item) => item.id !== suggestionId));
    }
  }

  async function completeReview() {
    setCompleting(true);
    setError(null);
    await saveNotes();
    const response = await fetch(`/api/review/${token}/complete`, {
      method: "POST",
    });
    setCompleting(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not complete review.");
      return;
    }

    setMessage("Review submitted. The homeowner will be notified.");
    onRefresh();
  }

  async function respondToFollowUp(suggestionId: string, messageText: string) {
    const response = await fetch(
      `/api/review/${token}/suggestions/${suggestionId}/follow-up`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      }
    );

    if (response.ok) {
      onRefresh();
    } else {
      const data = await response.json();
      setError(data.error ?? "Could not send response.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm text-[var(--muted)]">
          Reviewing as {invitation.contractor_name}
          {invitation.contractor_company
            ? ` · ${invitation.contractor_company}`
            : ""}
        </p>
        <h1 className="font-display text-4xl tracking-tight text-neutral-900">
          {project.title}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {formatProjectTypeLabel(project.project_type)}
        </p>
        <p className="text-sm text-[var(--muted)]">
          {formatProjectLocation(project)}
        </p>
      </div>

      <ScopeSummary summary={project.ai_summary} />

      <PageSection title="Scope of work">
        <SectionSurface>
          <SharedScopeList items={project.scope_items} />
        </SectionSurface>
      </PageSection>

      <SharedPhotoGallery photos={photos} />

      <PageSection
        title="Your suggestions"
        description={
          reviewSubmitted
            ? "Your review has been submitted. Respond below if the homeowner asked a follow-up."
            : "Add suggestions while you review. The homeowner will see them after you mark the review complete."
        }
      >
        <div className="space-y-4">
          {editable ? (
            <SectionSurface className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Suggestion type</Label>
                  <Select
                    value={suggestionType}
                    onValueChange={(value) =>
                      setSuggestionType(value as ScopeSuggestion["suggestion_type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add item</SelectItem>
                      <SelectItem value="edit">Edit item</SelectItem>
                      <SelectItem value="remove">Remove item</SelectItem>
                      <SelectItem value="note">General note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(suggestionType === "edit" || suggestionType === "remove") && (
                  <ScopeItemPicker
                    items={project.scope_items}
                    value={targetItemId}
                    onChange={setTargetItemId}
                  />
                )}

                {suggestionType === "add" && (
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SCOPE_CATEGORIES.map((entry) => (
                          <SelectItem key={entry} value={entry}>
                            {entry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {(suggestionType === "add" || suggestionType === "edit") && (
                <div className="space-y-2">
                  <Label>Suggested text</Label>
                  <Textarea
                    value={suggestedText}
                    onChange={(event) => setSuggestedText(event.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Note (optional)</Label>
                <Textarea
                  value={contractorNote}
                  onChange={(event) => setContractorNote(event.target.value)}
                />
              </div>

              <Button disabled={creating} onClick={createSuggestion}>
                {creating ? "Adding..." : "Add suggestion"}
              </Button>
            </SectionSurface>
          ) : null}

          {suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <SectionSurface key={suggestion.id} className="space-y-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                      {suggestion.suggestion_type}
                    </p>
                    {suggestion.suggested_text ? (
                      <p className="text-sm font-medium text-neutral-900">
                        {suggestion.suggested_text}
                      </p>
                    ) : null}
                    {suggestion.contractor_note ? (
                      <p className="text-sm text-[var(--muted)]">
                        {suggestion.contractor_note}
                      </p>
                    ) : null}
                  </div>

                  {suggestion.follow_ups && suggestion.follow_ups.length > 0 ? (
                    <div className="space-y-2 rounded-[8px] bg-neutral-50 p-3">
                      {suggestion.follow_ups.map((entry) => (
                        <div key={entry.id} className="text-sm">
                          <p className="font-medium text-neutral-800">
                            {entry.author_role === "homeowner"
                              ? "Homeowner asked"
                              : "You replied"}
                          </p>
                          <p className="text-[var(--muted)]">{entry.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {editable ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSuggestion(suggestion.id)}
                    >
                      Remove
                    </Button>
                  ) : suggestion.status === "follow_up_requested" ? (
                    <FollowUpReplyForm
                      onSubmit={(messageText) =>
                        respondToFollowUp(suggestion.id, messageText)
                      }
                    />
                  ) : null}
                </SectionSurface>
              ))}
            </div>
          ) : (
            <SectionSurface>
              <p className="text-sm text-[var(--muted)]">No suggestions yet.</p>
            </SectionSurface>
          )}
        </div>
      </PageSection>

      <PageSection title="General notes">
        <SectionSurface className="space-y-3">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            disabled={!editable}
            placeholder="Optional overall feedback for the homeowner"
          />
          {editable ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={savingNotes}
                onClick={saveNotes}
              >
                {savingNotes ? "Saving..." : "Save notes"}
              </Button>
              <Button disabled={completing} onClick={completeReview}>
                {completing ? "Submitting..." : "Mark review complete"}
              </Button>
            </div>
          ) : (
            <p className="text-sm font-medium text-neutral-900">
              Review submitted
            </p>
          )}
        </SectionSurface>
      </PageSection>

      {message ? <p className="text-sm text-[var(--muted)]">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function ScopeItemPicker({
  items,
  value,
  onChange,
}: {
  items: ScopeItem[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Scope item</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an item" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.text.slice(0, 80)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FollowUpReplyForm({
  onSubmit,
}: {
  onSubmit: (message: string) => void;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-2">
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Reply to the homeowner's follow-up"
      />
      <Button
        size="sm"
        disabled={!message.trim()}
        onClick={() => {
          onSubmit(message.trim());
          setMessage("");
        }}
      >
        Send reply
      </Button>
    </div>
  );
}
