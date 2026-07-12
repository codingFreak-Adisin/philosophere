import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { useBlogPosts } from '../hooks/useBlogPosts';
import type { BlogPost } from '../data/blogPosts';
import VideoMedia from '../components/VideoMedia';
import '../blog.css';

function CategoryBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="category-badge" style={{ background: color }}>
      {label}
    </span>
  );
}

export default function ArticlesPage() {
  const { posts, loading, error, usingFallback } = useBlogPosts();

  const featured = posts.find((p) => p.type === 'featured');
  const standards = posts.filter((p) => p.type === 'standard');

  return (
    <div className="articles-page">
      <div className="articles-topbar">
        <Link to="/" className="articles-topbar__brand">
          <Globe className="w-5 h-5" />
          Asme
        </Link>
        <Link to="/" className="articles-topbar__back">
          ← Back to home
        </Link>
      </div>

      <main className="articles-shell">
        {/* Header */}
        <header>
          <span className="articles-header__badge">Blog</span>
          <h1 className="articles-header__title">Behind the lens</h1>
          <div className="articles-header__bottom">
            <p className="articles-header__subtitle">
              Thoughts, insights, and stories from my photography journey. Take
              a peek into my creative process and recent projects.
            </p>
            <button type="button" className="articles-header__cta">
              View all posts
            </button>
          </div>
        </header>

        {loading ? (
          <div className="articles-status">Loading posts…</div>
        ) : error ? (
          <div className="articles-status">
            Couldn’t load posts from Supabase ({error}). Showing local backup
            data.
          </div>
        ) : null}

        {/* Featured post */}
        {featured && (
          <article className="articles-featured">
            <div className="articles-featured__media">
              <VideoMedia
                src={featured.media_url}
                alt={featured.title}
                variant="featured"
              />
            </div>
            <div className="articles-featured__content">
              {featured.badge && (
                <span className="articles-featured__badge">{featured.badge}</span>
              )}
              <h2 className="articles-featured__title">{featured.title}</h2>
              {featured.description && (
                <p className="articles-featured__desc">{featured.description}</p>
              )}
              <div className="articles-featured__footer">
                {featured.author && (
                  <span className="articles-featured__author">
                    {featured.author}
                  </span>
                )}
                <CategoryBadge
                  label={featured.category}
                  color={featured.category_color}
                />
              </div>
            </div>
          </article>
        )}

        {/* Blog grid */}
        {standards.length > 0 && (
          <section className="articles-grid">
            {standards.map((post: BlogPost) => (
              <article key={post.id} className="articles-card">
                <VideoMedia
                  src={post.media_url}
                  alt={post.title}
                  variant="card"
                />
                <div className="articles-card__meta">
                  <h3 className="articles-card__title">{post.title}</h3>
                  <CategoryBadge
                    label={post.category}
                    color={post.category_color}
                  />
                </div>
              </article>
            ))}
          </section>
        )}

        {usingFallback && !loading && (
          <p className="articles-fallback-note">
            Showing local seed data — set <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> and run the SQL migration in{' '}
            <code>supabase/migrations/0001_blog_posts.sql</code> to load from
            Supabase.
          </p>
        )}
      </main>
    </div>
  );
}
