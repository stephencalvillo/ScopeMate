"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Input } from "@/components/ui/input";
import {
  isKnownServiceArea,
  normalizeServiceArea,
  searchServiceAreas,
} from "@/lib/location/service-areas";
import { cn } from "@/lib/utils";

export function ServiceAreaCombobox({
  id,
  value,
  onChange,
  placeholder = "Start typing a city or metro area",
  disabled = false,
  required = false,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const suggestions = useMemo(() => searchServiceAreas(value), [value]);
  const hasSelection = isKnownServiceArea(value);
  const showSuggestions = open && suggestions.length > 0;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value, suggestions.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectSuggestion(area: string) {
    onChange(area);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current + 1 >= suggestions.length ? 0 : current + 1
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current - 1 < 0 ? suggestions.length - 1 : current - 1
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = suggestions[highlightedIndex];
      if (selected) {
        selectSuggestion(selected);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={value}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          const canonical = normalizeServiceArea(value);
          if (canonical && canonical !== value) {
            onChange(canonical);
          }
        }}
      />

      {showSuggestions ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-[4px] border border-[var(--border)] bg-white py-1 shadow-sm"
        >
          {suggestions.map((area, index) => (
            <li key={area} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={highlightedIndex === index}
                className={cn(
                  "flex w-full px-4 py-2 text-left text-sm text-neutral-900 transition-colors hover:bg-neutral-50",
                  highlightedIndex === index && "bg-neutral-50"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(area)}
              >
                {area}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {value.trim() && !hasSelection ? (
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          Choose a service area from the list.
        </p>
      ) : null}
    </div>
  );
}
