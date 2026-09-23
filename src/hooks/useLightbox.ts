import { useCallback, useState } from "react";

export interface UseLightboxReturn {
  /** Whether the lightbox overlay is currently visible. */
  isOpen: boolean;
  /** Index of the image currently shown. */
  currentIndex: number;
  /** Opens the lightbox at the given image index (defaults to 0). */
  open: (index?: number) => void;
  /** Closes the lightbox without resetting the current index. */
  close: () => void;
  /** Advances to the next image, wrapping around to the first once past the last. */
  next: (length: number) => void;
  /** Goes back to the previous image, wrapping around to the last from the first. */
  prev: (length: number) => void;
  /** Jumps directly to a specific index (e.g. clicking a thumbnail/dot indicator). */
  setCurrentIndex: (index: number) => void;
}

/**
 * Shared state management for image gallery lightboxes.
 *
 * Encapsulates the open/close/current-index bookkeeping that gallery/lightbox
 * UIs repeat across the site. `next`/`prev` take the current images array
 * length explicitly instead of being bound to a fixed list, since the number
 * of images (and even the images themselves) can differ per page and may not
 * be known before other data has loaded.
 *
 * The visual markup (fullscreen overlay, modal, etc.) is intentionally left
 * to each consumer - some pages already share the `<Lightbox>` presentational
 * component from `@/components/ui/lightbox`, while others render a bespoke
 * overlay.
 */
export function useLightbox(): UseLightboxReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = useCallback((index: number = 0) => {
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = useCallback((length: number) => {
    setCurrentIndex((prev) => (length > 0 ? (prev + 1) % length : 0));
  }, []);

  const prev = useCallback((length: number) => {
    setCurrentIndex((prevIndex) => (length > 0 ? (prevIndex - 1 + length) % length : 0));
  }, []);

  return { isOpen, currentIndex, open, close, next, prev, setCurrentIndex };
}
