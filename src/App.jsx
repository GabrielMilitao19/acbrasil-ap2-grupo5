import { useEffect, useMemo, useState } from 'react';
import logoUrl from '../IMG/logo-acb-fundo-escuro-1.png';
import { benefits, missionCards, navItems, services, teamMembers } from './data.js';

const API_BASE = 'https://acbrasil.org.br/cms/wp-json/wp/v2';
const MARKET_API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL';
const PER_PAGE = 5;

const extraRoutes = [
  {
    path: '/seja-membro',
    label: 'Área do Membro',
    title: 'Seja Membro - ACBrasil',
  },
];

const legacyPathMap = {
  'artigos.html': '/artigos',
  'contato.html': '/contato',
  'oqueFazemos.html': '/oque-fazemos',
  'quemsomos.html': '/quem-somos',
  'sejamembro.html': '/seja-membro',
};

const routeTitles = [...navItems, ...extraRoutes].reduce((acc, item) => {
  acc[item.path] = item.title;
  return acc;
}, {});

function toHash(path) {
  return path === '/' ? '#/' : `#${path}`;
}

function getCurrentRoute() {
  const rawHash = window.location.hash.replace('#', '');

  if (rawHash) {
    const normalizedHash = rawHash.startsWith('/') ? rawHash : `/${rawHash}`;
    const path = normalizedHash.replace(/\/$/, '') || '/';
    if (path.startsWith('/artigo/')) return '/artigo';
    return path;
  }

  const fileName = window.location.pathname.split('/').pop();
  return legacyPathMap[fileName] || '/';
}

function getCurrentArticleId() {
  const hash = window.location.hash.replace('#', '');
  const match = hash.match(/^\/artigo\/(\d+)/);
  return match ? match[1] : null;
}

