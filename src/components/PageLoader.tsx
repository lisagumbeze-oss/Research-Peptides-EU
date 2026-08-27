import { Container } from '../design-system';

/** Route-level suspense fallback — layout-shaped shimmer, not a spinner. */
export function PageLoader() {
  return (
    <Container className="py-16 md:py-20" role="status" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="skeleton-block h-8 w-48" />
        <div className="skeleton-block h-5 w-72" />
        <div className="skeleton-block h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton-block h-28 rounded-2xl" />
          <div className="skeleton-block h-28 rounded-2xl" />
        </div>
      </div>
    </Container>
  );
}
