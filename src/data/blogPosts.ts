export type BlogPostType = 'featured' | 'standard';

export interface BlogPost {
  id: string;
  type: BlogPostType;
  badge?: string;
  title: string;
  description?: string;
  author?: string;
  category: string;
  category_color: string;
  media_url: string;
  display_order: number;
}

/**
 * Local seed data used when Supabase is not configured or the fetch fails.
 * Mirrors the rows that the SQL migration inserts into the `blog_posts`
 * table so the page renders identically in both modes.
 */
export const seedBlogPosts: BlogPost[] = [
  {
    id: 'featured-1',
    type: 'featured',
    badge: 'Must Read',
    title: 'Full-Frame vs. Crop Sensor: Which for Photography?',
    description:
      "An honest look at the real-world differences between these camera systems to help you choose what's actually right for your photography needs.",
    author: 'By August Renner (c)',
    category: 'Gear',
    category_color: '#7d1a4a',
    media_url:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_155500_808e6fdd-761f-4acd-b3be-cb7e6e700def.mp4',
    display_order: 0,
  },
  {
    id: 'standard-1',
    type: 'standard',
    title: 'Finding Natural Light in Unexpected Places',
    category: 'Lighting',
    category_color: '#2c4c34',
    media_url:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',
    display_order: 1,
  },
  {
    id: 'standard-2',
    type: 'standard',
    title: 'My Approach to Editing: Creating a Consistent Photography Style',
    category: 'Editing',
    category_color: '#a63e2d',
    media_url:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4',
    display_order: 2,
  },
  {
    id: 'standard-3',
    type: 'standard',
    title: 'Pricing Your Photography: Strategies That Work',
    category: 'Business',
    category_color: '#1a2b8c',
    media_url:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_154232_f8809bd2-a6c3-4a38-908d-2005e5b3cb3e.mp4',
    display_order: 3,
  },
];
