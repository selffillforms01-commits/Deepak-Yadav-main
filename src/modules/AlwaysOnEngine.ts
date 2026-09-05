export interface AlwaysOnState {
  enabled: boolean;
  active: boolean;
}

export interface AlwaysOnEvent {
  type: "screen-change" | "form-change" | "focus-change";
  timestamp: number;
  path?: string;
  fieldId?: string;
}

let enabled = true;
let observer: MutationObserver | null = null;
let intervalId: number | null = null;
let lastPath = "";
let lastFocusedField = "";
let listeners = new Set<(event: AlwaysOnEvent) => void>();

export function isAlwaysOnEnabled(): boolean {
  return enabled;
}

export function setAlwaysOnEnabled(value: boolean): void {
  enabled = value;

  if (!enabled) {
    stopObserver();
  }
}

export function getAlwaysOnState(): AlwaysOnState {
  return {
    enabled,
    active: enabled && (observer !== null || intervalId !== null),
  };
}

export function subscribeAlwaysOn(
  listener: (event: AlwaysOnEvent) => void
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function emit(event: AlwaysOnEvent): void {
  if (!enabled) return;

  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // A listener must never break the observer.
    }
  });
}

function checkPageState(): void {
  if (!enabled || typeof window === "undefined") return;

  const currentPath = window.location.pathname;

  if (currentPath !== lastPath) {
    lastPath = currentPath;

    emit({
      type: "screen-change",
      timestamp: Date.now(),
      path: currentPath,
    });
  }

  if (typeof document !== "undefined") {
    const active = document.activeElement;

    const currentFocused =
      active instanceof HTMLElement
        ? active.id || active.getAttribute("name") || ""
        : "";

    if (currentFocused !== lastFocusedField) {
      lastFocusedField = currentFocused;

      if (currentFocused) {
        emit({
          type: "focus-change",
          timestamp: Date.now(),
          fieldId: currentFocused,
          path: currentPath,
        });
      }
    }
  }
}

export function startObserver(): void {
  if (!enabled || typeof window === "undefined") return;

  stopObserver();

  lastPath = window.location.pathname;

  checkPageState();

  if (typeof MutationObserver !== "undefined" && document.body) {
    observer = new MutationObserver(() => {
      emit({
        type: "form-change",
        timestamp: Date.now(),
        path: window.location.pathname,
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  intervalId = window.setInterval(checkPageState, 500);
}

export function stopObserver(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (intervalId !== null && typeof window !== "undefined") {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

export const AlwaysOnEngine = {
  isAlwaysOnEnabled,
  setAlwaysOnEnabled,
  getAlwaysOnState,
  subscribeAlwaysOn,
  startObserver,
  stopObserver,
};
