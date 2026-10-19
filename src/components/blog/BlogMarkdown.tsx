import { isValidElement, type ReactNode } from 'react';
import Markdown from 'react-markdown';
import { LocaleLink } from '../../i18n/LocaleLink';
import { normalizeBlogMarkdown, uniqueHeadingId } from '../../lib/blog';

type BlogMarkdownProps = {
  content: string;
};

function plainText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(plainText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return plainText(node.props.children);
  return '';
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith('mailto:');
}

function isInternalPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

function isImageOnlyChildren(children: ReactNode): boolean {
  if (Array.isArray(children)) {
    const meaningful = children.filter((child) => {
      if (child == null || child === false || child === true) return false;
      if (typeof child === 'string') return child.trim().length > 0;
      return true;
    });
    return meaningful.length === 1 && isImageOnlyChildren(meaningful[0]);
  }
  if (!isValidElement<{ src?: string }>(children)) return false;
  return children.type === 'img' || typeof children.props?.src === 'string';
}

const linkClassName =
  'font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:text-brand-800 hover:decoration-brand-500';

const imageLinkClassName = 'block no-underline hover:opacity-95 transition-opacity';

export function BlogMarkdown({ content }: BlogMarkdownProps) {
  const source = normalizeBlogMarkdown(content);
  const seen = new Map<string, number>();

  const headingId = (children: ReactNode) => uniqueHeadingId(plainText(children), seen);

  return (
    <div className="blog-prose">
      <Markdown
        components={{
          h1: ({ children }) => (
            <h2 id={headingId(children)} className="scroll-mt-8">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 id={headingId(children)} className="scroll-mt-8">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 id={headingId(children)} className="scroll-mt-8">
              {children}
            </h3>
          ),
          h4: ({ children }) => <h4 className="scroll-mt-8">{children}</h4>,
          p: ({ children }) => <p>{children}</p>,
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => <blockquote>{children}</blockquote>,
          hr: () => <hr />,
          strong: ({ children }) => <strong className="font-semibold text-navy-950">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          code: ({ children }) => <code>{children}</code>,
          pre: ({ children }) => <pre>{children}</pre>,
          a: ({ href, children }) => {
            const url = href || '';
            const className = isImageOnlyChildren(children) ? imageLinkClassName : linkClassName;
            if (url.startsWith('#')) {
              return (
                <a href={url} className={className}>
                  {children}
                </a>
              );
            }
            if (isInternalPath(url)) {
              return (
                <LocaleLink to={url} className={className}>
                  {children}
                </LocaleLink>
              );
            }
            if (isExternalHref(url)) {
              return (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${className} break-words`}
                >
                  {children}
                </a>
              );
            }
            return <span>{children}</span>;
          },
          img: ({ src, alt }) =>
            src ? (
              <img
                src={src}
                alt={alt || ''}
                className="my-8 w-full rounded-2xl border border-brand-100 object-cover shadow-card"
                loading="lazy"
                decoding="async"
              />
            ) : null,
        }}
      >
        {source}
      </Markdown>
    </div>
  );
}
