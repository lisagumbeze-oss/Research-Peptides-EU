import { type RefObject, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * While `active`, keeps Tab cycling inside `containerRef` and closes on Escape via `onClose`.
 * Key listeners attach even if the ref is populated one frame later (portals / AnimatePresence).
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onClose: () => void,
): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!active) return;

    const previous = document.activeElement as HTMLElement | null;

    const getRoot = () => containerRef.current;

    const getFocusable = (): HTMLElement[] => {
      const root = getRoot();
      if (!root) return [];
      return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled'),
      );
    };

    const focusFirst = () => {
      getFocusable()[0]?.focus();
    };

    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const list = getFocusable();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [active, containerRef]);
}
