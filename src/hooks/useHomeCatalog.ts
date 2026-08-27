import { useEffect, useMemo, useState } from 'react';
import {
  loadHomeCatalog,
  pickHomeSegments,
  type HomeSegments,
} from '../lib/homeCatalog';

export function useHomeCatalog() {
  const [segments, setSegments] = useState<HomeSegments>({
    featured: [],
    newest: [],
    bestsellers: [],
    categoryRails: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void loadHomeCatalog()
      .then((catalog) => {
        if (cancelled) return;
        setSegments(pickHomeSegments(catalog.products, catalog.categories));
      })
      .catch((error) => {
        console.error('Error loading home catalog:', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => ({ ...segments, loading }), [segments, loading]);
}
