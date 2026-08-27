import { cn } from '../../lib/utils';

type HamburgerIconProps = {
  open: boolean;
};

/** Three-line menu icon that morphs to an X. */
export function HamburgerIcon({ open }: HamburgerIconProps) {
  return (
    <span className="relative block h-5 w-5" aria-hidden>
      <span
        className={cn(
          'absolute left-0.5 block h-0.5 w-4 rounded-full bg-current',
          'transition-transform duration-200 ease-out motion-reduce:transition-none',
          open ? 'top-2 rotate-45' : 'top-1',
        )}
      />
      <span
        className={cn(
          'absolute left-0.5 top-2 block h-0.5 w-4 rounded-full bg-current',
          'transition-opacity duration-200 motion-reduce:transition-none',
          open && 'opacity-0',
        )}
      />
      <span
        className={cn(
          'absolute left-0.5 block h-0.5 w-4 rounded-full bg-current',
          'transition-transform duration-200 ease-out motion-reduce:transition-none',
          open ? 'top-2 -rotate-45' : 'top-3.5',
        )}
      />
    </span>
  );
}
