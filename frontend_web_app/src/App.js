import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { createClient } from '@supabase/supabase-js';
import './App.css';

/**
 * Supabase client (requires environment variables)
 * REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY must be set in .env
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '');

/**
 * Simple Google Maps loader using global script tag
 */
function useGoogleMaps(apiKey) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!apiKey) return;
    if (window.google && window.google.maps) {
      setLoaded(true);
      return;
    }
    const existing = document.getElementById('gmaps');
    if (existing) {
      existing.addEventListener('load', () => setLoaded(true));
      return;
    }
    const s = document.createElement('script');
    s.id = 'gmaps';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    s.async = true;
    s.defer = true;
    s.onload = () => setLoaded(true);
    document.body.appendChild(s);
  }, [apiKey]);
  return loaded;
}

/**
 * Mock data fallback if Supabase table is not available yet.
 * A real implementation would fetch from Supabase tables "cafes" and "plans".
 */
const MOCK_CAFES = [
  { id: 1, name: 'Azul Café', neighborhood: 'Chapinero', rating: 4.7, tags: ['work-friendly', 'specialty'], lat: 4.649, lng: -74.062, image: '', price: '$$' },
  { id: 2, name: 'Amber Beans', neighborhood: 'Zona G', rating: 4.5, tags: ['board-games', 'events'], lat: 4.652, lng: -74.058, image: '', price: '$$' },
  { id: 3, name: 'Gradiente', neighborhood: 'Usaquén', rating: 4.8, tags: ['cupping', 'reading-club'], lat: 4.702, lng: -74.035, image: '', price: '$$' },
  { id: 4, name: 'Brew Lab', neighborhood: 'La Candelaria', rating: 4.4, tags: ['specialty', 'events'], lat: 4.598, lng: -74.073, image: '', price: '$' },
];

/**
 * Search and filter helpers
 */
function useUrlFilters() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => queryString.parse(location.search), [location.search]);

  const setParams = useCallback((next) => {
    const merged = { ...params, ...next };
    // remove empty values
    Object.keys(merged).forEach(k => {
      if (merged[k] === '' || merged[k] === undefined || merged[k] === null) delete merged[k];
    });
    const str = queryString.stringify(merged, { arrayFormat: 'comma' });
    navigate({ search: str ? `?${str}` : '' }, { replace: true });
  }, [params, navigate]);

  return [params, setParams];
}

/**
 * Basic auth context lite using Supabase
 */
function useAuthSession() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);
  return session;
}

/**
 * PUBLIC_INTERFACE
 * Navbar with auth controls and navigation
 */
