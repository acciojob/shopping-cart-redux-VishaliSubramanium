import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';
import './../styles/App.css';

const productsData = [
  { id: 1, name: 'Laptop', price: 1000 },
  { id: 2, name: 'Smartphone', price: 500 },
  { id: 3, name: 'Headphones', price: 100 },
  { id: 4, name: 'Smartwatch', price: 200 }
];

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState: {
    products: productsData,
    cart: [],
    wishlist: [],
    discount: 0
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ ...product, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload);
    },
    increaseQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decreaseQuantity: (state, action) => {
      const item = state.cart.find((item) => item.id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.cart = state.cart.filter((i) => i.id !== action.payload);
        }
      }
    },
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const index = state.wishlist.findIndex((item) => item.id === product.id);
      if (index >= 0) {
        state.wishlist.splice(index, 1);
      } else {
        state.wishlist.push(product);
      }
    },
    applyCoupon: (state, action) => {
      state.discount = action.payload;
    }
  }
});

const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  toggleWishlist,
  applyCoupon
} = shoppingSlice.actions;

const store = configureStore({
  reducer: {
    shopping: shoppingSlice.reducer
  }
});

function Navbar() {
  const cart = useSelector((state) => state.shopping.cart);
  const wishlist = useSelector((state) => state.shopping.wishlist);

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '10px', background: '#eee' }}>
      <Link to="/">Products</Link>
      <Link to="/cart">Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})</Link>
      <Link to="/wishlist">Wishlist ({wishlist.length})</Link>
    </nav>
  );
}

function ProductsPage() {
  const dispatch = useDispatch();
  const { products, wishlist, cart } = useSelector((state) => state.shopping);

  return (
    <div className="products-page" style={{ padding: '20px' }}>
      <h2>Products</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {products.map((product) => {
          const isWishlisted = wishlist.some((item) => item.id === product.id);
          const isInCart = cart.some((item) => item.id === product.id);

          return (
            <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{product.name}</h3>
                <p>${product.price}</p>
              </div>
              <div>
                <button onClick={() => dispatch(addToCart(product))} style={{ marginRight: '10px' }}>
                  {isInCart ? 'Add More' : 'Add to Cart'}
                </button>
                <button onClick={() => dispatch(toggleWishlist(product))}>
                  {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CartComponent() {
  const dispatch = useDispatch();
  const { cart, discount } = useSelector((state) => state.shopping);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal - (subtotal * discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode === 'SAVE10') {
      dispatch(applyCoupon(0.1));
      setCouponError('');
    } else if (couponCode === 'SAVE20') {
      dispatch(applyCoupon(0.2));
      setCouponError('');
    } else {
      setCouponError('Invalid Coupon');
    }
  };

  return (
    <div className="cart-component" style={{ padding: '20px' }}>
      <h2>Shopping Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>{item.name}</h4>
                <p>Price: ${item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button onClick={() => dispatch(decreaseQuantity(item.id))}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => dispatch(increaseQuantity(item.id))}>+</button>
                <button onClick={() => dispatch(removeFromCart(item.id))} style={{ color: 'red' }}>Remove</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '20px' }}>
            <form onSubmit={handleApplyCoupon}>
              <input 
                type="text" 
                placeholder="Enter Coupon (e.g. SAVE10)" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
              />
              <button type="submit">Apply Coupon</button>
            </form>
            {couponError && <p style={{ color: 'red' }}>{couponError}</p>}
          </div>

          <div style={{ marginTop: '20px' }}>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            {discount > 0 && <p>Discount: {discount * 100}%</p>}
            <h3>Total: ${total.toFixed(2)}</h3>
          </div>
        </div>
      )}
    </div>
  );
}

function WishlistComponent() {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.shopping.wishlist);

  return (
    <div className="wishlist-component" style={{ padding: '20px' }}>
      <h2>Wishlist</h2>
      {wishlist.length === 0 ? (
        <p>Your wishlist is empty.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {wishlist.map((product) => (
            <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{product.name}</h3>
                <p>${product.price}</p>
              </div>
              <div>
                <button onClick={() => {
                  dispatch(addToCart(product));
                  dispatch(toggleWishlist(product));
                }} style={{ marginRight: '10px' }}>
                  Move to Cart
                </button>
                <button onClick={() => dispatch(toggleWishlist(product))}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div id="main">
          <Navbar />
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/cart" element={<CartComponent />} />
            <Route path="/wishlist" element={<WishlistComponent />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
