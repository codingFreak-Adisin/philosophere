import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useBlogPost } from '../hooks/useBlogPost';
import { renderMarkdown } from '../lib/markdown';
import '../blog.css';

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function formatDate(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { post, loading, error } = useBlogPost(id);

  const bodyHtml = useMemo(
    () => (post?.content ? renderMarkdown(post.content) : ''),
    [post?.content]
  );

  return (
    <div className="article-page">
      <div className="articles-topbar">
        <Link to="/" className="articles-topbar__brand">
          <img src="/logo.png" alt="Philosophere logo" className="h-7 w-7 rounded-full object-cover" />
          Philosophere
        </Link>
        <Link to="/articles" className="articles-topbar__back">
          ← Back to all posts
        </Link>
      </div>

      <main className="article-shell">
        {loading ? (
          <div className="article-status">Loading article…</div>
        ) : !post ? (
          <div className="article-notfound">
            <h2>Article not found</h2>
            <p>
              {error
                ? `Couldn’t load this article (${error}).`
                : 'This article may have been moved or removed.'}
            </p>
            <Link to="/articles" className="article-footer__all">
              Browse all posts
            </Link>
          </div>
        ) : (
          <article>
            <Link to="/articles" className="article-back">
              ← All posts
            </Link>

            <div className="article-meta-row">
              <span
                className="article-category-badge"
                style={{ background: post.category_color }}
              >
                {post.category}
              </span>
              <span className="article-date">
                {formatDate(post.created_at)}
              </span>
            </div>

            <h1 className="article-title">{post.title}</h1>
            {post.description && (
              <p className="article-excerpt">{post.description}</p>
            )}
            {post.author && <p className="article-author">{post.author}</p>}

            <div className="article-hero">
              {isVideoUrl(post.media_url) ? (
                <video
                  src={post.media_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={post.media_url} alt={post.title} />
              )}
            </div>

            {bodyHtml ? (
              <div
                className="article-body"
                // Content is HTML-escaped + markdown-rendered in src/lib/markdown.ts.
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <div className="article-body">
                <p>This article doesn’t have body content yet.</p>
              </div>
            )}

            <footer className="article-footer">
              <Link to="/" className="article-footer__brand">
                <img src="/logo.png" alt="" className="h-6 w-6 rounded-full object-cover" />
                Philosophere © 2026
              </Link>
              <Link to="/articles" className="article-footer__all">
                View all posts
              </Link>
            </footer>
          </article>
        )}
      </main>
    </div>
  );
}
