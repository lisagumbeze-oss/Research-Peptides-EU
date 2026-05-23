import type { ReactNode } from 'react';
import { Container } from '../../design-system';

type CatalogPageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
};

export function CatalogPageHeader({ eyebrow, title, description, actions }: CatalogPageHeaderProps) {
  return (
    <div className="bg-navy-950 text-white relative overflow-hidden border-b border-brand-900/40">
      <div className="absolute inset-0 bg-scientific-grid opacity-20 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 bg-gradient-glow opacity-50 pointer-events-none" aria-hidden />
      <Container className="relative z-10 py-12 md:py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-caption text-brand-300 mb-3">{eyebrow}</p>
            <h1 className="text-h1 text-white font-display font-bold mb-3">{title}</h1>
            {description ? <p className="text-silver-400 text-sm md:text-base leading-relaxed">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </Container>
    </div>
  );
}
