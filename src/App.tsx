import { useState, useRef, useEffect } from 'react'

const CHAR_LIMIT = 280

interface Post {
  id: string
  author: string
  handle: string
  avatar: string
  content: string
  timestamp: string
  likes: number
  reposts: number
  replies: number
  liked: boolean
  reposted: boolean
  tags: string[]
}

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Margot Sinclair',
    handle: 'msinclair',
    avatar: 'MS',
    content: 'The most underrated skill in writing is knowing what to cut. A sentence that almost works is worse than no sentence at all. Kill your darlings — not reluctantly, but with conviction. #writing #craft',
    timestamp: '2m',
    likes: 847,
    reposts: 203,
    replies: 41,
    liked: false,
    reposted: false,
    tags: ['writing', 'craft'],
  },
  {
    id: '2',
    author: 'Dev Kapoor',
    handle: 'devkapoor',
    avatar: 'DK',
    content: 'Hot take: most "productivity systems" are elaborate procrastination dressed up as discipline. The people I know who get the most done don\'t have systems. They just start. #productivity',
    timestamp: '8m',
    likes: 1204,
    reposts: 519,
    replies: 87,
    liked: true,
    reposted: false,
    tags: ['productivity'],
  },
  {
    id: '3',
    author: 'Lena Brandt',
    handle: 'lenabrandt',
    avatar: 'LB',
    content: 'Just published my piece on how small city newspapers are being replaced by hyperlocal newsletters run by one person with a Substack account and an obsessive knowledge of municipal zoning. The future of local journalism might actually be weirder and better than we think. #journalism #localnews',
    timestamp: '23m',
    likes: 392,
    reposts: 88,
    replies: 29,
    liked: false,
    reposted: false,
    tags: ['journalism', 'localnews'],
  },
  {
    id: '4',
    author: 'Teo Vasquez',
    handle: 'teovasquez',
    avatar: 'TV',
    content: 'There\'s a specific kind of loneliness that comes from being in a room full of people who are all looking at their phones. We\'ve normalized it so completely we don\'t even name it anymore. #culture #attention',
    timestamp: '41m',
    likes: 2817,
    reposts: 944,
    replies: 156,
    liked: false,
    reposted: false,
    tags: ['culture', 'attention'],
  },
  {
    id: '5',
    author: 'Priya Nair',
    handle: 'priya_nair',
    avatar: 'PN',
    content: 'Reminder that "move fast and break things" was always a power move by people who knew they wouldn\'t be the ones cleaning up. #tech #accountability',
    timestamp: '1h',
    likes: 4102,
    reposts: 1653,
    replies: 212,
    liked: false,
    reposted: false,
    tags: ['tech', 'accountability'],
  },
]

const TRENDING = [
  { tag: 'writing', posts: '24.3K', hot: true },
  { tag: 'productivity', posts: '18.1K', hot: true },
  { tag: 'journalism', posts: '11.9K', hot: false },
  { tag: 'tech', posts: '9.4K', hot: false },
  { tag: 'culture', posts: '8.2K', hot: false },
  { tag: 'climate', posts: '6.7K', hot: false },
  { tag: 'design', posts: '5.3K', hot: false },
  { tag: 'philosophy', posts: '4.1K', hot: false },
]

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