function stripHtml(html = '') {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}...` : text;
}

function getFeaturedImageUrl(post) {
  try {
    const media = post._embedded?.['wp:featuredmedia']?.[0];
    if (!media) return null;

    const sizes = media.media_details?.sizes;
    if (sizes) {
      return (
        sizes.medium_large?.source_url ||
        sizes.medium?.source_url ||
        sizes.large?.source_url ||
        sizes.full?.source_url
      );
    }

    return media.source_url || null;
  } catch {
    return null;
  }
}

function getCategoryName(post) {
  try {
    const categories = post._embedded?.['wp:term']?.[0];
    return categories?.[0]?.name || '';
  } catch {
    return '';
  }
}

function App() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(getCurrentRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    document.title = routeTitles[route] || 'ACB - Associação de Conselheiros do Brasil';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  const Page = pageComponents[route] || NotFoundPage;

  return (
    <>
      <Navbar currentRoute={route} />
      <Page />
      <Footer />
    </>
  );
}

function Navbar({ currentRoute }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentRoute]);

  const allMobileItems = [...navItems, ...extraRoutes];

  return (
    <nav>
      <div className="logo-container">
        <a href="#/" aria-label="Ir para a página inicial">
          <img src={logoUrl} alt="ACB Logo" style={{ height: 40 }} />
        </a>
      </div>

      <button
        id="menu-button"
        type="button"
        aria-controls="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        &#9776;
      </button>

      <div className="nav-links">
        {navItems.map((item) => (
          <a
            key={item.path}
            href={toHash(item.path)}
            className={currentRoute === item.path ? 'active' : undefined}
          >
            {item.label}
          </a>
        ))}
      </div>

      <a
        href="#/seja-membro"
        className={`btn-desktop-membro btn-membro nav-member-link ${
          currentRoute === '/seja-membro' ? 'active' : ''
        }`}
      >
        Área do Membro
      </a>

      <div id="menu" className={isMenuOpen ? 'menu-open' : undefined}>
        <ul>
          {allMobileItems.map((item) => (
            <li key={item.path}>
              <a
                href={toHash(item.path)}
                className={currentRoute === item.path ? 'active' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Footer() {
  const socialLinks = [
    { label: 'WA', title: 'WhatsApp' },
    { label: 'IG', title: 'Instagram' },
    { label: 'in', title: 'LinkedIn' },
    { label: 'GH', title: 'GitHub' },
  ];

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={logoUrl} alt="ACB Logo" />
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Liderança e governança no cenário empresarial brasileiro.
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Associação sem fins lucrativos</p>
        </div>

        <div>
          <h4>Navegação</h4>
          <p style={{ fontSize: '0.9rem', marginTop: 10, lineHeight: 2.2 }}>
            {navItems.map((item) => (
              <span key={item.path}>
                <a href={toHash(item.path)}>{item.label}</a>
                <br />
              </span>
            ))}
          </p>
        </div>

        <div>
          <h4>Contato</h4>
          <p style={{ fontSize: '0.9rem', marginTop: 10, lineHeight: 2 }}>
            Email: contato@acbrasil.org
            <br />
            Telefone: (21) 0000-0000
          </p>
          <div className="footer-social">
            {socialLinks.map((item) => (
              <a
                key={item.title}
                href="#"
                title={item.title}
                aria-label={item.title}
                className="social-label"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Associação de Conselheiros do Brasil. Todos os direitos reservados.
      </div>
    </footer>
  );
}

function HomePage() {
  return (
    <>
      <header className="hero">
        <div className="hero-content">
          <h1>Fortalecendo o mercado de capitais brasileiros</h1>
          <a href="#/quem-somos" className="btn-cta">
            Conheça a ACB
          </a>
        </div>
      </header>

      <div className="slogan-bar">
        <p>
          Conectando conselheiros e lideranças para impulsionar as melhores práticas de
          governança e ética no cenário empresarial brasileiro.
        </p>
      </div>

      <section className="container">
        <h2 className="section-title" style={{ marginBottom: 5 }}>
          Panorama de Mercado
        </h2>
        <p style={{ color: '#666', marginBottom: 30 }}>
          Cotações em tempo real dos principais índices financeiros
        </p>
        <MarketData />
      </section>

      <section className="container">
        <h2 className="section-title">Últimos Artigos</h2>
        <HomeArticles />
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href="#/artigos" className="btn-show-more btn-link-button">
            Ver mais artigos
          </a>
        </div>
      </section>
    </>
  );
}

function MarketData() {
  const [marketState, setMarketState] = useState({
    status: 'loading',
    cards: [],
  });

  useEffect(() => {
    let ignore = false;

    async function loadMarketData() {
      try {
        const response = await fetch(MARKET_API_URL);
        if (!response.ok) throw new Error(`API retornou ${response.status}`);

        const data = await response.json();
        if (!data?.USDBRL) throw new Error('Dados da API vieram inválidos.');

        if (!ignore) {
          setMarketState({
            status: 'success',
            cards: buildMarketCards(data),
          });
        }
      } catch (error) {
        console.error('Erro ao carregar a API da Bolsa:', error);
        if (!ignore) {
          setMarketState({
            status: 'error',
            cards: [],
          });
        }
      }
    }

    loadMarketData();
    return () => {
      ignore = true;
    };
  }, []);

  if (marketState.status === 'loading') {
    return (
      <div className="market-cards-container">
        <p>Carregando dados do mercado...</p>
      </div>
    );
  }

  if (marketState.status === 'error') {
    return (
      <div className="market-cards-container">
        <p className="market-error">
          Erro ao carregar dados de mercado. Verifique sua conexão ou limite de acessos.
        </p>
      </div>
    );
  }

  return (
    <div className="market-cards-container">
      {marketState.cards.map((card) => (
        <MarketCard key={card.title} card={card} />
      ))}
    </div>
  );
}

function buildMarketCards(data) {
  const usd = data?.USDBRL;
  const eur = data?.EURBRL;
  const btc = data?.BTCBRL;

  const fmt = (v) => {
    const n = Number(v ?? 0);
    return isNaN(n) ? 0 : Math.round(n * 100) / 100;
  };

  return [
    {
      title: 'Dólar (Comercial)',
      badge: 'USD',
      value:
        usd?.bid != null ? (
          <>
            <span className="market-card-unit">R$</span>{' '}
            {Number(usd.bid).toFixed(2).replace('.', ',')}
          </>
        ) : (
          'Indisponível'
        ),
      variation: fmt(usd?.pctChange),
    },
    {
      title: 'Euro',
      badge: 'EUR',
      value:
        eur?.bid != null ? (
          <>
            <span className="market-card-unit">R$</span>{' '}
            {Number(eur.bid).toFixed(2).replace('.', ',')}
          </>
        ) : (
          'Indisponível'
        ),
      variation: fmt(eur?.pctChange),
    },
    {
      title: 'Bitcoin',
      badge: 'BTC',
      value:
        btc?.bid != null ? (
          <>
            <span className="market-card-unit">R$</span>{' '}
            {Number(btc.bid).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </>
        ) : (
          'Indisponível'
        ),
      variation: fmt(btc?.pctChange),
    },
  ];
}

function MarketCard({ card }) {
  const variation = Number(card.variation || 0);
  const isPositive = variation >= 0;

  return (
    <article className="market-card">
      <div className="market-card-title">
        {card.title} <span>{card.badge}</span>
      </div>
      <div className="market-card-value">{card.value}</div>
      <div className={`market-card-variation ${isPositive ? 'text-up' : 'text-down'}`}>
        {isPositive ? '▲' : '▼'} {variation > 0 ? '+' : ''}
        {variation.toFixed(2)}%
      </div>
    </article>
  );
}

function HomeArticles() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      try {
        const response = await fetch(`${API_BASE}/posts?per_page=10&_embed&orderby=date&order=desc`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (!ignore) {
          setPosts(data);
          setStatus(data.length ? 'success' : 'empty');
        }
      } catch (error) {
        console.error('Erro ao carregar artigos:', error);
        if (!ignore) setStatus('error');
      }
    }

    loadPosts();
    return () => {
      ignore = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="articles-grid articles-status">
        <p>Carregando artigos...</p>
      </div>
    );
  }

  if (status === 'empty') {
    return <div className="articles-message">Nenhum artigo encontrado.</div>;
  }

  if (status === 'error') {
    return (
      <div className="articles-message">
        Não foi possível carregar os artigos. Tente novamente mais tarde.
      </div>
    );
  }

  return (
    <div className="articles-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }) {
  const title = stripHtml(post.title?.rendered || 'Sem título');
  const imageUrl = getFeaturedImageUrl(post);

  return (
    <article className="card">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="card-image-placeholder">Sem imagem</div>
      )}
      <div className="card-body">
        <h3>{title}</h3>
        <a href={`#/artigo/${post.id}`} className="btn-more article-button-link">
          Ler mais
        </a>
      </div>
    </article>
  );
}

