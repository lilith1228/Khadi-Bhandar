import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, user } = useAuth();
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const inWish   = isInWishlist(product._id);
  const discount = product.originalPrice > 0
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const hasSizes  = product.sizes?.length > 0;
  const hasColors = product.colors?.length > 0;

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    // If product has sizes or colors, go to product page to select first
    if (hasSizes || hasColors) {
      toast.info('Please select size/color before wishlisting');
      navigate(`/product/${product._id}`);
      return;
    }
    const res = await toggleWishlist(product._id);
    if (res?.success) {
      toast.success(inWish ? 'Removed from wishlist' : '❤️ Added to wishlist!');
    }
  };

  const handleCart = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    // If has variants, go to product page
    if (hasSizes || hasColors) {
      toast.info('Please select size/color on product page');
      navigate(`/product/${product._id}`);
      return;
    }
    const res = await addToCart(product._id, 1);
    if (res?.success) toast.success('Added to cart! 🛒');
    else toast.error('Failed to add to cart');
  };

  return (
    <div
      style={{
        ...S.card,
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.13)' : '0 1px 6px rgba(0,0,0,0.08)',
      }}
      onClick={() => navigate(`/product/${product._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div style={S.imgWrap}>
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/200?text=Khadi'}
          alt={product.name}
          style={S.img}
          onError={e => { e.target.src = 'https://via.placeholder.com/200?text=Khadi'; }}
        />

        {/* Discount badge */}
        {discount > 0 && (
          <div style={S.discBadge}>{discount}% OFF</div>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div style={S.outOfStock}>Out of Stock</div>
        )}

        {/* Wishlist button — always visible */}
        <button
          onClick={handleWishlist}
          style={{
            ...S.wishBtn,
            background: inWish ? '#e91e63' : 'rgba(255,255,255,0.95)',
            color:      inWish ? '#fff'    : '#e91e63',
            transform:  hovered ? 'scale(1.1)' : 'scale(1)',
          }}
          title={
            hasSizes || hasColors
              ? 'Select size/color on product page'
              : inWish ? 'Remove from wishlist' : 'Add to wishlist'
          }
        >
          {inWish ? '❤️' : '🤍'}
        </button>

        {/* Quick add — slides up on hover */}
        {product.stock > 0 && (
          <button
            onClick={handleCart}
            style={{
              ...S.quickAdd,
              opacity:    hovered ? 1 : 0,
              transform:  hovered ? 'translateY(0)' : 'translateY(100%)',
            }}
          >
            {hasSizes || hasColors ? '👁 Select Options' : '🛒 Add to Cart'}
          </button>
        )}

        {/* Variant indicator */}
        {(hasSizes || hasColors) && (
          <div style={S.variantBadge}>
            {hasSizes && `${product.sizes.length} sizes`}
            {hasSizes && hasColors && ' · '}
            {hasColors && `${product.colors.length} colors`}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={S.info}>
        <div style={S.category}>{product.category}</div>
        <div style={S.name}>{product.name}</div>

        {/* Sizes preview */}
        {hasSizes && (
          <div style={S.sizesPreview}>
            {product.sizes.slice(0, 4).map(s => (
              <span key={s} style={S.sizeTag}>{s}</span>
            ))}
            {product.sizes.length > 4 && (
              <span style={S.sizeTag}>+{product.sizes.length - 4}</span>
            )}
          </div>
        )}

        {/* Rating */}
        {product.numReviews > 0 && (
          <div style={S.ratingRow}>
            <span style={S.ratingBadge}>★ {product.rating?.toFixed(1)}</span>
            <span style={S.ratingCount}>({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div style={S.priceRow}>
          <span style={S.price}>₹{product.price?.toLocaleString()}</span>
          {product.originalPrice > 0 && (
            <span style={S.originalPrice}>₹{product.originalPrice?.toLocaleString()}</span>
          )}
        </div>

        {/* Stock warning */}
        {product.stock > 0 && product.stock <= 5 && (
          <div style={{ fontSize: 10, color: '#ff9f00', fontWeight: '500', marginTop: 4 }}>
            ⚠️ Only {product.stock} left!
          </div>
        )}
      </div>
    </div>
  );
};

const S = {
  card: {
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative',
  },
  imgWrap: {
    position: 'relative',
    paddingTop: '115%',
    background: '#f9f9f9',
    overflow: 'hidden',
  },
  img: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s',
  },
  discBadge: {
    position: 'absolute',
    top: 8, left: 8,
    background: '#e91e63',
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    padding: '3px 7px',
    borderRadius: 3,
    zIndex: 2,
  },
  outOfStock: {
    position: 'absolute',
    bottom: 40, left: 0, right: 0,
    background: 'rgba(0,0,0,0.55)',
    color: '#fff',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    padding: '5px 0',
    zIndex: 2,
  },
  wishBtn: {
    position: 'absolute',
    top: 8, right: 8,
    width: 34, height: 34,
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    transition: 'all 0.2s',
  },
  quickAdd: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    background: '#e91e63',
    color: '#fff',
    border: 'none',
    padding: '9px 0',
    fontSize: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 3,
    transition: 'opacity 0.25s, transform 0.25s',
  },
  variantBadge: {
    position: 'absolute',
    bottom: 38,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.55)',
    color: '#fff',
    fontSize: 9,
    padding: '2px 8px',
    borderRadius: 10,
    whiteSpace: 'nowrap',
    zIndex: 2,
  },
  info:         { padding: '10px 12px 14px' },
  category:     { fontSize: 10, color: '#e91e63', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  name:         { fontSize: 13, color: '#212121', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4, fontWeight: '500' },
  sizesPreview: { display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 },
  sizeTag:      { fontSize: 9, background: '#f5f5f5', color: '#555', padding: '2px 6px', borderRadius: 3, border: '1px solid #e0e0e0', fontWeight: '500' },
  ratingRow:    { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 },
  ratingBadge:  { background: '#388e3c', color: '#fff', fontSize: 10, fontWeight: 'bold', padding: '2px 6px', borderRadius: 3 },
  ratingCount:  { fontSize: 11, color: '#9e9e9e' },
  priceRow:     { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  price:        { fontWeight: 'bold', fontSize: 15, color: '#212121' },
  originalPrice:{ fontSize: 11, color: '#9e9e9e', textDecoration: 'line-through' },
};

export default ProductCard;