function AvatarCircle({ initials, accent }: { initials: string; accent?: boolean }) {
  const colors: Record<string, string> = {
    MS: '#7c5cfc', DK: '#28c98a', LB: '#e8b84b', TV: '#f04060', PN: '#3cacf0',
  }
  const bg = colors[initials] || '#7c5cfc'
  return (
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: accent ? bg : bg + '22',
        border: `1.5px solid ${bg}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 500,
        color: accent ? '#fff' : bg,
        flexShrink: 0,
        letterSpacing: '0.04em',
      }}
    >
      {initials}
    </div>
  )
}

function CharRing({ count, limit }: { count: number; limit: number }) {
  const remaining = limit - count
  const pct = count / limit
  const r = 14
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const danger = remaining <= 20
  const warn = remaining <= 60

  return (
    <div style={{ position: 'relative', width: 36, height: 36 }}>
      <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#2a2a31" strokeWidth="2.5" />
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke={danger ? '#f04060' : warn ? '#e8b84b' : '#7c5cfc'}
          strokeWidth="2.5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.15s ease, stroke 0.2s ease' }}
        />
      </svg>
      {danger && (
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9,
          fontWeight: 500, color: '#f04060',
        }}>
          {remaining}
        </span>
      )}
    </div>
  )
}

function PostCard({ post, onLike, onRepost }: { post: Post; onLike: () => void; onRepost: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid #2a2a31',
        background: hovered ? '#161619' : 'transparent',
        transition: 'background 0.15s ease',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', gap: 13 }}>
        <AvatarCircle initials={post.avatar} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: '#e8e8f0', fontSize: 14 }}>{post.author}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#52525e' }}>@{post.handle}</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#52525e' }}>{post.timestamp}</span>
          </div>
          <p style={{
            margin: '0 0 12px',
            fontSize: 14.5,
            lineHeight: 1.65,
            color: '#d8d8e8',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {post.content.split(/(#\w+)/g).map((part, i) =>
              part.startsWith('#') ? (
                <span key={i} style={{ color: '#7c5cfc', cursor: 'pointer' }}>{part}</span>
              ) : part
            )}
          </p>
          <div style={{ display: 'flex', gap: 28 }}>
            <button onClick={onLike} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: post.liked ? '#f04060' : '#52525e',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              transition: 'color 0.15s ease',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {formatCount(post.likes)}
            </button>
            <button onClick={onRepost} style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: post.reposted ? '#28c98a' : '#52525e',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              transition: 'color 0.15s ease',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              {formatCount(post.reposts)}
            </button>
            <button style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#52525e', fontFamily: 'var(--font-mono)', fontSize: 12,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {formatCount(post.replies)}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

const TABS = ['For You', 'Following', 'Topics'] as const
type Tab = typeof TABS[number]

export default function App() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS)
  const [draft, setDraft] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('For You')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const remaining = CHAR_LIMIT - draft.length
  const overLimit = remaining < 0

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto'
      textRef.current.style.height = textRef.current.scrollHeight + 'px'
    }
  }, [draft])

  function handlePost() {
    if (!draft.trim() || overLimit) return
    const tags = [...draft.matchAll(/#(\w+)/g)].map(m => m[1])
    const newPost: Post = {
      id: Date.now().toString(),
      author: 'You',
      handle: 'you',
      avatar: 'YO',
      content: draft.trim(),
      timestamp: 'now',
      likes: 0,
      reposts: 0,
      replies: 0,
      liked: false,
      reposted: false,
      tags,
    }
    setPosts(prev => [newPost, ...prev])
    setDraft('')
  }

  function toggleLike(id: string) {
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
    ))
  }

  function toggleRepost(id: string) {
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, reposted: !p.reposted, reposts: p.reposted ? p.reposts - 1 : p.reposts + 1 }
      : p
    ))
  }

  const visiblePosts = filterTag
    ? posts.filter(p => p.tags.includes(filterTag))
    : posts

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-ground)' }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid #2a2a31',
        background: '#0e0e11ee',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
            fontStyle: 'italic', color: '#e8e8f0', letterSpacing: '-0.02em',
          }}>Pulse</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7c5cfc', letterSpacing: '0.1em', textTransform: 'uppercase' }}>280</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#52525e' }}>@you</span>
          <AvatarCircle initials="YO" accent />
        </div>
      </header>

      <div style={{
        maxWidth: 1080, margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 0,
        minHeight: 'calc(100vh - 56px)',
      }}>
        {/* Main column */}
        <main style={{ borderRight: '1px solid #2a2a31' }}>
          {/* Composer */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #2a2a31',
          }}>
            <div style={{ display: 'flex', gap: 13 }}>
              <AvatarCircle initials="YO" accent />
              <div style={{ flex: 1 }}>
                <textarea
                  ref={textRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="What's worth saying in 280 characters?"
                  style={{
                    width: '100%', background: 'none', border: 'none', outline: 'none',
                    color: '#e8e8f0', fontSize: 15, lineHeight: 1.6, resize: 'none',
                    fontFamily: 'var(--font-body)', minHeight: 60, overflow: 'hidden',
                    caretColor: '#7c5cfc',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#52525e' }}>
                    {draft.length > 0 && (
                      <span style={{ color: overLimit ? '#f04060' : '#52525e' }}>
                        {overLimit ? `${Math.abs(remaining)} over` : `${remaining} left`}
                      </span>
                    )}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {draft.length > 0 && <CharRing count={draft.length} limit={CHAR_LIMIT} />}
                    <button
                      onClick={handlePost}
                      disabled={!draft.trim() || overLimit}
                      style={{
                        background: !draft.trim() || overLimit ? '#2a2a31' : '#7c5cfc',
                        color: !draft.trim() || overLimit ? '#52525e' : '#fff',
                        border: 'none', borderRadius: 20, padding: '8px 20px',
                        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                        cursor: !draft.trim() || overLimit ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s ease, color 0.2s ease',
                        letterSpacing: '0.01em',
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1px solid #2a2a31',
            position: 'sticky', top: 56, zIndex: 40,
            background: '#0e0e11ee', backdropFilter: 'blur(12px)',
          }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setFilterTag(null) }}
                style={{
                  flex: 1, padding: '14px 0', background: 'none', border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #7c5cfc' : '2px solid transparent',
                  color: activeTab === tab ? '#e8e8f0' : '#52525e',
                  fontFamily: 'var(--font-body)', fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
                  letterSpacing: '0.01em',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Filter pill */}
          {filterTag && (
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #2a2a31', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#52525e' }}>Filtering by</span>
              <span style={{
                background: '#7c5cfc22', color: '#7c5cfc', border: '1px solid #7c5cfc44',
                borderRadius: 12, padding: '2px 10px', fontFamily: 'var(--font-mono)', fontSize: 11,
              }}>#{filterTag}</span>
              <button onClick={() => setFilterTag(null)} style={{
                background: 'none', border: 'none', color: '#52525e', cursor: 'pointer',
                fontFamily: 'var(--font-mono)', fontSize: 11, padding: 0, marginLeft: 4,
              }}>✕ clear</button>
            </div>
          )}

          {/* Feed */}
          <div>
            {visiblePosts.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: '#52525e', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                No posts for #{filterTag}
              </div>
            ) : (
              visiblePosts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => toggleLike(post.id)}
                  onRepost={() => toggleRepost(post.id)}
                />
              ))
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside style={{ padding: '24px 20px' }}>
          {/* Trending */}
          <div style={{
            background: '#161619', border: '1px solid #2a2a31',
            borderRadius: 12, overflow: 'hidden', marginBottom: 20,
          }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #2a2a31' }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
                fontStyle: 'italic', color: '#e8e8f0',
              }}>Trending</span>
            </div>
            {TRENDING.map((item, i) => (
              <button
                key={item.tag}
                onClick={() => { setFilterTag(item.tag); setActiveTab('Topics') }}
                style={{
                  width: '100%', padding: '12px 18px', background: 'none', border: 'none',
                  borderBottom: i < TRENDING.length - 1 ? '1px solid #2a2a31' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e1e23')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#7c5cfc', fontFamily: 'var(--font-mono)', fontSize: 13 }}>#{item.tag}</span>
                    {item.hot && (
                      <span style={{
                        background: '#f0406022', color: '#f04060', border: '1px solid #f0406033',
                        borderRadius: 4, padding: '0px 5px', fontFamily: 'var(--font-mono)',
                        fontSize: 9, letterSpacing: '0.06em',
                      }}>HOT</span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#52525e', marginTop: 2 }}>
                    {item.posts} posts
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2a2a31" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>

          {/* Char limit explainer */}
          <div style={{
            background: '#7c5cfc0e', border: '1px solid #7c5cfc33',
            borderRadius: 12, padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: '#7c5cfc22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c5cfc" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: '#a080f8' }}>The 280 Rule</span>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: '#8888a0', lineHeight: 1.6 }}>
              Every post is capped at 280 characters. Constraint breeds clarity. Say exactly what you mean — nothing more.
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              {[100, 200, 280].map(n => (
                <div key={n} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: '#7c5cfc' }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#52525e', letterSpacing: '0.06em' }}>
                    {n === 100 ? 'WARM UP' : n === 200 ? 'SWEET SPOT' : 'LIMIT'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
