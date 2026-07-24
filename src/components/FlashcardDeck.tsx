"use client";

import Image from "next/image";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { allFlashcards, PARTS, type PartId } from "@/content";
import { shuffle } from "@/lib/quiz";
import {
  getKnownCardsServerSnapshot,
  getKnownCardsSnapshot,
  resetKnownCards,
  setCardKnown,
  subscribe,
} from "@/lib/storage";

type Filter = "all" | "unknown" | "known";

export default function FlashcardDeck() {
  const [partFilter, setPartFilter] = useState<PartId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [order, setOrder] = useState<string[]>(allFlashcards.map((c) => c.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const known = useSyncExternalStore(subscribe, getKnownCardsSnapshot, getKnownCardsServerSnapshot);

  // Reset position when the active filters change, without an effect (see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  const [prevFilters, setPrevFilters] = useState([partFilter, statusFilter]);
  if (prevFilters[0] !== partFilter || prevFilters[1] !== statusFilter) {
    setPrevFilters([partFilter, statusFilter]);
    setIndex(0);
    setFlipped(false);
  }

  const cardsById = useMemo(() => {
    const map = new Map(allFlashcards.map((c) => [c.id, c]));
    return map;
  }, []);

  const matchesFilters = useCallback(
    (id: string, knownMap: Record<string, boolean>) => {
      const card = cardsById.get(id)!;
      if (partFilter !== "all" && card.part !== partFilter) return false;
      if (statusFilter === "known" && !knownMap[id]) return false;
      if (statusFilter === "unknown" && knownMap[id]) return false;
      return true;
    },
    [cardsById, partFilter, statusFilter]
  );

  const filteredIds = useMemo(
    () => order.filter((id) => matchesFilters(id, known)),
    [order, known, matchesFilters]
  );

  const currentId = filteredIds[index];
  const card = currentId ? cardsById.get(currentId) : undefined;
  const total = filteredIds.length;

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => {
      if (total === 0) return 0;
      return (i + delta + total) % total;
    });
  }

  function handleShuffle() {
    setOrder(shuffle(allFlashcards.map((c) => c.id)));
    setIndex(0);
    setFlipped(false);
  }

  function mark(isKnown: boolean) {
    if (!currentId) return;
    const updatedKnown = { ...known, [currentId]: isKnown };
    setCardKnown(currentId, isKnown);
    setFlipped(false);

    // Recompute the filtered list as it will look immediately after this update,
    // so we can land on a sensible next card instead of relying on stale indices
    // (marking a card can remove it from the "known"/"unknown" filtered view).
    const newFilteredIds = order.filter((id) => matchesFilters(id, updatedKnown));
    if (newFilteredIds.length === 0) {
      setIndex(0);
    } else if (newFilteredIds.length < filteredIds.length) {
      // Current card dropped out of view; whatever followed it shifts into this slot.
      setIndex(index % newFilteredIds.length);
    } else {
      setIndex((index + 1) % newFilteredIds.length);
    }
  }

  const knownCount = Object.values(known).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-xl px-4 py-6 space-y-5">
      <h1 className="sr-only">Flashcards</h1>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="topic-filter">Filter by topic</label>
        <select
          id="topic-filter"
          value={partFilter}
          onChange={(e) => setPartFilter(e.target.value as PartId | "all")}
          className="min-h-11 rounded-xl border border-card-border bg-card px-3 py-2 text-sm active:scale-95 transition"
        >
          <option value="all">All topics</option>
          {(Object.keys(PARTS) as PartId[]).map((id) => (
            <option key={id} value={id}>{PARTS[id].short}</option>
          ))}
        </select>

        <label className="sr-only" htmlFor="status-filter">Filter by progress</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Filter)}
          className="min-h-11 rounded-xl border border-card-border bg-card px-3 py-2 text-sm active:scale-95 transition"
        >
          <option value="all">All cards</option>
          <option value="unknown">Still learning</option>
          <option value="known">Known</option>
        </select>

        <button
          onClick={handleShuffle}
          className="min-h-11 rounded-xl border border-card-border bg-card px-3 py-2 text-sm font-medium transition active:scale-95"
        >
          🔀 Shuffle
        </button>

        <button
          onClick={() => {
            if (window.confirm("Reset all flashcard progress? This can't be undone.")) {
              resetKnownCards();
            }
          }}
          className="ml-auto min-h-11 rounded-xl px-3 py-2 text-sm text-muted transition active:scale-95 active:text-foreground"
        >
          Reset progress
        </button>
      </div>

      <p className="text-sm text-muted">
        {knownCount} of {allFlashcards.length} cards marked known · showing {total} card{total === 1 ? "" : "s"}
      </p>

      {!card ? (
        <div className="rounded-2xl border border-card-border bg-card p-10 text-center text-muted">
          No cards match this filter.
        </div>
      ) : (
        <>
          <div className="text-center text-sm text-muted">
            {PARTS[card.part].short} · {card.topic} · {index + 1} / {total}
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-describedby="flip-card-instructions"
            className={`flip-card relative h-80 w-full cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${flipped ? "is-flipped" : ""}`}
            onClick={() => setFlipped((f) => !f)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
          >
            <div className="flip-card-inner relative h-full w-full">
              <div
                aria-hidden={flipped}
                className="flip-card-face absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-card-border bg-card p-6 text-center shadow-sm"
              >
                {card.image && (
                  <div className="relative h-24 w-40">
                    <Image src={card.image.src} alt={card.image.alt} fill className="object-contain" />
                  </div>
                )}
                <p className="text-lg font-medium">{card.front}</p>
                <span aria-hidden className="absolute bottom-3 text-xs text-muted">Tap to flip</span>
              </div>
              <div
                aria-hidden={!flipped}
                className="flip-card-face flip-card-back absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-primary bg-card p-6 text-center shadow-sm"
              >
                <p className="text-base">{card.back}</p>
                <span aria-hidden className="absolute bottom-3 text-xs text-muted">Tap to flip back</span>
              </div>
            </div>
          </div>
          <span id="flip-card-instructions" className="sr-only">
            Press Enter or Space to flip between the question and the answer.
          </span>

          <div className="space-y-3">
            <div className="flex gap-3">
              <button
                onClick={() => mark(false)}
                className="min-h-12 flex-1 rounded-2xl bg-red-100 px-4 text-sm font-semibold text-red-800 transition active:scale-95 dark:bg-red-950 dark:text-red-200"
              >
                Still learning
              </button>
              <button
                onClick={() => mark(true)}
                className="min-h-12 flex-1 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition active:scale-95"
              >
                I know this
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => go(-1)}
                aria-label="Previous card"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-card-border bg-card text-lg transition active:scale-90"
              >
                ←
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next card"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-card-border bg-card text-lg transition active:scale-90"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
