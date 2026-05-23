import { Container } from '../design-system';

/** Route-level suspense fallback — minimal layout shift. */
export function PageLoader() {
  return (
    <Container className="py-20 flex justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="h-10 w-10 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
    </Container>
  );
}
