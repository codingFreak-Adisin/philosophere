import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { seedBlogPosts, type BlogPost } from '../data/blogPosts';

interface UseBlogPostsResult {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
}

/**
 * Fetches blog posts ordered by display_order ascending.
 *
 * - When Supabase env vars are configured, queries the `blog_posts` table.
 * - Otherwise (or on fetch error) falls back to local seed data so the page
 *   still renders during local development and before Supabase is set up.
 */
export function useBlogPosts(): UseBlogPostsResult {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!isSupabaseConfigured || !supabase) {
        if (active) {
          setPosts(seedBlogPosts);
          setUsingFallback(true);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(
            'id, type, badge, title, description, author, category, category_color, media_url, display_order, slug'
          )
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (active) {
          if (data && data.length > 0) {
            setPosts(data as BlogPost[]);
            setUsingFallback(false);
          } else {
            setPosts(seedBlogPosts);
            setUsingFallback(true);
          }
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
          setPosts(seedBlogPosts);
          setUsingFallback(true);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return { posts, loading, error, usingFallback };
}
