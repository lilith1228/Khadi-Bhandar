import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api';
import ProductCard from '../components/ProductCard';

const SORTS = [
  { v: 'relevance',  l: '🌟 Relevance'       },
  { v: 'newest',     l: '🆕 Newest First'     },
  { v: 'price_asc',  l: '💰 Price: Low→High'  },
  { v: 'price_desc', l: '💰 Price: High→Low'  },
  { v: 'rating',     l: '⭐ Top Rated'        },
];

const PRICE_RANGES = [
  { label: 'All Prices',    min: null, max: null },
  { label: 'Under ₹500',   min: null, max: 500   },
  { label: '₹500 - ₹1000', min: 500,  max: 1000  },
  { label: '₹1000 - ₹2000',min: 1000, max: 2000  },
  { label: 'Above ₹2000',  min: 2000, max: null  },
];

const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Kurtas', 'Sarees', 'Fabrics', 'Home Decor', 'Accessories'];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [allProducts, setAllProducts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showFilters, setShowFilters]   = useState(window.innerWidth > 768);
  const navigate = useNavigate();

  const q          = searchParams.get('q')        || '';
  const cat        = searchParams.get('category') || '';
  const sort       = searchParams.get('sort')     || 'relevance';
  const priceRange = Number(searchParams.get('price') || 0);

  // Fetch ALL products once — used for correct sidebar counts
  // Replace existing allProducts useEffect with this:
