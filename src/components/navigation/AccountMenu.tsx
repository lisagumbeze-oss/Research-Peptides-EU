import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '../../i18n/LocaleLink';
import { LogOut, User } from 'lucide-react';
import { cn } from '../../lib/utils';

type AccountMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoUrl?: string | null;
  isAdmin?: boolean;
  onLogout: () => void;
};

export default function AccountMenu({
  open,
  onOpenChange,
  photoUrl,
  isAdmin,
  onLogout,
}: AccountMenuProps) {
  const { t } = useTranslation('common');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
          open ? 'border-brand-500 bg-brand-50' : 'border-brand-100 hover:border-brand-300',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls="account-menu-dropdown"
        aria-label="Account menu"
        onClick={() => onOpenChange(!open)}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <User className="h-5 w-5 text-brand-600" aria-hidden />
        )}
      </button>
      {open && (
        <div
          id="account-menu-dropdown"
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-52 py-2 rounded-2xl bg-white border border-brand-100 shadow-elevated z-50"
        >
          {isAdmin && (
            <LocaleLink
              to="/admin"
              role="menuitem"
              className="block px-4 py-2.5 text-sm text-steel-600 hover:bg-brand-50 hover:text-brand-700"
              onClick={() => onOpenChange(false)}
            >
              Admin Dashboard
            </LocaleLink>
          )}
          <LocaleLink
            to="/profile"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-steel-600 hover:bg-brand-50 hover:text-brand-700"
            onClick={() => onOpenChange(false)}
          >
            {t('account')}
          </LocaleLink>
          <LocaleLink
            to="/orders"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-steel-600 hover:bg-brand-50 hover:text-brand-700"
            onClick={() => onOpenChange(false)}
          >
            {t('orders')}
          </LocaleLink>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
