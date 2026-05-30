import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api';
import { useAuth } from '../context/authContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct]         = useState(null);
  const [img, setImg]                 = useState(0);
  const [qty, setQty]                 = useState(1);
  const [selectedSize, setSelectedSize]   = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [reviews, setReviews]         = useState([]);
  const [myRating, setMyRating]       = useState(0);
  const [myComment, setMyComment]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const { addToCart, toggleWishlist, isInWishlist, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/api/products/${id}`).then(r => setProduct(r.data)).catch(() => {});
    API.get(`/api/reviews/${id}`).then(r => setReviews(r.data)).catch(() => {});
  }, [id]);

  if (!product) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', background: '#f5f5f5' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #fce4ec', borderTop: '4px solid #e91e63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const discount   = product.originalPrice > 0 ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const images     = product.images?.length ? product.images : ['https://via.placeholder.com/400?text=Khadi'];
  const inWishlist = isInWishlist(product._id);
  const hasSizes   = product.sizes?.length > 0;
  const hasColors  = product.colors?.length > 0;

  // ── Validate before any action ──
  const validateVariants = () => {
    if (hasSizes && !selectedSize) {
      toast.error('⚠️ Please select a size first');
      document.getElementById('size-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (hasColors && !selectedColor) {
      toast.error('⚠️ Please select a color first');
      document.getElementById('color-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return; }
    if (!validateVariants()) return;
    const res = await addToCart(product._id, qty, selectedSize, selectedColor);
    if (res?.success) toast.success('Added to cart! 🛒');
    else toast.error(res?.message || 'Failed to add to cart');
  };

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return; }
    if (!validateVariants()) return;
    const res = await addToCart(product._id, qty, selectedSize, selectedColor);
    if (res?.success) navigate('/cart');
    else toast.error('Failed to add to cart');
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (!validateVariants()) return;
    const res = await toggleWishlist(product._id);
    if (res?.success) toast.success(inWishlist ? 'Removed from wishlist' : '❤️ Added to wishlist!');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (myRating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await API.post('/api/reviews', {
        productId: id,
        rating: myRating,
        comment: myComment.trim() || `Rated ${myRating} star${myRating > 1 ? 's' : ''}`,
      });
      toast.success('Review submitted! 🌟');
      setMyRating(0); setMyComment('');
      const [rRes, pRes] = await Promise.all([
        API.get(`/api/reviews/${id}`),
        API.get(`/api/products/${id}`),
      ]);
      setReviews(rRes.data);
      setProduct(pRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct:   reviews.length
      ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const alreadyReviewed = reviews.some(r => r.user?.toString() === user?._id?.toString());

  const needsSizeSelection  = hasSizes  && !selectedSize;
  const needsColorSelection = hasColors && !selectedColor;
  const canProceed          = !needsSizeSelection && !needsColorSelection;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '16px 0' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeIn{ from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .size-chip { transition: all 0.15s !important; }
        .size-chip:hover { border-color: #e91e63 !important; color: #e91e63 !important; background: #fff5f8 !important; }
        .color-chip { transition: all 0.15s !important; }
        .color-chip:hover { border-color: #e91e63 !important; background: #fff5f8 !important; }
        .thumb-hover:hover { border-color: #e91e63 !important; }
        .shake { animation: shake 0.4s ease !important; }
        @media(max-width:768px){
          .pd-main { flex-direction:column !important; }
          .pd-img-sec { width:100% !important; min-height:unset !important; }
          .pd-actions { flex-wrap:wrap !important; }
          .delivery-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 12px' }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: '#888', marginBottom: 12, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer', color: '#e91e63' }} onClick={() => navigate('/')}>Home</span>
          <span>›</span>
          <span style={{ cursor: 'pointer', color: '#e91e63' }} onClick={() => navigate(`/search?category=${product.category}`)}>{product.category}</span>
          <span>›</span>
          <span style={{ color: '#555' }}>{product.name}</span>
        </div>

        {/* ── MAIN CARD ── */}
        <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexWrap: 'wrap' }} className="pd-main">

          {/* Images */}
          <div style={{ width: 420, flexShrink: 0, padding: 20, display: 'flex', gap: 12 }} className="pd-img-sec">
            {/* Thumbnails */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {images.map((im, i) => (
                <img key={i} src={im} alt="" onClick={() => setImg(i)}
                  className="thumb-hover"
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: i === img ? '2px solid #e91e63' : '2px solid #eee', transition: 'border-color 0.2s' }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/64'; }}
                />
              ))}
            </div>

            {/* Main image */}
            <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', minHeight: 360 }}>
              <img src={images[img]} alt={product.name}
                style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 6 }}
                onError={e => { e.target.src = 'https://via.placeholder.com/400?text=Khadi'; }}
              />
              {discount > 0 && (
                <div style={{ position: 'absolute', top: 12, left: 12, background: '#e91e63', color: '#fff', fontSize: 12, fontWeight: 'bold', padding: '4px 10px', borderRadius: 4 }}>
                  {discount}% OFF
                </div>
              )}
              {product.stock === 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: '#d32f2f', color: '#fff', padding: '8px 24px', borderRadius: 6, fontWeight: 'bold', fontSize: 14 }}>Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div style={{ flex: 1, padding: '24px 24px 24px 0', minWidth: 280 }}>
            <div style={{ fontSize: 11, color: '#e91e63', fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{product.category}</div>
            <h1 style={{ fontSize: 22, fontWeight: '500', color: '#212121', margin: '0 0 4px', lineHeight: 1.3 }}>{product.name}</h1>
            <div style={{ fontSize: 12, color: '#9e9e9e', marginBottom: 12 }}>Sold by: <strong style={{ color: '#555' }}>{product.sellerName || 'Banasthali Khadi Bhandar'}</strong></div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f5f5f5' }}>
              {product.numReviews > 0 ? (
                <>
                  <div style={{ background: '#388e3c', color: '#fff', fontSize: 13, fontWeight: 'bold', padding: '3px 10px', borderRadius: 4 }}>★ {product.rating?.toFixed(1)}</div>
                  <span style={{ fontSize: 13, color: '#555' }}>{product.numReviews} reviews</span>
                  {reviews.filter(r => r.isVerifiedPurchase).length > 0 && (
                    <span style={{ fontSize: 12, color: '#388e3c' }}>✅ {reviews.filter(r => r.isVerifiedPurchase).length} verified</span>
                  )}
                </>
              ) : (
                <span style={{ fontSize: 13, color: '#9e9e9e' }}>No reviews yet — be the first!</span>
              )}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 30, fontWeight: 'bold', color: '#212121' }}>₹{product.price?.toLocaleString()}</span>
              {product.originalPrice > 0 && (
                <>
                  <span style={{ fontSize: 16, color: '#9e9e9e', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString()}</span>
                  <span style={{ fontSize: 14, color: '#388e3c', fontWeight: 'bold' }}>{discount}% off</span>
                </>
              )}
            </div>

            {/* ── SIZE SELECTOR ── */}
            {hasSizes && (
              <div id="size-selector" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#212121' }}>
                    Select Size
                    {selectedSize
                      ? <span style={{ color: '#e91e63', marginLeft: 8 }}>— {selectedSize}</span>
                      : <span style={{ color: '#d32f2f', fontSize: 11, fontWeight: 'normal', marginLeft: 8 }}>* Required</span>
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {product.sizes.map(s => (
                    <div
                      key={s}
                      className="size-chip"
                      onClick={() => setSelectedSize(prev => prev === s ? '' : s)}
                      style={{
                        padding: '8px 18px',
                        border:      selectedSize === s ? '2px solid #e91e63' : '1.5px solid #ddd',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight:  selectedSize === s ? 'bold' : '500',
                        background:  selectedSize === s ? '#fce4ec' : '#fff',
                        color:       selectedSize === s ? '#e91e63' : '#333',
                        minWidth: 44,
                        textAlign: 'center',
                        userSelect: 'none',
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
                {/* Warning if not selected */}
                {needsSizeSelection && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, background: '#fff3e0', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: '#e65100' }}>
                    ⚠️ Please select a size to add to cart, wishlist, or order
                  </div>
                )}
              </div>
            )}

            {/* ── COLOR SELECTOR ── */}
            {hasColors && (
              <div id="color-selector" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#212121', marginBottom: 10 }}>
                  Select Color
                  {selectedColor
                    ? <span style={{ color: '#e91e63', marginLeft: 8 }}>— {selectedColor}</span>
                    : <span style={{ color: '#d32f2f', fontSize: 11, fontWeight: 'normal', marginLeft: 8 }}>* Required</span>
                  }
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {product.colors.map(c => (
                    <div
                      key={c}
                      className="color-chip"
                      onClick={() => setSelectedColor(prev => prev === c ? '' : c)}
                      style={{
                        padding: '8px 18px',
                        border:      selectedColor === c ? '2px solid #e91e63' : '1.5px solid #ddd',
                        borderRadius: 20,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight:  selectedColor === c ? 'bold' : '500',
                        background:  selectedColor === c ? '#fce4ec' : '#fff',
                        color:       selectedColor === c ? '#e91e63' : '#333',
                        userSelect: 'none',
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                {needsColorSelection && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, background: '#fff3e0', padding: '8px 12px', borderRadius: 6, fontSize: 12, color: '#e65100' }}>
                    ⚠️ Please select a color to continue
                  </div>
                )}
              </div>
            )}

            {/* ── QUANTITY ── */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#212121', marginBottom: 10 }}>Quantity</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1.5px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ background: '#f5f5f5', border: 'none', padding: '9px 20px', fontSize: 20, cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>−</button>
                <span style={{ padding: '9px 24px', fontSize: 16, fontWeight: 'bold', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock || 1, q + 1))}
                  style={{ background: '#f5f5f5', border: 'none', padding: '9px 20px', fontSize: 20, cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>+</button>
              </div>
            </div>

            {/* Stock status */}
            <div style={{ marginBottom: 18, fontSize: 13 }}>
              {product.stock > 10 ? (
                <span style={{ color: '#388e3c' }}>✅ In Stock</span>
              ) : product.stock > 0 ? (
                <span style={{ color: '#ff9f00', fontWeight: '500' }}>⚠️ Only {product.stock} left! Order soon</span>
              ) : (
                <span style={{ color: '#d32f2f', fontWeight: '500' }}>❌ Out of Stock</span>
              )}
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }} className="pd-actions">
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                style={{
                  flex: 1, minWidth: 130,
                  background: product.stock === 0 ? '#e0e0e0' : canProceed ? '#ff9f00' : '#ffcc80',
                  color: product.stock === 0 ? '#9e9e9e' : '#fff',
                  border: 'none', padding: '14px 16px',
                  fontWeight: 'bold', fontSize: 14,
                  borderRadius: 6,
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                🛒 ADD TO CART
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                style={{
                  flex: 1, minWidth: 130,
                  background: product.stock === 0 ? '#e0e0e0' : canProceed ? '#e91e63' : '#f48fb1',
                  color: product.stock === 0 ? '#9e9e9e' : '#fff',
                  border: 'none', padding: '14px 16px',
                  fontWeight: 'bold', fontSize: 14,
                  borderRadius: 6,
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ⚡ BUY NOW
              </button>
              <button
                onClick={handleWishlist}
                style={{
                  background: inWishlist ? '#fce4ec' : '#fff',
                  color: '#e91e63',
                  border: '2px solid #e91e63',
                  padding: '14px 16px',
                  borderRadius: 6, cursor: 'pointer', fontSize: 18,
                  transition: 'all 0.2s',
                }}
                title={canProceed ? (inWishlist ? 'Remove from wishlist' : 'Add to wishlist') : 'Select size/color first'}
              >
                {inWishlist ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Global variant warning */}
            {(needsSizeSelection || needsColorSelection) && product.stock > 0 && (
              <div style={{ background: '#fff3e0', border: '1px solid #ffcc02', color: '#e65100', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <div>
                  <strong>Selection required before proceeding:</strong>
                  <div style={{ marginTop: 2 }}>
                    {needsSizeSelection && '• Please select a size'}
                    {needsSizeSelection && needsColorSelection && <br />}
                    {needsColorSelection && '• Please select a color'}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#212121', marginBottom: 8 }}>Product Description</div>
              <p style={{ color: '#555', lineHeight: 1.7, fontSize: 13, margin: 0 }}>{product.description}</p>
            </div>

            {/* Product details */}
            {(hasSizes || hasColors || product.categories?.length > 0) && (
              <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 'bold', color: '#212121', marginBottom: 10 }}>Product Details</div>
                {product.categories?.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#9e9e9e', minWidth: 70 }}>Categories:</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {product.categories.map(c => (
                        <span key={c} style={{ background: '#fce4ec', color: '#e91e63', fontSize: 11, padding: '2px 10px', borderRadius: 10, fontWeight: '500' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {hasSizes && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#9e9e9e', minWidth: 70 }}>Sizes:</span>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {product.sizes.map(s => (
                        <span key={s} style={{ background: '#f5f5f5', color: '#333', fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '1px solid #e0e0e0' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {hasColors && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#9e9e9e', minWidth: 70 }}>Colors:</span>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {product.colors.map(c => (
                        <span key={c} style={{ background: '#f5f5f5', color: '#333', fontSize: 11, padding: '2px 8px', borderRadius: 10, border: '1px solid #e0e0e0' }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivery info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }} className="delivery-grid">
              {[
                { icon: '🚚', title: 'Free Delivery',   desc: 'On orders above ₹500' },
                { icon: '↩️', title: 'Easy Returns',    desc: '7 day return policy'  },
                { icon: '✅', title: 'Authentic Khadi', desc: '100% certified'       },
                { icon: '🔒', title: 'Secure Payment',  desc: 'Safe & encrypted'     },
              ].map(d => (
                <div key={d.title} style={{ background: '#f9f9f9', borderRadius: 6, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#212121' }}>{d.title}</div>
                    <div style={{ fontSize: 10, color: '#9e9e9e' }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Videos */}
        {product.videos?.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 10, padding: 20, marginTop: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 14 }}>🎥 Product Videos</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {product.videos.map((url, i) => {
                const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
                return (
                  <div key={i} style={{ flex: '1 1 300px', maxWidth: 500 }}>
                    {ytMatch ? (
                      <iframe width="100%" height="220"
                        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                        title="video" frameBorder="0" allowFullScreen
                        style={{ borderRadius: 8 }}
                      />
                    ) : (
                      <video controls style={{ width: '100%', borderRadius: 8, maxHeight: 220 }} src={url} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        <div style={{ background: '#fff', borderRadius: 10, marginTop: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

          {/* Rating overview */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', padding: '24px 28px', borderRight: '1px solid #f0f0f0', minWidth: 130 }}>
                <div style={{ fontSize: 52, fontWeight: 'bold', color: '#212121', lineHeight: 1 }}>{product.rating?.toFixed(1) || '0.0'}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, margin: '6px 0' }}>
                  {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= Math.round(product.rating || 0) ? '#f59e0b' : '#e0e0e0', fontSize: 14 }}>★</span>)}
                </div>
                <div style={{ fontSize: 12, color: '#9e9e9e' }}>{reviews.length} reviews</div>
              </div>
              <div style={{ flex: 1, padding: '24px 28px', minWidth: 180 }}>
                {ratingCounts.map(r => (
                  <div key={r.star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#555', width: 8 }}>{r.star}</span>
                    <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
                    <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: r.star >= 4 ? '#388e3c' : r.star === 3 ? '#f59e0b' : '#d32f2f', borderRadius: 4, transition: 'width 0.6s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#9e9e9e', width: 16 }}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write review */}
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 16 }}>
              {reviews.length === 0 ? '⭐ Be the first to review!' : '✍️ Write a Review'}
            </div>
            {!user ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ color: '#888', marginBottom: 12, fontSize: 14 }}>Login to write a review</p>
                <button onClick={() => navigate('/login')}
                  style={{ background: '#e91e63', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' }}>
                  Login to Review
                </button>
              </div>
            ) : alreadyReviewed ? (
              <div style={{ background: '#e8f5e9', color: '#388e3c', padding: '14px 18px', borderRadius: 8, fontSize: 14, fontWeight: '500' }}>
                ✅ You have already reviewed this product. Thank you!
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 8 }}>Your Rating *</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[1,2,3,4,5].map(n => (
                      <span key={n}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setMyRating(n)}
                        style={{ fontSize: 32, cursor: 'pointer', color: n <= (hoverRating || myRating) ? '#f59e0b' : '#e0e0e0', transition: 'color 0.15s, transform 0.1s', transform: n <= (hoverRating || myRating) ? 'scale(1.2)' : 'scale(1)', display: 'inline-block' }}
                      >★</span>
                    ))}
                    {myRating > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 13, color: '#555' }}>
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 4 }}>
                    Your Review <span style={{ color: '#9e9e9e', fontWeight: 'normal', fontSize: 12 }}>(optional)</span>
                  </div>
                  <textarea value={myComment} onChange={e => setMyComment(e.target.value)}
                    placeholder={`Share your experience...\n• Quality and fabric feel?\n• Does it match the description?\n• Delivery experience?`}
                    style={{ width: '100%', padding: '12px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: 100 }}
                    maxLength={500}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#9e9e9e' }}>Detailed reviews help other customers</span>
                    <span style={{ fontSize: 11, color: myComment.length > 400 ? '#e91e63' : '#9e9e9e' }}>{myComment.length}/500</span>
                  </div>
                </div>
                <button type="submit" disabled={submitting || myRating === 0}
                  style={{ background: myRating === 0 ? '#ccc' : '#e91e63', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: myRating === 0 ? 'not-allowed' : 'pointer' }}>
                  {submitting ? '⏳ Submitting...' : myRating === 0 ? 'Select a rating first' : '🌟 Submit Review'}
                </button>
              </form>
            )}
          </div>

          {/* Reviews list */}
          {reviews.length > 0 && (
            <div style={{ padding: '24px 28px' }}>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 16 }}>Customer Reviews ({reviews.length})</div>
              {reviews.map((r, i) => (
                <div key={r._id} style={{ padding: '16px 0', borderBottom: i < reviews.length - 1 ? '1px solid #f5f5f5' : 'none', animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: `hsl(${(r.name?.charCodeAt(0) || 65) * 10},60%,65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff', flexShrink: 0 }}>
                        {r.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: 14, color: '#212121' }}>{r.name || 'Customer'}</div>
                        <div style={{ fontSize: 11, color: '#9e9e9e' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(n => <span key={n} style={{ color: n <= r.rating ? '#f59e0b' : '#e0e0e0', fontSize: 14 }}>★</span>)}
                      </div>
                      {r.isVerifiedPurchase && (
                        <span style={{ background: '#e8f5e9', color: '#388e3c', fontSize: 10, fontWeight: 'bold', padding: '2px 8px', borderRadius: 10 }}>✅ Verified Purchase</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;