function ArticlesPage() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  useEffect(() => {
    let ignore = false;

    async function loadPosts() {
      try {
        const response = await fetch(`${API_BASE}/posts?per_page=100&_embed&orderby=date&order=desc`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (!ignore) {
          setPosts(data);
          setStatus(data.length ? 'success' : 'empty');
        }
      } catch (error) {
        console.error('Erro ao carregar artigos:', error);
        if (!ignore) setStatus('error');
      }
    }

    loadPosts();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(PER_PAGE);
  }, [activeCategoryId, searchQuery]);

  const categories = useMemo(() => {
    const map = new Map();

    posts.forEach((post) => {
      const postCategories = post._embedded?.['wp:term']?.[0] || [];
      postCategories.forEach((category) => map.set(String(category.id), category.name));
    });

    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      if (activeCategoryId) {
        const postCategories = post._embedded?.['wp:term']?.[0] || [];
        const hasCategory = postCategories.some((category) => String(category.id) === activeCategoryId);
        if (!hasCategory) return false;
      }

      if (query) {
        const title = stripHtml(post.title?.rendered || '').toLowerCase();
        const excerpt = stripHtml(post.excerpt?.rendered || '').toLowerCase();
        return title.includes(query) || excerpt.includes(query);
      }

      return true;
    });
  }, [activeCategoryId, posts, searchQuery]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  return (
    <>
      <div className="articles-page-header">
        <div className="articles-header-top">
          <h2>Artigos</h2>
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              placeholder="Buscar"
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="filters-row">
          <div className="filters" id="category-filters">
            <span
              className={!activeCategoryId ? 'active' : undefined}
              role="button"
              tabIndex="0"
              onClick={() => setActiveCategoryId('')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setActiveCategoryId('');
              }}
            >
              Todos
            </span>
            {categories.map((category) => (
              <span
                key={category.id}
                className={activeCategoryId === category.id ? 'active' : undefined}
                role="button"
                tabIndex="0"
                onClick={() => setActiveCategoryId(category.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setActiveCategoryId(category.id);
                }}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {status === 'success' && posts[0] && <FeaturedArticle post={posts[0]} />}

      <main className="articles-list">
        {status === 'loading' && <p className="articles-inline-message">Carregando artigos...</p>}
        {status === 'error' && (
          <p className="articles-inline-message">Não foi possível carregar os artigos.</p>
        )}
        {status === 'empty' && <p className="articles-inline-message">Nenhum artigo encontrado.</p>}
        {status === 'success' && filteredPosts.length === 0 && (
          <p className="articles-inline-message">Nenhum artigo encontrado.</p>
        )}
        {status === 'success' &&
          visiblePosts.map((post) => <ArticleItem key={post.id} post={post} />)}
      </main>

      {status === 'success' && visibleCount < filteredPosts.length && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <button
            type="button"
            className="btn-show-more"
            onClick={() => setVisibleCount((count) => count + PER_PAGE)}
          >
            MOSTRAR MAIS
          </button>
        </div>
      )}
    </>
  );
}

