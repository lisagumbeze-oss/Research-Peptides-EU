import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

type ArticleShareButtonProps = {
  title: string;
};

export function ArticleShareButton({ title }: ArticleShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center gap-2 rounded-xl border border-brand-100 bg-mist-50 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-steel-600 hover:border-brand-300 hover:text-brand-700 transition-colors"
      aria-label={copied ? 'Link copied' : 'Share article'}
    >
      {copied ? <Check className="h-4 w-4 text-brand-600" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
