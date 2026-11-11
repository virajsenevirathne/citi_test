"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { allFlashcards, PARTS, type PartId } from "@/content";
import { shuffle } from "@/lib/quiz";
import { CardsIcon, CheckIcon, PartyIcon, ShuffleIcon, XIcon } from "@/components/icons";
import {
  getKnownCardsServerSnapshot,
  getKnownCardsSnapshot,
  resetKnownCards,
  setCardKnown,
  subscribe,
} from "@/lib/storage";

type Filter = "all" | "unknown" | "known";

const CHIP_LABEL: Record<PartId, string> = {
  part1: "Our people",
  part2: "Rights",
  part3: "Government",
  values: "Values",
};

export default function FlashcardDeck() {
  const [partFilter, setPartFilter] = useState<PartId | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Filter>("all");
  const [order, setOrder] = useState<string[]>(allFlashcards.map((c) => c.id));
  const [index, setIndex] = useState(0);
  const [resetArmed, setResetArmed] = useState(false);
  const [shuffled, setShuffled] = useState(false);
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
    setShuffled(true);
    window.setTimeout(() => setShuffled(false), 1500);
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
  const pct = Math.round((knownCount / allFlashcards.length) * 100);
  const isKnown = card ? Boolean(known[card.id]) : false;

  // ←/→ move between cards from anywhere on the page.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "SELECT" || t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Swipe left/right on the card to move between cards (touch only; taps still flip).
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-95 ${
      active
        ? "border-primary bg-primary text-primary-foreground shadow-sm"
        : "border-card-border bg-card text-muted hover:border-primary hover:text-foreground"
    }`;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4 md:space-y-5 md:py-6">
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-bold tracking-tight">
              <span className="block text-xs font-semibold uppercase tracking-wider text-primary">Australian citizenship test</span>
              <span className="block text-2xl sm:text-3xl">Flashcards</span>
            </h1>
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-foreground">{knownCount}</span> of {allFlashcards.length} learned
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShuffle}
              className="rounded-xl border border-card-border bg-card px-3.5 py-2 text-sm font-medium transition hover:border-primary active:scale-95"
            >
              <span className="inline-flex items-center gap-1.5">{shuffled ? <CheckIcon size={16} /> : <ShuffleIcon size={16} />}{shuffled ? "Shuffled" : "Shuffle"}</span>
            </button>
            <button
              onClick={() => {
                if (resetArmed) {
                  resetKnownCards();
                  setResetArmed(false);
                } else {
                  setResetArmed(true);
                  window.setTimeout(() => setResetArmed(false), 4000);
                }
              }}
              className={`rounded-xl px-3 py-2 text-sm transition active:scale-95 ${
                resetArmed ? "bg-red-700 font-semibold text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {resetArmed ? "Tap again to erase progress" : "Reset progress"}
            </button>
          </div>
        </div>

        <div
          role="progressbar"
          aria-label="Cards learned"
          aria-valuemin={0}
          aria-valuemax={allFlashcards.length}
          aria-valuenow={knownCount}
          className="h-2 w-full overflow-hidden rounded-full bg-card-border"
        >
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        <div role="group" aria-label="Filter by topic" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_88%,transparent)] md:mx-0 md:flex-wrap md:px-0 md:[mask-image:none]">
          <button aria-pressed={partFilter === "all"} onClick={() => setPartFilter("all")} className={chip(partFilter === "all")}>
            All topics
          </button>
          {(Object.keys(PARTS) as PartId[]).map((id) => (
            <button key={id} aria-pressed={partFilter === id} onClick={() => setPartFilter(id)} className={chip(partFilter === id)}>
              {CHIP_LABEL[id]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
        <div role="group" aria-label="Filter by progress" className="inline-flex rounded-xl border border-card-border bg-card p-1 text-sm">
          {([
            ["all", "All"],
            ["unknown", "Not known yet"],
            ["known", "Known"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              aria-pressed={statusFilter === value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-lg px-3.5 py-2 font-medium transition ${
                statusFilter === value ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {card && <span className="shrink-0 text-sm tabular-nums text-muted">{index + 1} / {total}</span>}
        </div>
      </div>

      {!card ? (
        <div className="rounded-3xl border border-dashed border-card-border bg-card p-12 text-center">
          <div className="flex justify-center text-primary" aria-hidden>{statusFilter === "unknown" ? <PartyIcon size={44} /> : <CardsIcon size={44} />}</div>
          <p className="mt-3 text-lg font-semibold">
            {statusFilter === "unknown" ? "Nothing left to learn here!" : statusFilter === "known" ? "Nothing marked as known yet" : "No cards match this filter"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {statusFilter === "unknown" ? "Every card in this topic is marked as known." : statusFilter === "known" ? "Press \u201cGot it\u201d on a card and it will appear here." : "Try a different topic or progress filter."}
          </p>
          <button
            onClick={() => {
              setPartFilter("all");
              setStatusFilter("all");
            }}
            className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95"
          >
            Show all cards
          </button>
        </div>
      ) : (
        <>
          <div
            key={card.id}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            aria-describedby="flip-card-instructions"
            className={`flip-card relative h-60 w-full cursor-pointer min-[400px]:h-72 md:h-80 short:h-44 select-none rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${flipped ? "is-flipped" : ""}`}
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
                className="flip-card-face absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-y-auto rounded-3xl border border-card-border bg-gradient-to-b from-card to-primary/5 p-8 text-center shadow-lg"
              >
                <span className="absolute left-4 top-4 max-w-[70%] truncate rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{PARTS[card.part].short} · {card.topic}</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Question</span>
                {card.image && (
                  <div className="relative h-28 w-48 sm:h-32 sm:w-56">
                    <Image src={card.image.src} alt={card.image.alt} fill className="object-contain" />
                  </div>
                )}
                <p className="text-xl font-semibold leading-snug sm:text-2xl">{card.front}</p>
                <span aria-hidden className="absolute bottom-4 text-xs text-muted">Tap to flip · swipe for next card</span>
                {isKnown && <span aria-hidden className="absolute right-4 top-4 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"><CheckIcon size={12} className="mr-1 inline" />Known</span>}
              </div>
              <div
                aria-hidden={!flipped}
                className="flip-card-face flip-card-back absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-y-auto rounded-3xl border-2 border-primary bg-primary/10 p-8 text-center shadow-lg"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Answer</span>
                <p className="text-lg leading-relaxed sm:text-xl">{card.back}</p>
                <span aria-hidden className="absolute bottom-4 text-xs text-muted">Tap to flip back</span>
              </div>
            </div>
          </div>
          <span id="flip-card-instructions" className="sr-only">
            Press Enter or Space to flip between the question and the answer. Use the left and right arrow keys to change card.
          </span>

          <div className="sticky bottom-[4.1rem] z-30 -mx-4 flex items-center gap-2 bg-background/90 px-4 py-2 backdrop-blur md:bottom-0 md:gap-3 md:tall:static md:tall:mx-0 md:tall:bg-transparent md:tall:p-0 md:tall:backdrop-blur-none">
            <button
              onClick={() => go(-1)}
              aria-label="Previous card"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-card-border bg-card text-lg transition hover:border-primary active:scale-90"
            >
              ←
            </button>
            <button
              onClick={() => mark(false)}
              className="min-h-12 flex-1 whitespace-nowrap rounded-2xl border-2 border-red-300 bg-red-50 px-3 text-sm font-semibold text-red-800 transition hover:bg-red-100 active:scale-95 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200 dark:hover:bg-red-950"
            >
              <span className="inline-flex items-center justify-center gap-1.5"><XIcon size={16} />Not yet</span>
            </button>
            <button
              onClick={() => mark(true)}
              className="min-h-12 flex-1 whitespace-nowrap rounded-2xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
            >
              <span className="inline-flex items-center justify-center gap-1.5"><CheckIcon size={16} />Got it</span>
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next card"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-card-border bg-card text-lg transition hover:border-primary active:scale-90"
            >
              →
            </button>
          </div>
          <p className="hidden text-center text-xs text-muted md:block">
            Click the card to flip · keyboard: <kbd className="rounded border border-card-border px-1.5">Space</kbd> flip,{" "}
            <kbd className="rounded border border-card-border px-1.5">←</kbd> <kbd className="rounded border border-card-border px-1.5">→</kbd> navigate
          </p>
        </>
      )}
    </div>
  );
}