function FeaturedArticle({ post }) {
  const imageUrl = getFeaturedImageUrl(post);
  const title = stripHtml(post.title?.rendered || '');
  const excerpt = truncate(stripHtml(post.excerpt?.rendered || post.content?.rendered || ''), 200);

  return (
    <section className="featured-article">
      <div className="featured-content">
        <span className="category">{getCategoryName(post)}</span>
        <h3>{title}</h3>
        <p>{excerpt}</p>
        <br />
        <a href={`#/artigo/${post.id}`} className="read-more-link">
          Leia o artigo completo &gt;
        </a>
      </div>
      <div
        className="featured-image"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : { backgroundColor: '#ccc' }}
      />
    </section>
  );
}

function ArticleItem({ post }) {
  const imageUrl = getFeaturedImageUrl(post);
  const title = stripHtml(post.title?.rendered || 'Sem título');
  const excerpt = truncate(stripHtml(post.excerpt?.rendered || post.content?.rendered || ''), 160);

  return (
    <article className="article-item">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="article-image-placeholder">Sem imagem</div>
      )}
      <div className="article-info">
        <span className="category">{getCategoryName(post)}</span>
        <h4>{title}</h4>
        <p>{excerpt}</p>
        <a href={`#/artigo/${post.id}`} className="read-more-link">
          Leia o artigo completo &gt;
        </a>
      </div>
    </article>
  );
}

