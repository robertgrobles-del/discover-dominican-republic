import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom no implementa ResizeObserver, y los primitivos de interfaz (Select, ScrollArea, Tabs con medición)
// lo usan al montar. Sin este sustituto cualquier prueba que renderice un panel revienta con
// "ResizeObserver is not defined" y el fallo no tiene nada que ver con lo que se estaba probando.
if (!("ResizeObserver" in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, "ResizeObserver", { value: ResizeObserverStub, writable: true });
}

// Mock localStorage for test environment
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] || null,
  };
};

const storageMock = createLocalStorageMock();
Object.defineProperty(window, "localStorage", { value: storageMock, writable: true });
Object.defineProperty(globalThis, "localStorage", { value: storageMock, writable: true });