function NavBar() {
  const session = useAuthSession();
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    // PUBLIC_INTERFACE
    // Simple magic link sign-in with Supabase
    setLoading(true);
    try {
      const email = window.prompt('Ingresa tu email para login / registro:');
      if (!email) return;
      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: siteUrl }
      });
      if (error) alert(error.message);
      else alert('Revisa tu correo para el enlace de acceso.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="navbar">
      <Link to="/" className="brand" aria-label="Bogotá Cafés">
        <div className="brand-badge">☕</div>
        Bogotá Cafés & Plans
      </Link>
      <div className="nav-actions">
        <Link to="/explore" className="btn btn-ghost">Explorar</Link>
        <Link to="/dashboard" className="btn btn-ghost">Panel</Link>
        {session ? (
          <button className="btn btn-primary" onClick={signOut} disabled={loading}>{loading ? 'Saliendo...' : 'Salir'}</button>
        ) : (
          <button className="btn btn-primary" onClick={signIn} disabled={loading}>{loading ? 'Enviando...' : 'Ingresar'}</button>
        )}
      </div>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Explore page with filters + list + map synchronized
 */
function ExplorePage() {
  const [params, setParams] = useUrlFilters();
  const [items, setItems] = useState(MOCK_CAFES);
  const [activeId, setActiveId] = useState(null);

  const search = params.q || '';
  const neighborhood = params.nei || '';
  const price = params.price || '';
  const tags = (params.tags ? String(params.tags).split(',') : []);

  useEffect(() => {
    // Here you would load from Supabase, filtered by params.
    // We filter MOCK_CAFES locally as placeholder.
    let filtered = MOCK_CAFES;
    if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(String(search).toLowerCase()));
    if (neighborhood) filtered = filtered.filter(i => i.neighborhood === neighborhood);
    if (price) filtered = filtered.filter(i => i.price === price);
    if (tags.length) filtered = filtered.filter(i => tags.every(t => i.tags.includes(t)));
    setItems(filtered);
  }, [search, neighborhood, price, tags]);

  const onTagToggle = (tag) => {
    const exists = tags.includes(tag);
    const next = exists ? tags.filter(t => t !== tag) : [...tags, tag];
    setParams({ tags: next.length ? next : undefined });
  };

  return (
    <div className="content">
      <div className="panel">
        <div className="panel-header">
          <h3 className="section-title">Descubre cafés y planes</h3>
          <div className="help">Lista y mapa sincronizados en Bogotá</div>
        </div>
        <div className="filters">
          <div className="filter-row">
            <input
              className="input"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setParams({ q: e.target.value || undefined })}
              aria-label="Buscar por nombre"
            />
            <select
              className="select"
              value={neighborhood}
              onChange={(e) => setParams({ nei: e.target.value || undefined })}
              aria-label="Filtrar por barrio"
            >
              <option value="">Todos los barrios</option>
              <option>Chapinero</option>
              <option>Zona G</option>
              <option>Usaquén</option>
              <option>La Candelaria</option>
            </select>
          </div>
          <div className="filter-row">
            <select
              className="select"
              value={price}
              onChange={(e) => setParams({ price: e.target.value || undefined })}
              aria-label="Filtrar por precio"
            >
              <option value="">Todos los precios</option>
              <option>$</option>
              <option>$$</option>
              <option>$$$</option>
            </select>
            <div className="chip-group">
              <div className="chips">
                {['work-friendly', 'board-games', 'cupping', 'reading-club', 'specialty', 'events'].map(t => (
                  <button
                    key={t}
                    className={`chip ${tags.includes(t) ? 'active' : ''}`}
                    onClick={() => onTagToggle(t)}
                    aria-pressed={tags.includes(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="list" role="list">
          {items.map(cafe => (
            <article
              key={cafe.id}
              role="listitem"
              className="card"
              onMouseEnter={() => setActiveId(cafe.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <div>
                <div className="thumb" aria-hidden="true" />
              </div>
              <div>
                <div className="card-title">{cafe.name}</div>
                <div className="card-sub">{cafe.neighborhood} • {cafe.price} • ⭐ {cafe.rating}</div>
                <div className="badges">
                  {cafe.tags.map(t => <span key={t} className="badge">{t}</span>)}
                </div>
              </div>
            </article>
          ))}
          {items.length === 0 && <div className="help" style={{ padding: 12 }}>No se encontraron resultados, ajusta los filtros.</div>}
        </div>
      </div>

      <div className="panel map-wrap">
        <MapView items={items} activeId={activeId} />
      </div>

      <a href="#map" className="btn btn-primary fab" aria-label="Ver mapa">🗺️ Ver mapa</a>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Google Maps view with markers synchronized to list
 */
function MapView({ items, activeId }) {
  const loaded = useGoogleMaps(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''); // optional env
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersRef = React.useRef([]);

  useEffect(() => {
    if (!loaded || !ref.current) return;
    const center = { lat: 4.6486, lng: -74.0875 }; // Bogotá
    mapRef.current = new window.google.maps.Map(ref.current, {
      center,
      zoom: 12,
      mapId: 'ocean-professional-map'
    });
    return () => { mapRef.current = null; };
  }, [loaded]);

  useEffect(() => {
    if (!mapRef.current || !loaded) return;
    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    items.forEach(item => {
      const marker = new window.google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map: mapRef.current,
        title: item.name,
        icon: activeId === item.id ? {
          url: `https://maps.google.com/mapfiles/ms/icons/blue-dot.png`
        } : undefined
      });
      markersRef.current.push(marker);
    });
  }, [items, loaded, activeId]);

  return <div id="map" className="map-inner" ref={ref} aria-label="Mapa de Bogotá" />;
}

/**
 * PUBLIC_INTERFACE
 * Dashboard route with role-based sections
 * Role mapping could be stored in Supabase user metadata; here we mock it.
 */
function Dashboard() {
  const session = useAuthSession();
  // Mock role derivation: if email contains 'owner' -> cafe_owner, if 'admin' -> superadmin else user
  const role = useMemo(() => {
    const email = session?.user?.email || '';
    if (email.includes('admin')) return 'superadmin';
    if (email.includes('owner')) return 'cafe_owner';
    return 'user';
  }, [session]);

  return (
    <div className="dashboard">
      <div className="kpi"><h4>Cafés activos</h4><div className="value">128</div></div>
      <div className="kpi"><h4>Eventos esta semana</h4><div className="value">36</div></div>
      <div className="kpi"><h4>Reseñas nuevas</h4><div className="value">214</div></div>
      <div className="kpi"><h4>Usuarios</h4><div className="value">5.8k</div></div>

      {role === 'user' && (
        <div className="panel" style={{ gridColumn: 'span 12' }}>
          <div className="panel-header">
            <h3 className="section-title">Tu actividad</h3>
            <div className="help">Favoritos, reservas y recomendaciones</div>
          </div>
          <div style={{ padding: 14 }}>
            <p>Próximos eventos para ti en Chapinero y Zona G.</p>
          </div>
        </div>
      )}

      {role === 'cafe_owner' && (
        <div className="panel" style={{ gridColumn: 'span 12' }}>
          <div className="panel-header">
            <h3 className="section-title">Panel de Cafetería</h3>
            <div className="help">Gestiona tu perfil, eventos y promociones</div>
          </div>
          <div style={{ padding: 14, display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div className="panel" style={{ padding: 14 }}>
              <strong>Próximos eventos</strong>
              <ul>
                <li>Cata de orígenes — Vie 7pm</li>
                <li>Noches de juegos — Sáb 5pm</li>
              </ul>
            </div>
            <div className="panel" style={{ padding: 14 }}>
              <strong>Perfil del lugar</strong>
              <div className="help">Completa la info para mejorar tu visibilidad.</div>
              <button className="btn btn-primary" style={{ marginTop: 8 }}>Editar perfil</button>
            </div>
          </div>
        </div>
      )}

      {role === 'superadmin' && (
        <div className="panel" style={{ gridColumn: 'span 12' }}>
          <div className="panel-header">
            <h3 className="section-title">Administración</h3>
            <div className="help">Moderación, reportes y configuraciones</div>
          </div>
          <div style={{ padding: 14 }}>
            <ul>
              <li>Revisión de nuevos cafés y eventos</li>
              <li>Reportes de calidad de datos</li>
              <li>Gestión de usuarios y roles</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Auth landing (simple email/passwordless demo)
 */
function AuthPage() {
  return (
    <div className="auth-card">
      <h2 className="section-title">Iniciar sesión</h2>
      <p className="help">Usa el botón "Ingresar" en el encabezado para recibir un enlace mágico.</p>
      <div className="field">
        <label>Email</label>
        <input type="email" placeholder="tucorreo@ejemplo.com" disabled />
      </div>
      <button className="btn btn-primary" disabled>Enviar enlace</button>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Root app with routing
 */
function Shell() {
  return (
    <div className="app-shell">
      <NavBar />
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

export default App;