function ArticleDetailPage() {
  const [postId, setPostId] = useState(() => getCurrentArticleId());
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const handleHashChange = () => {
      const newId = getCurrentArticleId();
      if (newId !== postId) {
        setPostId(newId);
        setStatus('loading');
        setPost(null);
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [postId]);

  useEffect(() => {
    if (!postId) { setStatus('error'); return; }
    let ignore = false;

    async function loadPost() {
      try {
        const response = await fetch(`${API_BASE}/posts/${postId}?_embed`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!ignore) {
          setPost(data);
          setStatus('success');
          document.title = `${stripHtml(data.title?.rendered || 'Artigo')} - ACBrasil`;
        }
      } catch {
        if (!ignore) setStatus('error');
      }
    }

    loadPost();
    return () => { ignore = true; };
  }, [postId]);

  if (status === 'loading') {
    return (
      <main className="container" style={{ minHeight: '50vh', paddingTop: '4rem' }}>
        <p style={{ color: '#666' }}>Carregando artigo...</p>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="container" style={{ minHeight: '50vh', paddingTop: '4rem' }}>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Artigo não encontrado.</p>
        <a href="#/artigos" className="btn-show-more btn-link-button">← Voltar para Artigos</a>
      </main>
    );
  }

  const title = stripHtml(post.title?.rendered || '');
  const content = post.content?.rendered || '';
  const imageUrl = getFeaturedImageUrl(post);
  const category = getCategoryName(post);
  const date = post.date
    ? new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <main className="article-detail">
      {imageUrl && (
        <div className="article-detail-hero" style={{ backgroundImage: `url(${imageUrl})` }} />
      )}
      <div className="container article-detail-body">
        <a href="#/artigos" className="article-back-link">← Voltar para Artigos</a>
        {category && <span className="article-detail-category">{category}</span>}
        <h1 className="article-detail-title">{title}</h1>
        {date && <p className="article-detail-date">{date}</p>}
        <div
          className="article-detail-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="#/artigos" className="btn-show-more btn-link-button">← Voltar para Artigos</a>
        </div>
      </div>
    </main>
  );
}

