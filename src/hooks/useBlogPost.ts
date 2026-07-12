import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { seedBlogPosts, type BlogPost } from '../data/blogPosts';

interface UseBlogPostResult {
  post: BlogPost | null;
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
}

/**
 * Fetches a single blog post by id (the `id` from the URL).
 *
 * - When Supabase is configured, queries the `blog_posts` row matching `id`,
 *   including the full `content` body used by the article page.
 * - Otherwise (or on error) falls back to the matching local seed row so the
 *   article page still renders before Supabase is set up.
 */
export function useBlogPost(id: string | undefined): UseBlogPostResult {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!id) {
        if (active) {
          setPost(null);
          setError('Missing article id.');
          setLoading(false);
        }
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        const match = seedBlogPosts.find((p) => p.id === id);
        if (active) {
          setPost(match ?? null);
          setError(match ? null : 'Article not found.');
          setUsingFallback(true);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(
            'id, type, badge, title, description, author, category, category_color, media_url, display_order, slug, content, created_at'
          )
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (active) {
          if (data) {
            setPost(data as BlogPost);
            setError(null);
            setUsingFallback(false);
          } else {
            // Not in Supabase — try the local seed so dev URLs still resolve.
            const match = seedBlogPosts.find((p) => p.id === id);
            setPost(match ?? null);
            setError(match ? null : 'Article not found.');
            setUsingFallback(Boolean(match));
          }
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
          const match = seedBlogPosts.find((p) => p.id === id);
          setPost(match ?? null);
          setUsingFallback(true);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  return { post, loading, error, usingFallback };
}
