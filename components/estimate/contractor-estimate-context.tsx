"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  appendDraftAddEstimateEntries,
  buildDraftEntries,
  buildPricingModeMap,
  inferGlobalPricingMode,
  sectionEstimateKey,
  sectionEstimateDescription,
  serializeDraftEntries,
  type CategoryPricingMode,
  type DraftEstimateEntry,
  type EstimatePriceInputMode,
} from "@/lib/estimates/inline-estimate";
import { applySavedRatesToEntries } from "@/lib/contractor/apply-rates";
import {
  formatCurrency,
  estimateRangeBounds,
  lineItemTotal,
  roundMoney,
  sumLineItems,
} from "@/lib/estimates/money";
import type { ContractorEstimate, EstimateLineItem, ScopeItem, ScopeSuggestion } from "@/types";

type ContractorEstimateContextValue = {
  loading: boolean;
  canEdit: boolean;
  submitted: boolean;
  reviewSubmitted: boolean;
  showEstimate: boolean;
  entries: DraftEstimateEntry[];
  pricingMode: CategoryPricingMode;
  priceInputMode: EstimatePriceInputMode;
  computedMinTotal: number;
  computedMaxTotal: number;
  computedTotal: number;
  generating: boolean;
  saving: boolean;
  submitting: boolean;
  dirty: boolean;
  message: string | null;
  error: string | null;
  getEntryForScopeItem: (scopeItemId: string) => DraftEstimateEntry | undefined;
  getEntryForAddSuggestion: (
    suggestionId: string
  ) => DraftEstimateEntry | undefined;
  getSectionEntry: (category: string) => DraftEstimateEntry | undefined;
  updateScopeItemEstimate: (
    scopeItemId: string,
    patch: { labor_cost?: string; material_cost?: string }
  ) => void;
  updateAddSuggestionEstimate: (
    suggestionId: string,
    patch: { labor_cost?: string; material_cost?: string }
  ) => void;
  updateSectionEstimate: (
    category: string,
    patch: { labor_cost?: string; material_cost?: string }
  ) => void;
  setPricingMode: (mode: CategoryPricingMode) => void;
  setPriceInputMode: (mode: EstimatePriceInputMode) => void;
  generateDraft: () => Promise<void>;
  saveDraft: () => Promise<void>;
  submitProposal: () => Promise<void>;
  persistDraftForReview: () => Promise<void>;
  hasPricing: boolean;
};

const ContractorEstimateContext =
  createContext<ContractorEstimateContextValue | null>(null);

function draftTotal(entries: DraftEstimateEntry[]) {
  return sumLineItems(
    entries.map((entry) => ({
      total: lineItemTotal(
        roundMoney(Number(entry.labor_cost) || 0),
        roundMoney(Number(entry.material_cost) || 0)
      ),
    }))
  );
}

function flattenEntriesToFlatCost(entries: DraftEstimateEntry[]) {
  return entries.map((entry) => {
    const { high } = estimateRangeBounds(
      Number(entry.labor_cost) || 0,
      Number(entry.material_cost) || 0
    );
    const value = String(high);
    return { ...entry, labor_cost: value, material_cost: value };
  });
}

async function fetchSavedContractorRates() {
  const response = await fetch("/api/contractor/rates");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Could not load saved rates.");
  }

  return (data.rates ?? []) as Array<{
    category: string;
    labor_cost: number;
    material_cost: number;
  }>;
}

function applyRatesToDraftEntries(
  entries: DraftEstimateEntry[],
  pricingMode: CategoryPricingMode
) {
  return fetchSavedContractorRates()
    .then((rates) => {
      if (rates.length === 0) {
        return { entries, applied: false };
      }

      return {
        entries: applySavedRatesToEntries({ entries, rates, pricingMode }),
        applied: true,
      };
    })
    .catch(() => ({ entries, applied: false }));
}

function activeEntries(
  entries: DraftEstimateEntry[],
  pricingMode: CategoryPricingMode
) {
  return entries.filter((entry) =>
    entry.isSection ? pricingMode === "section" : pricingMode === "item"
  );
}

function draftMinTotal(entries: DraftEstimateEntry[]) {
  return roundMoney(
    entries.reduce((sum, entry) => {
      const { low } = estimateRangeBounds(
        Number(entry.labor_cost) || 0,
        Number(entry.material_cost) || 0
      );
      return sum + low;
    }, 0)
  );
}

