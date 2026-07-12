-- ============================================================================
-- Adds full-article body content + a URL slug to blog_posts so each card can
-- open a dedicated article page. Run this in the Supabase SQL editor (or
-- `supabase db push`) after 0001_blog_posts.sql.
-- ============================================================================

alter table public.blog_posts
  add column if not exists slug    text,
  add column if not exists content text;

-- Slug should be unique across posts so article URLs are stable.
-- Nulls are allowed so older rows / drafts without a slug still work.
drop policy if exists "blog_posts content public read" on public.blog_posts;
create unique index if not exists blog_posts_slug_key
  on public.blog_posts (slug)
  where slug is not null;

-- ----------------------------------------------------------------------------
-- Seed body content for the rows inserted by 0001_blog_posts.sql.
-- Content is Markdown — rendered client-side by src/lib/markdown.ts.
-- ----------------------------------------------------------------------------
update public.blog_posts set slug = 'full-frame-vs-crop-sensor',
  content = $markdown$## The real question isn't the sensor — it's the photographer

When I started out, I was convinced that a **full-frame sensor** was the price of admission to "serious" photography. Every forum, every gear video, every second-hand opinion pointed the same direction: *full-frame or bust.* Years later, having shot weddings on both, I think that framing is mostly wrong — and a little unhelpful.

Here's the honest, real-world breakdown I wish someone had given me.

### What full-frame actually gives you

A full-frame sensor (roughly 36 × 24mm) gives you three things that genuinely matter:

- Better low-light performance, because the individual photosites are larger.
- Shallower depth of field at equivalent framing — that "subject pops, background melts" look.
- A wider dynamic range, which buys you room to recover shadows and highlights in post.

### Where crop sensors win

Crop (APS-C) sensors aren't a compromise — they're a *different tool.*

1. **Reach.** The 1.5× crop factor turns a 70–200mm into a 105–300mm. Wildlife and sports shooters love this.
2. **Size and weight.** Smaller bodies, smaller lenses, less fatigue on a 12-hour shoot.
3. **Cost.** You can build an entire crop kit for the price of one full-frame body.

> The best camera is the one that gets out of your way. Reach for the one that lets you forget the gear and think about the frame.

### So which should you buy?

If you shoot portraits, events, or anything where subject separation and low light dominate — full-frame rewards you. If you travel light, shoot wildlife, or are still finding your voice — a crop sensor will make you a better photographer faster, because you'll spend less time babying gear and more time making pictures.

Don't upgrade your sensor until you can name the specific shot your current camera can't take. That's the only honest reason.
$markdown$
where type = 'featured' and title = 'Full-Frame vs. Crop Sensor: Which for Photography?';

update public.blog_posts set slug = 'finding-natural-light-in-unexpected-places',
  content = $markdown$## Light is everywhere — you just have to look sideways

The golden hour gets all the press, but some of my favourite frames have come from light sources most photographers walk past: a north-facing window at 2pm, the bounce off a white wall, even the cold wash of an underground car park.

### Train your eye to see direction, not just warmth

Light has *direction* before it has *colour*. Once you start reading where it's coming from, the whole world becomes a softbox.

- **Window light** is a single, large, directional source — flattering for faces.
- **Open shade** under a tree or awning gives even, low-contrast light.
- **Reflected light** off concrete or water adds a second, gentler fill.

### A simple exercise

Pick one room in your house. Shoot the same object at four different times of day. Don't change the object — only the light changes. You'll learn more about exposure in an afternoon than in a week of YouTube.

> Natural light isn't a setting on your camera. It's a habit of attention.

Chase the light that's already there. The good stuff is rarely where the crowd is pointing their lenses.
$markdown$
where type = 'standard' and title = 'Finding Natural Light in Unexpected Places';

update public.blog_posts set slug = 'my-approach-to-editing-consistent-style',
  content = $markdown$## Consistency isn't a preset — it's a set of decisions

People ask me which preset gives a portfolio its "look." The honest answer: none of them. A consistent style comes from making the *same trade-offs* on every edit, not from slapping the same LUT on every photo.

### The three dials I touch first

1. **White balance.** I pick a temperature tint and stay near it across the whole set.
2. **Tone curve.** A gentle S-curve, lifted blacks for a soft floor, same shape every time.
3. **Colour palette.** I lean into greens and warm neutrals, and pull down saturations on colours that fight that palette.

### What I deliberately don't do

- I don't chase trends. The "look of the month" ages badly.
- I don't skin-smooth into plastic. Texture is part of the story.
- I don't over-sharpen. A slightly soft photo reads as a memory; an over-sharpened one reads as an ad.

> Style is the residue of choices you're willing to repeat.

Edit one image until it feels like *you*. Then make the next one match it. Do that a hundred times and people will recognise your work before they see your name.
$markdown$
where type = 'standard' and title = 'My Approach to Editing: Creating a Consistent Photography Style';

update public.blog_posts set slug = 'pricing-your-photography-strategies-that-work',
  content = $markdown$## Pricing is a positioning decision, not a math problem

Most photographers price by guessing what the market will bear, then undercutting themselves out of fear. The result is a calendar full of cheap work and a body that's exhausted. Let's fix that.

### Three pricing models that actually work

- **Session-based.** A flat fee for a defined deliverable. Simple, predictable, great for portraits and families.
- **Package-tiered.** A small/medium/large menu lets the client self-select their budget without you negotiating.
- **Usage-based.** Charge for the *rights*, not just the shoot. This is where commercial work lives.

### The rules I follow

1. Never publish your lowest price. Your floor should be private.
2. Build in margin for re-edits and reschedules — they *will* happen.
3. Raise prices when you're booked 80% or more. Demand is data.

> The cheapest photographer is rarely the busiest, and never the happiest.

Charge enough that you can afford to care about every frame. Your clients can feel the difference, even if they can't name it.
$markdown$
where type = 'standard' and title = 'Pricing Your Photography: Strategies That Work';