useEffect(() => {
  API.get('/api/products').then(r => setAllProducts(r.data)).catch(() => {});
}, [cat, q]); // refetch when filters change so counts stay accurate

  // Fetch filtered products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q)   params.set('search', q);
      if (cat && cat !== 'All') params.set('category', cat);
      if (sort && sort !== 'relevance') params.set('sort', sort);
      const range = PRICE_RANGES[priceRange];
      if (range?.min) params.set('minPrice', range.min);
      if (range?.max) params.set('maxPrice', range.max);
      const { data } = await API.get(`/api/products?${params}`);
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
      setProducts([]);
    }
    setLoading(false);
  }, [q, cat, sort, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val);
    else     p.delete(key);
    setSearchParams(p);
  };

  const clearAll = () => setSearchParams({});

  // ── Correct count — check BOTH category and categories fields ──
  const getCatCount = (catName) => {
    if (!allProducts.length) return 0;
    if (catName === 'All') return allProducts.length;
    return allProducts.filter(p => {
      const primaryMatch = p.category
        && p.category.trim().toLowerCase() === catName.trim().toLowerCase();
      const arrayMatch = Array.isArray(p.categories)
        && p.categories.some(c => c.trim().toLowerCase() === catName.trim().toLowerCase());
      return primaryMatch || arrayMatch;
    }).length;
  };

  const activeFilters = [
    ...(cat          ? [{ label: cat,                        key: 'category' }] : []),
    ...(q            ? [{ label: `"${q}"`,                   key: 'q'        }] : []),
    ...(priceRange>0 ? [{ label: PRICE_RANGES[priceRange]?.label, key: 'price' }] : []),
  ];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .cat-row:hover  { background: #fce4ec !important; color: #e91e63 !important; }
        .price-row:hover{ background: #fce4ec !important; color: #e91e63 !important; }
        @media(max-width:768px){
          .sr-layout  { flex-direction: column !important; }
          .sr-sidebar { width: 100% !important; }
          .sr-grid    { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 12px' }}>

        {/* ── TOP BAR ── */}
        <div style={S.topBar}>
          <div style={{ flex: 1 }}>
            <h2 style={S.heading}>
              {cat || (q ? `Results for "${q}"` : 'All Products')}
              <span style={{ fontSize: 14, color: '#9e9e9e', fontWeight: 'normal', marginLeft: 8 }}>
                ({products.length} items)
              </span>
            </h2>

            {/* Active filter tags */}
            {activeFilters.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#888' }}>Active:</span>
                {activeFilters.map(f => (
                  <span key={f.key} style={S.activeTag}>
                    🏷 {f.label}
                    <span style={{ marginLeft: 6, cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => setFilter(f.key, '')}>✕</span>
                  </span>
                ))}
                <button onClick={clearAll} style={S.clearBtn}>Clear All</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
            <select value={sort} onChange={e => setFilter('sort', e.target.value)} style={S.sortSelect}>
              {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
            <button onClick={() => setShowFilters(f => !f)} style={S.filterToggleBtn}>
              {showFilters ? '✕ Hide Filters' : '☰ Show Filters'}
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }} className="sr-layout">

          {/* Sidebar */}
          {showFilters && (
            <div style={S.sidebar} className="sr-sidebar">

              {/* CATEGORIES */}
              <div style={S.filterBlock}>
                <div style={S.filterHead}>🏷 CATEGORIES</div>
                {CATEGORIES.map(c => {
                  const count    = getCatCount(c);
                  const isActive = c === 'All' ? !cat : cat === c;
                  return (
                    <div
                      key={c}
                      className="cat-row"
                      onClick={() => setFilter('category', c === 'All' ? '' : c)}
                      style={{
                        ...S.filterRow,
                        background:  isActive ? '#fce4ec' : 'transparent',
                        color:       isActive ? '#e91e63' : '#333',
                        fontWeight:  isActive ? 'bold'   : 'normal',
                        borderLeft:  isActive ? '3px solid #e91e63' : '3px solid transparent',
                      }}
                    >
                      <span>{c}</span>
                      {/* Show count badge — only if count > 0 */}
                      {count > 0 && (
                        <span style={{
                          ...S.countBadge,
                          background: isActive ? '#e91e63' : '#eeeeee',
                          color:      isActive ? '#fff'    : '#555',
                        }}>
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PRICE RANGE */}
              <div style={S.filterBlock}>
                <div style={S.filterHead}>💰 PRICE RANGE</div>
                {PRICE_RANGES.map((r, i) => {
                  const isActive = priceRange === i;
                  return (
                    <div
                      key={r.label}
                      className="price-row"
                      onClick={() => setFilter('price', i === 0 ? '' : String(i))}
                      style={{
                        ...S.filterRow,
                        background:  isActive ? '#fce4ec' : 'transparent',
                        color:       isActive ? '#e91e63' : '#333',
                        fontWeight:  isActive ? 'bold'   : 'normal',
                        borderLeft:  isActive ? '3px solid #e91e63' : '3px solid transparent',
                      }}
                    >
                      {r.label}
                    </div>
                  );
                })}
              </div>

              {/* Clear button */}
              {activeFilters.length > 0 && (
                <div style={{ padding: '12px 16px' }}>
                  <button onClick={clearAll} style={S.clearAllBtn}>✕ Clear All Filters</button>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS GRID ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Result info */}
            <div style={{ fontSize: 13, color: '#888', marginBottom: 12, background: '#fff', padding: '10px 14px', borderRadius: 6 }}>
              Showing <strong style={{ color: '#212121' }}>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
              {cat ? <> in <strong style={{ color: '#e91e63' }}>{cat}</strong></> : ''}
              {q   ? <> for "<strong>{q}</strong>"</> : ''}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60 }}>
                <div style={{ width: 40, height: 40, border: '4px solid #fce4ec', borderTop: '4px solid #e91e63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : products.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <h3 style={{ color: '#212121', margin: '0 0 8px' }}>No products found</h3>
                <p style={{ color: '#888', fontSize: 14, margin: '0 0 20px' }}>
                  Try different keywords or clear the filters
                </p>
                <button onClick={clearAll}
                  style={{ background: '#e91e63', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={S.grid} className="sr-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const S = {
  topBar:     { background: '#fff', borderRadius: 8, padding: '14px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  heading:    { fontSize: 20, fontWeight: 'bold', color: '#212121', margin: 0 },
  activeTag:  { background: '#fce4ec', color: '#e91e63', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: '500', display: 'inline-flex', alignItems: 'center' },
  clearBtn:   { background: 'none', border: '1px solid #e91e63', color: '#e91e63', padding: '3px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 },
  sortSelect: { padding: '8px 14px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 13, cursor: 'pointer', background: '#fff' },
  filterToggleBtn: { background: '#e91e63', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap' },
  sidebar:    { width: 220, flexShrink: 0, background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  filterBlock:{ paddingBottom: 8, borderBottom: '1px solid #f5f5f5' },
  filterHead: { fontSize: 11, fontWeight: 'bold', color: '#9e9e9e', letterSpacing: 1, padding: '14px 16px 8px', textTransform: 'uppercase' },
  filterRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px', cursor: 'pointer', fontSize: 14, transition: 'all 0.15s' },
  countBadge: { fontSize: 11, fontWeight: 'bold', padding: '2px 8px', borderRadius: 10, minWidth: 22, textAlign: 'center' },
  clearAllBtn:{ width: '100%', background: '#ffebee', color: '#d32f2f', border: 'none', padding: '10px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 12 },
  empty:      { background: '#fff', borderRadius: 10, padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
};

export default SearchResults;