function WhatWeDoPage() {
  return (
    <>
      <section className="page-hero">
        <h1>O que fazemos</h1>
        <p>Capacitando, conectando e apoiando conselheiros para fortalecer a governança corporativa no Brasil.</p>
      </section>

      <section className="services-grid">
        {services.map((service) => (
          <article className="service-card" key={service.title}>
            <div className="service-card-img" style={{ backgroundImage: `url(${service.image})` }} />
            <div className="service-card-body">
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="cta-section">
        <h2>Quer fazer parte da ACBrasil?</h2>
        <p>Junte-se à maior rede de conselheiros do Brasil e acelere sua carreira.</p>
        <a href="#/seja-membro" className="btn-cta">
          Quero ser membro
        </a>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <section className="quem-hero">
        <h1>Quem Somos</h1>
        <p>Uma comunidade dedicada a conectar, capacitar e inspirar conselheiros e líderes do mercado brasileiro.</p>
      </section>

      <section className="missao-section">
        {missionCards.map((card) => (
          <article className="missao-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="team-section container">
        <h2 className="section-title">Nossa Equipe</h2>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <article className="team-card" key={member.name}>
              <Avatar name={member.name} />
              <h4>{member.name}</h4>
              <p>{member.role}</p>
              {member.linkedin && member.linkedin !== '#' && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  Linkedin
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Faça parte da ACBrasil</h2>
        <p>Junte-se à nossa comunidade e fortaleça sua atuação como conselheiro.</p>
        <a href="#/seja-membro" className="btn-cta">
          Quero ser membro
        </a>
      </section>
    </>
  );
}

function Avatar({ name }) {
  const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=002B5B&color=f4b41a&size=128&bold=true&font-size=0.38`;
  return (
    <div className="team-avatar">
      <img src={url} alt={name} />
    </div>
  );
}

function ContactPage() {
  function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const fields = ['nome', 'email', 'assunto', 'mensagem'];
    const hasEmptyField = fields.some((field) => !String(data.get(field) || '').trim());

    if (hasEmptyField) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    form.reset();
  }

  return (
    <>
      <section className="contact-header">
        <h1>Entre em contato com a ACB</h1>
        <p>
          Utilize o formulário abaixo para os nossos canais diretos.
          <br />
          Responderemos o mais breve possível
        </p>
      </section>

      <main className="contact-main">
        <div className="contact-form-container">
          <form className="contact-form-grid" onSubmit={handleSubmit}>
            <div className="contact-form-group">
              <label htmlFor="nome">Nome Completo</label>
              <input type="text" id="nome" name="nome" required />
            </div>

            <div className="contact-form-group">
              <label htmlFor="email">Seu E-mail</label>
              <input type="email" id="email" name="email" required />
            </div>

            <div className="contact-form-group">
              <label htmlFor="assunto">Assunto</label>
              <input type="text" id="assunto" name="assunto" required />
            </div>

            <div className="contact-form-group">
              <label htmlFor="mensagem">Sua mensagem ( máx. 500 caracteres )</label>
              <textarea id="mensagem" name="mensagem" maxLength="500" rows="5" required />
            </div>

            <button type="submit" className="btn-contact-submit">
              ENVIAR
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

function MemberPage() {
  function handleSubmit(event) {
    event.preventDefault();
    alert('Cadastro recebido com sucesso! Entraremos em contato em breve.');
    event.currentTarget.reset();
  }

  return (
    <>
      <header className="membership-header">
        <h1>SEJA MEMBRO ACBRASIL: Acelere sua carreira e conecte-se com líderes</h1>
        <p>A maior comunidade de Conselheiros e Profissionais do mercado financeiro e gestão do Brasil</p>
      </header>

      <section className="benefits-row">
        {benefits.map((benefit) => (
          <article className="benefit-item" key={benefit.title}>
            <h4>{benefit.title}</h4>
            <p>• {benefit.text}</p>
          </article>
        ))}
      </section>

      <main className="container">
        <div className="form-container">
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="member-nome">Nome</label>
              <input type="text" id="member-nome" name="nome" required />
            </div>
            <div className="form-group">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input type="text" id="sobrenome" name="sobrenome" required />
            </div>
            <div className="form-group">
              <label htmlFor="member-email">E-mail profissional</label>
              <input type="email" id="member-email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="telefone">Telefone com DDD</label>
              <input type="tel" id="telefone" name="telefone" required />
            </div>
            <div className="form-group">
              <label htmlFor="empresa">Empresa / Instituição</label>
              <input type="text" id="empresa" name="empresa" required />
            </div>
            <div className="form-group">
              <label htmlFor="cargo">Cargo atual</label>
              <input type="text" id="cargo" name="cargo" required />
            </div>
            <div className="form-group">
              <label htmlFor="linkedin">Linkedin (opcional)</label>
              <input type="url" id="linkedin" name="linkedin" />
            </div>
            <div className="form-group">
              <label htmlFor="cidade">Cidade</label>
              <input type="text" id="cidade" name="cidade" required />
            </div>

            <div className="checkbox-group">
              <input type="checkbox" id="terms" name="terms" required />
              <label htmlFor="terms">Concordo com os termos e políticas de privacidade</label>
            </div>

            <button type="submit" className="btn-submit">
              Quero ser membro
            </button>

            <div className="form-footer-link">
              <a href="#/contato">Alguma dúvida? Entre em contato</a>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

function NotFoundPage() {
  return (
    <main className="container not-found-page">
      <h1 className="section-title">Página não encontrada</h1>
      <p>O endereço acessado não existe nesta versão React do site.</p>
      <a href="#/" className="btn-cta">
        Voltar para o início
      </a>
    </main>
  );
}

const pageComponents = {
  '/': HomePage,
  '/artigo': ArticleDetailPage,
  '/artigos': ArticlesPage,
  '/contato': ContactPage,
  '/oque-fazemos': WhatWeDoPage,
  '/quem-somos': AboutPage,
  '/seja-membro': MemberPage,
};

export default App;
