import { useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createAdminClient, isSupabaseConfigured } from '../lib/supabaseAdmin';
import { renderMarkdown } from '../lib/markdown';
import type { SupabaseClient } from '@supabase/supabase-js';
import '../admin.css';

interface PostRow {
  id: string;
  title: string;
  category: string;
  category_color: string;
  type: 'featured' | 'standard';
  display_order: number;
  created_at?: string;
}

const STORAGE_BUCKET = 'article-media';
const SESSION_KEY = 'philosophere_admin_code';

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'post';
}

function uniqueSlug(base: string, taken: string[]): string {
  let candidate = base;
  let n = 2;
  while (taken.includes(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

export default function AdminPage() {
  const [code, setCode] = useState<string>('');
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string>('');
  const [unlocking, setUnlocking] = useState<boolean>(false);
  const [client, setClient] = useState<SupabaseClient | null>(null);

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState<boolean>(false);

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('By Philosophere');
  const [category, setCategory] = useState('');
  const [categoryColor, setCategoryColor] = useState('#111111');
  const [type, setType] = useState<'featured' | 'standard'>('standard');
  const [badge, setBadge] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [content, setContent] = useState('');

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  // Restore session on mount.
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const c = createAdminClient(saved);
      if (c) {
        setClient(c);
        setUnlocked(true);
      }
    }
  }, []);

  const refreshList = async (c: SupabaseClient) => {
    const { data, error } = await c
      .from('blog_posts')
      .select('id, title, category, category_color, type, display_order, created_at')
      .order('display_order', { ascending: true });
    if (error) {
      setStatusMsg({ kind: 'err', text: `Couldn’t load posts: ${error.message}` });
      return;
    }
    setPosts((data as PostRow[]) ?? []);
  };

  useEffect(() => {
    if (client && unlocked) refreshList(client);
  }, [client, unlocked]);

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    setUnlockError('');
    const c = createAdminClient(code);
    if (!c) {
      setUnlockError(
        'Supabase isn’t configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local and rebuild.'
      );
      setUnlocking(false);
      return;
    }
    try {
      const { data, error } = await c.rpc('admin_ping');
      if (error) throw error;
      if (data !== true) {
        setUnlockError('Wrong access code.');
        setUnlocking(false);
        return;
      }
      sessionStorage.setItem(SESSION_KEY, code);
      setClient(c);
      setUnlocked(true);
    } catch (err) {
      setUnlockError(
        err instanceof Error
          ? `Couldn’t verify code: ${err.message}`
          : 'Couldn’t verify code.'
      );
    } finally {
      setUnlocking(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setClient(null);
    setCode('');
    setPosts([]);
    setShowEditor(false);
    setEditingId(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setAuthor('By Philosophere');
    setCategory('');
    setCategoryColor('#111111');
    setType('standard');
    setBadge('');
    setMediaUrl('');
    setSlug('');
    setDisplayOrder('');
    setContent('');
    setStatusMsg(null);
    setShowPreview(false);
  };

  const startNew = () => {
    resetForm();
    setShowEditor(true);
  };

  const startEdit = async (id: string) => {
    if (!client) return;
    const { data, error } = await client
      .from('blog_posts')
      .select(
        'id, type, badge, title, description, author, category, category_color, media_url, display_order, slug, content'
      )
      .eq('id', id)
      .maybeSingle();
    if (error || !data) {
      setStatusMsg({ kind: 'err', text: error?.message ?? 'Couldn’t load article.' });
      return;
    }
    const p = data as any;
    setEditingId(p.id);
    setType(p.type ?? 'standard');
    setBadge(p.badge ?? '');
    setTitle(p.title ?? '');
    setDescription(p.description ?? '');
    setAuthor(p.author ?? '');
    setCategory(p.category ?? '');
    setCategoryColor(p.category_color ?? '#111111');
    setMediaUrl(p.media_url ?? '');
    setSlug(p.slug ?? '');
    setDisplayOrder(p.display_order != null ? String(p.display_order) : '');
    setContent(p.content ?? '');
    setStatusMsg(null);
    setShowEditor(true);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!client) return null;
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, '_')}`;
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) {
      setStatusMsg({ kind: 'err', text: `Image upload failed: ${error.message}` });
      return null;
    }
    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const insertAtCursor = (before: string, after: string = '', placeholder: string = '') => {
    const ta = bodyRef.current;
    if (!ta) {
      setContent((c) => c + before + placeholder + after);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + selected.length + after.length;
      ta.selectionStart = ta.selectionEnd = pos;
    });
  };

  const insertImageByUrl = () => {
    const url = window.prompt('Image URL');
    if (!url) return;
    const alt = window.prompt('Alt text (optional)') || '';
    insertAtCursor(`![${alt}](${url})`, '', '');
  };

  const insertImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (!url) return;
    const alt = file.name.replace(/\.[^.]+$/, '');
    insertAtCursor(`![${alt}](${url})`, '', '');
  };

  const setHeroFromUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) setMediaUrl(url);
  };

  const previewHtml = useMemo(() => renderMarkdown(content), [content]);

  const handlePublish = async () => {
    if (!client) return;
    if (!title.trim()) return setStatusMsg({ kind: 'err', text: 'Title is required.' });
    if (!category.trim()) return setStatusMsg({ kind: 'err', text: 'Category is required.' });
    if (!mediaUrl.trim()) return setStatusMsg({ kind: 'err', text: 'Add a hero image or video URL.' });

    setSaving(true);
    setStatusMsg(null);
    try {
      // Resolve slug + display_order.
      const { data: existing } = await client
        .from('blog_posts')
        .select('slug, display_order');
      const slugs = (existing ?? []).map((r: any) => r.slug).filter(Boolean);
      const finalSlug = uniqueSlug(slug.trim() || slugify(title), slugs);

      let order = Number(displayOrder);
      if (!Number.isFinite(order) || displayOrder === '') {
        const max = (existing ?? []).reduce((m: number, r: any) => Math.max(m, Number(r.display_order) || 0), 0);
        order = max + 1;
      }

      const payload = {
        type,
        badge: type === 'featured' ? badge.trim() || 'Must Read' : null,
        title: title.trim(),
        description: description.trim() || null,
        author: author.trim() || null,
        category: category.trim(),
        category_color: categoryColor,
        media_url: mediaUrl.trim(),
        display_order: order,
        slug: finalSlug,
        content: content || null,
      };

      if (editingId) {
        const { error } = await client.from('blog_posts').update(payload).eq('id', editingId);
        if (error) throw error;
        setStatusMsg({ kind: 'ok', text: 'Article updated.' });
      } else {
        const { error } = await client.from('blog_posts').insert(payload);
        if (error) throw error;
        setStatusMsg({ kind: 'ok', text: 'Article published.' });
      }

      await refreshList(client);
      resetForm();
      setShowEditor(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/admin|code|policy|permission|denied/i.test(msg)) {
        setStatusMsg({ kind: 'err', text: 'Access code rejected by Supabase. Re-enter the code.' });
        handleLogout();
      } else {
        setStatusMsg({ kind: 'err', text: `Publish failed: ${msg}` });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, postTitle: string) => {
    if (!client) return;
    if (!window.confirm(`Delete “${postTitle}”? This can’t be undone.`)) return;
    const { error } = await client.from('blog_posts').delete().eq('id', id);
    if (error) {
      const msg = error.message;
      if (/admin|code|policy|permission|denied/i.test(msg)) {
        setStatusMsg({ kind: 'err', text: 'Access code rejected. Re-enter the code.' });
        handleLogout();
      } else {
        setStatusMsg({ kind: 'err', text: `Delete failed: ${msg}` });
      }
      return;
    }
    setStatusMsg({ kind: 'ok', text: 'Article deleted.' });
    if (editingId === id) resetForm();
    await refreshList(client);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-page">
        <div className="admin-shell">
          <div className="admin-status">
            Supabase isn’t configured. Set <code>SUPABASE_URL</code> and{' '}
            <code>SUPABASE_ANON_KEY</code> in <code>.env.local</code>, run the
            migrations in <code>supabase/migrations/</code>, and restart the dev
            server.
          </div>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="admin-page">
        <div className="admin-gate">
          <Link to="/" className="admin-gate__brand">
            <img src="/logo.png" alt="" className="h-7 w-7 rounded-full object-cover" />
            Philosophere — Team Editor
          </Link>
          <form className="admin-gate__card" onSubmit={handleUnlock}>
            <h1>Team access</h1>
            <p>Enter the team access code to open the article editor.</p>
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Access code"
              className="admin-gate__input"
            />
            {unlockError && <div className="admin-gate__error">{unlockError}</div>}
            <button type="submit" disabled={unlocking} className="admin-gate__btn">
              {unlocking ? 'Verifying…' : 'Unlock editor'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <Link to="/" className="admin-topbar__brand">
          <img src="/logo.png" alt="" className="h-7 w-7 rounded-full object-cover" />
          Philosophere — Team Editor
        </Link>
        <div className="admin-topbar__actions">
          <Link to="/articles" className="admin-topbar__link">View site</Link>
          <button onClick={handleLogout} className="admin-topbar__link">Lock</button>
        </div>
      </div>

      <main className="admin-shell">
        {!showEditor ? (
          <>
            <div className="admin-sectionhead">
              <div>
                <h1>Published articles</h1>
                <p>{posts.length} post{posts.length === 1 ? '' : 's'} live on the site.</p>
              </div>
              <button onClick={startNew} className="admin-primary-btn">+ New article</button>
            </div>

            {statusMsg && (
              <div className={`admin-toast admin-toast--${statusMsg.kind}`}>{statusMsg.text}</div>
            )}

            {posts.length === 0 ? (
              <div className="admin-status">No articles yet. Click “New article” to publish your first.</div>
            ) : (
              <ul className="admin-list">
                {posts.map((p) => (
                  <li key={p.id} className="admin-list__row">
                    <span className="admin-list__badge" style={{ background: p.category_color }}>
                      {p.category}
                    </span>
                    <div className="admin-list__main">
                      <div className="admin-list__title">{p.title}</div>
                      <div className="admin-list__meta">
                        {p.type === 'featured' ? 'Featured' : 'Standard'} · order {p.display_order}
                      </div>
                    </div>
                    <div className="admin-list__actions">
                      <Link to={`/articles/${p.id}`} target="_blank" className="admin-list__btn">Open</Link>
                      <button onClick={() => startEdit(p.id)} className="admin-list__btn">Edit</button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="admin-list__btn admin-list__btn--danger"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <div className="admin-sectionhead">
              <div>
                <h1>{editingId ? 'Edit article' : 'New article'}</h1>
                <p>{editingId ? 'Update and republish.' : 'Write, add images, and publish with one click.'}</p>
              </div>
              <div className="admin-sectionhead__actions">
                <button onClick={() => { setShowEditor(false); resetForm(); }} className="admin-ghost-btn">
                  ← Back to list
                </button>
                <button
                  onClick={handlePublish}
                  disabled={saving || uploading}
                  className="admin-primary-btn"
                >
                  {saving ? 'Publishing…' : editingId ? 'Update article' : 'Publish article'}
                </button>
              </div>
            </div>

            {statusMsg && (
              <div className={`admin-toast admin-toast--${statusMsg.kind}`}>{statusMsg.text}</div>
            )}

            <div className="admin-editor">
              <div className="admin-editor__head">
                <input
                  className="admin-editor__title"
                  placeholder="Article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <input
                  className="admin-editor__subtitle"
                  placeholder="Short summary (shown on the card and above the article)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="admin-editor__meta">
                <label className="admin-field">
                  <span>Category</span>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Gear" />
                </label>
                <label className="admin-field admin-field--color">
                  <span>Tag color</span>
                  <input type="color" value={categoryColor} onChange={(e) => setCategoryColor(e.target.value)} />
                </label>
                <label className="admin-field">
                  <span>Author</span>
                  <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="By …" />
                </label>
                <label className="admin-field">
                  <span>Display order</span>
                  <input
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="auto"
                    inputMode="numeric"
                  />
                </label>
                <label className="admin-field">
                  <span>Type</span>
                  <select value={type} onChange={(e) => setType(e.target.value as 'featured' | 'standard')}>
                    <option value="standard">Standard (grid)</option>
                    <option value="featured">Featured (hero card)</option>
                  </select>
                </label>
                {type === 'featured' && (
                  <label className="admin-field">
                    <span>Badge</span>
                    <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="Must Read" />
                  </label>
                )}
              </div>

              <div className="admin-hero">
                <label className="admin-field">
                  <span>Hero image / video URL</span>
                  <input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://… or upload below" />
                </label>
                <label className="admin-upload">
                  <span>{uploading ? 'Uploading…' : 'Or upload an image'}</span>
                  <input type="file" accept="image/*" onChange={setHeroFromUpload} disabled={uploading} />
                </label>
              </div>

              <div className="admin-bodywrap">
                <div className="admin-toolbar">
                  <button type="button" onClick={() => insertAtCursor('## ', '', 'Heading')}>H2</button>
                  <button type="button" onClick={() => insertAtCursor('### ', '', 'Subheading')}>H3</button>
                  <button type="button" onClick={() => insertAtCursor('**', '**', 'bold')}>B</button>
                  <button type="button" onClick={() => insertAtCursor('*', '*', 'italic')}><i>I</i></button>
                  <button type="button" onClick={() => insertAtCursor('> ', '', 'Quote')}>“ ”</button>
                  <button type="button" onClick={() => insertAtCursor('- ', '', 'List item')}>• List</button>
                  <button type="button" onClick={() => insertAtCursor('1. ', '', 'Item')}>1. List</button>
                  <button type="button" onClick={insertImageByUrl}>🖼 URL</button>
                  <label className="admin-toolbar__upload">
                    🖼 Upload
                    <input type="file" accept="image/*" onChange={insertImageUpload} disabled={uploading} />
                  </label>
                  <button type="button" onClick={() => setShowPreview((v) => !v)} className="admin-toolbar__preview">
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>

                {showPreview ? (
                  <div
                    className="article-body admin-preview"
                    dangerouslySetInnerHTML={{ __html: previewHtml || '<p>Nothing to preview yet.</p>' }}
                  />
                ) : (
                  <textarea
                    ref={bodyRef}
                    className="admin-body"
                    placeholder="Write your article in Markdown. Use the toolbar above to format and insert images."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={20}
                  />
                )}
              </div>

              <div className="admin-editor__foot">
                <label className="admin-field admin-field--slug">
                  <span>URL slug (optional, auto-generated from title)</span>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto" />
                </label>
                <div className="admin-editor__footactions">
                  <button onClick={() => { setShowEditor(false); resetForm(); }} className="admin-ghost-btn">Cancel</button>
                  <button
                    onClick={handlePublish}
                    disabled={saving || uploading}
                    className="admin-primary-btn"
                  >
                    {saving ? 'Publishing…' : editingId ? 'Update article' : 'Publish article'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
