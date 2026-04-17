type PersistedHorizontalScrollState = {
  activeId?: string;
  cardIndex: number;
  scrollLeft: number;
};

const CARD_SELECTOR = '[data-scroll-card="true"]';

const getCards = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(CARD_SELECTOR));

const readState = (storageKey: string): PersistedHorizontalScrollState | null => {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedHorizontalScrollState>;
    if (typeof parsed.cardIndex !== "number") return null;

    return {
      activeId: parsed.activeId,
      cardIndex: parsed.cardIndex,
      scrollLeft: typeof parsed.scrollLeft === "number" ? parsed.scrollLeft : 0,
    };
  } catch {
    return null;
  }
};

export const getCenteredCardIndex = (container: HTMLElement, cards = getCards(container)) => {
  if (cards.length === 0) return 0;

  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + containerRect.width / 2;

  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(center - containerCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

export const saveHorizontalScrollState = (
  storageKey: string,
  container: HTMLElement,
  activeId?: string | number,
) => {
  const cards = getCards(container);
  const centeredIndex = getCenteredCardIndex(container, cards);
  const activeIdText = activeId != null ? String(activeId) : undefined;

  const matchedIndex = activeIdText
    ? cards.findIndex((card) => card.dataset.adId === activeIdText)
    : -1;

  try {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        activeId: activeIdText,
        cardIndex: matchedIndex >= 0 ? matchedIndex : centeredIndex,
        scrollLeft: container.scrollLeft,
      } satisfies PersistedHorizontalScrollState),
    );
  } catch {
    // Ignore storage errors
  }
};

export const restoreHorizontalScrollState = ({
  storageKey,
  container,
  maxAttempts = 12,
  onRestored,
}: {
  storageKey: string;
  container: HTMLElement;
  maxAttempts?: number;
  onRestored?: (index: number) => void;
}) => {
  let attempts = 0;
  let rafId = 0;
  let timeoutId = 0;

  const tryRestore = () => {
    attempts += 1;

    const state = readState(storageKey);
    if (!state) {
      onRestored?.(0);
      return;
    }

    const cards = getCards(container);
    if (cards.length === 0) {
      if (attempts < maxAttempts) {
        timeoutId = window.setTimeout(() => {
          rafId = window.requestAnimationFrame(tryRestore);
        }, 50);
      }
      return;
    }

    const matchedIndex = state.activeId
      ? cards.findIndex((card) => card.dataset.adId === state.activeId)
      : -1;

    const targetIndex = Math.min(
      matchedIndex >= 0 ? matchedIndex : state.cardIndex,
      cards.length - 1,
    );

    const targetCard = cards[targetIndex];

    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
    } else {
      container.scrollLeft = state.scrollLeft;
    }

    const restoredIndex = getCenteredCardIndex(container, cards);
    const success = restoredIndex === targetIndex || Math.abs(container.scrollLeft - state.scrollLeft) <= 8;

    if (!success && attempts < maxAttempts) {
      timeoutId = window.setTimeout(() => {
        rafId = window.requestAnimationFrame(tryRestore);
      }, 50);
      return;
    }

    onRestored?.(restoredIndex);
  };

  rafId = window.requestAnimationFrame(tryRestore);

  return () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    if (timeoutId) window.clearTimeout(timeoutId);
  };
};