function draftMaxTotal(entries: DraftEstimateEntry[]) {
  return roundMoney(
    entries.reduce((sum, entry) => {
      const { high } = estimateRangeBounds(
        Number(entry.labor_cost) || 0,
        Number(entry.material_cost) || 0
      );
      return sum + high;
    }, 0)
  );
}

export function ContractorEstimateProvider({
  token,
  scopeItems,
  editable,
  reviewSubmitted = false,
  initialEstimate,
  draftAddSuggestions = [],
  children,
}: {
  token: string;
  scopeItems: ScopeItem[];
  editable: boolean;
  reviewSubmitted?: boolean;
  initialEstimate: ContractorEstimate | null;
  draftAddSuggestions?: ScopeSuggestion[];
  children: ReactNode;
}) {
  const [estimate, setEstimate] = useState<ContractorEstimate | null>(
    initialEstimate
  );
  const initialPricingMode = inferGlobalPricingMode(
    scopeItems,
    initialEstimate?.line_items ?? []
  );
  const [pricingMode, setPricingModeState] = useState<CategoryPricingMode>(
    initialPricingMode
  );
  const [priceInputMode, setPriceInputModeState] =
    useState<EstimatePriceInputMode>("range");
  const [entries, setEntries] = useState<DraftEstimateEntry[]>(() =>
    buildDraftEntries({
      scopeItems,
      lineItems: initialEstimate?.line_items ?? [],
      pricingModeByCategory: buildPricingModeMap(
        scopeItems,
        initialEstimate?.line_items ?? [],
        initialPricingMode
      ),
    })
  );
  const [loading, setLoading] = useState(!initialEstimate);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const autoGenerateAttempted = useRef(false);

  function mergeDraftAddEntries(
    baseEntries: DraftEstimateEntry[],
    lineItems: EstimateLineItem[],
    mode: CategoryPricingMode,
    preserved: DraftEstimateEntry[]
  ) {
    return appendDraftAddEstimateEntries({
      entries: baseEntries,
      draftAddSuggestions,
      lineItems,
      pricingMode: mode,
      preservedEntries: preserved,
    });
  }

  const submitted = estimate?.status === "submitted";
  const proposalLocked =
    estimate?.status === "accepted" || estimate?.status === "declined";
  const canEdit = editable && !submitted && !proposalLocked;
  const showEstimate =
    !loading && (canEdit || submitted || reviewSubmitted || proposalLocked);

  const applyEstimateToState = useCallback(
    (
      nextEstimate: ContractorEstimate | null,
      options?: { preserveDraftAdds?: DraftEstimateEntry[] }
    ) => {
      const nextPricingMode = inferGlobalPricingMode(
        scopeItems,
        nextEstimate?.line_items ?? []
      );

      setEstimate(nextEstimate);
      setPricingModeState(nextPricingMode);
      setEntries((current) =>
        mergeDraftAddEntries(
          buildDraftEntries({
            scopeItems,
            lineItems: nextEstimate?.line_items ?? [],
            pricingModeByCategory: buildPricingModeMap(
              scopeItems,
              nextEstimate?.line_items ?? [],
              nextPricingMode
            ),
          }),
          nextEstimate?.line_items ?? [],
          nextPricingMode,
          options?.preserveDraftAdds ?? current
        )
      );
      setDirty(false);
    },
    [scopeItems]
  );

  const loadEstimate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/review/${token}/estimate`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not load estimate.");
        return;
      }

      const nextEstimate = (data.estimate ?? null) as ContractorEstimate | null;
      applyEstimateToState(nextEstimate);
    } finally {
      setLoading(false);
    }
  }, [applyEstimateToState, token]);

  useEffect(() => {
    if (initialEstimate) return;
    loadEstimate();
  }, [initialEstimate, loadEstimate]);

  useEffect(() => {
    if (!initialEstimate) return;
    if (canEdit && dirty) return;

    applyEstimateToState(initialEstimate);
  }, [applyEstimateToState, canEdit, dirty, initialEstimate]);

  useEffect(() => {
    setEntries((current) => {
      const withoutDraftAdds = current.filter((entry) => !entry.isDraftAdd);
      return mergeDraftAddEntries(
        withoutDraftAdds,
        estimate?.line_items ?? [],
        pricingMode,
        current
      );
    });
  }, [draftAddSuggestions, pricingMode]);

  const pricingModeByCategory = useMemo(() => {
    const map = buildPricingModeMap(
      scopeItems,
      estimate?.line_items ?? [],
      pricingMode
    );

    for (const suggestion of draftAddSuggestions) {
      const category = suggestion.category ?? "other";
      if (!(category in map)) {
        map[category] = pricingMode;
      }
    }

    return map;
  }, [scopeItems, estimate?.line_items, pricingMode, draftAddSuggestions]);

  const activeEstimateEntries = useMemo(
    () => activeEntries(entries, pricingMode),
    [entries, pricingMode]
  );

  const computedMinTotal = useMemo(
    () => draftMinTotal(activeEstimateEntries),
    [activeEstimateEntries]
  );

  const computedMaxTotal = useMemo(
    () => draftMaxTotal(activeEstimateEntries),
    [activeEstimateEntries]
  );

  const computedTotal = useMemo(
    () => draftTotal(activeEstimateEntries),
    [activeEstimateEntries]
  );

  const hasPricing = computedMinTotal > 0 || computedMaxTotal > 0;

  const generateDraft = useCallback(async () => {
    setGenerating(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/review/${token}/estimate/generate`, {
      method: "POST",
    });
    const data = await response.json();
    setGenerating(false);

    if (!response.ok) {
      setError(data.error ?? "Could not generate draft estimate.");
      return;
    }

    const nextEstimate = data.estimate as ContractorEstimate;
    const nextPricingMode = inferGlobalPricingMode(
      scopeItems,
      nextEstimate.line_items ?? []
    );
    let nextEntries = mergeDraftAddEntries(
      buildDraftEntries({
        scopeItems,
        lineItems: nextEstimate.line_items ?? [],
        pricingModeByCategory: buildPricingModeMap(
          scopeItems,
          nextEstimate.line_items ?? [],
          nextPricingMode
        ),
      }),
      nextEstimate.line_items ?? [],
      nextPricingMode,
      []
    );

    const { entries: ratedEntries, applied } = await applyRatesToDraftEntries(
      nextEntries,
      nextPricingMode
    );
    nextEntries = ratedEntries;

    setEstimate(nextEstimate);
    setPricingModeState(nextPricingMode);
    setEntries(nextEntries);
    setDirty(applied);
    setMessage(
      applied
        ? "Prefilled with your saved rates. Review and adjust before submitting."
        : "Draft prices prefilled from local market averages. Review and adjust before submitting."
    );
  }, [scopeItems, token]);

  useEffect(() => {
    if (
      loading ||
      generating ||
      !canEdit ||
      submitted ||
      hasPricing ||
      autoGenerateAttempted.current
    ) {
      return;
    }

    autoGenerateAttempted.current = true;
    void generateDraft();
  }, [canEdit, generateDraft, generating, hasPricing, loading, submitted]);

  const getEntryForScopeItem = useCallback(
    (scopeItemId: string) =>
      entries.find((entry) => entry.scope_item_id === scopeItemId),
    [entries]
  );

  const getEntryForAddSuggestion = useCallback(
    (suggestionId: string) =>
      entries.find((entry) => entry.suggestion_id === suggestionId),
    [entries]
  );

  const getSectionEntry = useCallback(
    (category: string) => entries.find((entry) => entry.key === sectionEstimateKey(category)),
    [entries]
  );

  function markDirty() {
    setDirty(true);
    setMessage(null);
  }

  function updateScopeItemEstimate(
    scopeItemId: string,
    patch: { labor_cost?: string; material_cost?: string }
  ) {
    setEntries((current) =>
      current.map((entry) =>
        entry.scope_item_id === scopeItemId ? { ...entry, ...patch } : entry
      )
    );
    markDirty();
  }

  function updateAddSuggestionEstimate(
    suggestionId: string,
    patch: { labor_cost?: string; material_cost?: string }
  ) {
    setEntries((current) =>
      current.map((entry) =>
        entry.suggestion_id === suggestionId ? { ...entry, ...patch } : entry
      )
    );
    markDirty();
  }

  function updateSectionEstimate(
    category: string,
    patch: { labor_cost?: string; material_cost?: string }
  ) {
    const key = sectionEstimateKey(category);
    setEntries((current) =>
      current.map((entry) => (entry.key === key ? { ...entry, ...patch } : entry))
    );
    markDirty();
  }

  function setPricingMode(mode: CategoryPricingMode) {
    if (mode === pricingMode) return;

    setPricingModeState(mode);
    setEntries((current) => {
      let next = current;
      const categories = [...new Set(scopeItems.map((item) => item.category))];

      for (const category of categories) {
        next = applyCategoryPricingMode(next, category, mode, scopeItems);
      }

      return next;
    });
    markDirty();
  }

  function setPriceInputMode(mode: EstimatePriceInputMode) {
    if (mode === priceInputMode) return;

    setPriceInputModeState(mode);
    if (mode === "flat") {
      setEntries((current) => flattenEntriesToFlatCost(current));
      markDirty();
    }
  }

  function applyCategoryPricingMode(
    current: DraftEstimateEntry[],
    category: string,
    mode: CategoryPricingMode,
    items: ScopeItem[]
  ) {
      const sectionKey = sectionEstimateKey(category);
      const categoryItems = items.filter((item) => item.category === category);
      const itemEntries = current.filter(
        (entry) => entry.category === category && !entry.isSection
      );
      const sectionEntry = current.find((entry) => entry.key === sectionKey);

      if (mode === "section") {
        const laborTotal = itemEntries.reduce((sum, entry) => {
          const { low } = estimateRangeBounds(
            Number(entry.labor_cost) || 0,
            Number(entry.material_cost) || 0
          );
          return sum + low;
        }, 0);
        const materialTotal = itemEntries.reduce((sum, entry) => {
          const { high } = estimateRangeBounds(
            Number(entry.labor_cost) || 0,
            Number(entry.material_cost) || 0
          );
          return sum + high;
        }, 0);

        return [
          ...current.filter((entry) => entry.category !== category),
          {
            clientId: sectionEntry?.clientId ?? crypto.randomUUID(),
            key: sectionKey,
            scope_item_id: null,
            suggestion_id: null,
            category,
            description: sectionEstimateDescription(category),
            labor_cost: String(sectionEntry?.labor_cost ?? laborTotal),
            material_cost: String(sectionEntry?.material_cost ?? materialTotal),
            isSection: true,
          },
        ];
      }

      return [
        ...current.filter((entry) => entry.key !== sectionKey),
        ...categoryItems.map((item) => {
          const existing = itemEntries.find(
            (entry) => entry.scope_item_id === item.id
          );
          return {
            clientId: existing?.clientId ?? crypto.randomUUID(),
            key: `item:${item.id}`,
            scope_item_id: item.id,
            suggestion_id: null,
            category: item.category,
            description: item.text,
            labor_cost: existing?.labor_cost ?? "0",
            material_cost: existing?.material_cost ?? "0",
            isSection: false,
          };
        }),
      ];
  }

  async function persistDraft() {
    const payload = serializeDraftEntries(
      entries,
      pricingModeByCategory,
      scopeItems
    ).map((item) => ({
      ...item,
      labor_cost: roundMoney(item.labor_cost),
      material_cost: roundMoney(item.material_cost),
    }));

    if (payload.length === 0) {
      throw new Error("Add at least one price before saving.");
    }

    const response = await fetch(`/api/review/${token}/estimate`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line_items: payload }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Could not save estimate.");
    }

    const nextEstimate = data.estimate as ContractorEstimate;
    applyEstimateToState(nextEstimate);
    return nextEstimate;
  }

  async function saveDraft() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await persistDraft();
      setMessage("Draft saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save estimate."
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitProposal() {
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (dirty || !estimate) {
        await persistDraft();
      }

      const response = await fetch(`/api/review/${token}/estimate/submit`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not submit proposal.");
      }

      const nextEstimate = data.estimate as ContractorEstimate;
      applyEstimateToState(nextEstimate);
      setMessage("Proposal submitted. The homeowner can now review your total.");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Could not submit proposal.";
      setError(message);
      throw submitError instanceof Error ? submitError : new Error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ContractorEstimateContext.Provider
      value={{
        loading,
        canEdit,
        submitted,
        reviewSubmitted,
        showEstimate,
        entries,
        pricingMode,
        priceInputMode,
        computedMinTotal,
        computedMaxTotal,
        computedTotal,
        generating,
        saving,
        submitting,
        dirty,
        message,
        error,
        getEntryForScopeItem,
        getEntryForAddSuggestion,
        getSectionEntry,
        updateScopeItemEstimate,
        updateAddSuggestionEstimate,
        updateSectionEstimate,
        setPricingMode,
        setPriceInputMode,
        generateDraft,
        saveDraft,
        submitProposal,
        persistDraftForReview: async () => {
          await persistDraft();
        },
        hasPricing,
      }}
    >
      {children}
    </ContractorEstimateContext.Provider>
  );
}

export function useContractorEstimate() {
  const context = useContext(ContractorEstimateContext);
  if (!context) {
    throw new Error(
      "useContractorEstimate must be used within ContractorEstimateProvider"
    );
  }
  return context;
}

export function useOptionalContractorEstimate() {
  return useContext(ContractorEstimateContext);
}

export function formatEstimateTotal(total: number) {
  return formatCurrency(total);
}
