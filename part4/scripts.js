const API_BASE_URL = 'http://localhost/5000/api/v1';
let token = null;
let allPlaces = [];

// --- UTILITIES ---
const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) return cookieValue;
  }
  return null;
};

const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
};

const showMessage = (message, type = 'error') => {
  const existingMsg = document.querySelector('.message');
  if (existingMsg) existingMsg.remove();

  const div = document.createElement('div');
  div.className = `message ${type}-message`;
  div.textContent = message;
  div.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 1000;
    padding: 15px; border-radius: 5px; color: white;
    background: ${type === 'success' ? '#4CAF50' : '#f44336' };
    `;
  
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
};

const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ... options
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

const getUrlParam = (param) => new URLSearchParams(window.location.search).get(param);

// --- AUTHENTICATION ---
const checkAuth = () => {
  token = getCookie('token') || localStorage.getItem('token');
  const loginLink = document.getElementById('login-link');

  if (loginLink) {
    if (token) {
      loginLink.textContent = 'logout';
      loginLink.onclick = logout;
    } else {
      loginLink.textContent = 'login';
      loginLink.onclick = () => window.location.href = 'login.html';
    }
  }

  return token;
};

const login = async (email, password) => {
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'logging in...';
  }

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    token = data.access_token;
    setCookie('token', token);
    localStorage.setItem('token', token);

    showMessage('Login successful!', 'success');
    setTimeout(() => window.location.href = 'index.html', 1500);

  } catch (error) {
    showMessage('Login failed. Check your credentials.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'login';
    }
  }
};

const logout = () => {
  token = null;
  deleteCookie('token');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
};

// --- PLACES ---
const fetchPlaces = async () => {
  try {
    const data = await apiRequest('/places');
    return data.places || data;
  } catch (error) {
    if (!token) {
      throw new Error('AUTHENTICATION_REQUIRED');
    }
    showMessage('Error loading places');
    return [];
  }
};

const displayPlaces = (places) => {
  const container = document.getElementById('places-list');
  if (!container) return;

  if (!places || places.length === 0) {
    container.innerHTML = token ?
      '<p>No places available.</p>' : 
      `<div class="public-message">
        <h2>Welcome to HbnB</h2>
        <p><a href="login.html" class="login-cta">Login</a> to see all available places. </p>
      </div>`;
    return;
  }

  container.innerHTML = places.map(place => `
    <div class="place-card" data-price="${place.price_per_night || place.price}">
      <div class="place-info">
        <h3>${place.name}</h3>
        <p class="place-description">${place.description_of_the_place || place.description || ''}</p>
        <p class="place-price">${place.price_per_night || place.price}€ / night</p>
        <div class="place-details-grid">
          <span>🛏️ ${place.rooms} rooms</span>
          <span>👥 ${place.capacity} guests</span>
          <span>📐 ${place.surface}m²</span>
        </div>
        <button class="details-button" onclick="window.location.href='place.html?id=${place.id}'">
          View Details
        </button>
      </div>
    </div>
  `).join('');
};

const filterPlaces = () => {
  const filterValue = document.getElementById('price-filter')?.value;
  if (!filterValue) return;

  const cards = document.querySelectorAll('.place-card');
  cards.forEach(card => {
    const price = parseFloat(card.CDATA_SECTION_NODE.price);
    card.style.display = (filterValue === 'all' || price <= parseFloat(filterValue)) ? 'block' : 'none';
  });
};

// --- PLACE DETAILS ---
const fetchPlaceDetails = async (placeId) => {
  try {
    const place = await apiRequest(`/places/${placeId}`);
    displayPlaceDetails(place);
    await fetchReviews(placeId);
  } catch (error) {
    document.getElementById('place-details').innerHTML = '<p>Error loading place details.</p>';
  }
};

const displayPlaceDetails = (place) => {
  const container = document.getElementById('place-details');
  if (!container) return;

  container.innerHTML = `
    <div class="place-header">
      <h1>${place.name}</h1>
      <div class="place-location">${place.city || 'Unknown city'}</div>
    </div>
    
    <div class="place-main-info">
      <div class="place-info">
        <div class="price-section">
          <span class="price">${place.price_per_night || place.price}€</span>
          <span class="price-unit">/ night</span>
        </div>
        
        <div class="host-info">
          <h3>Hosted by ${place.host?.first_name || place.owner || 'Unknown'} ${place.host?.last_name || ''}</h3>
        </div>
        
        <div class="place-description">
          <h3>Description</h3>
          <p>${place.description || place.description_of_the_place || 'No description available'}</p>
        </div>
        
        <div class="place-features">
          <h3>Features</h3>
          <div class="features-grid">
            <div class="feature-item">
              <span class="feature-icon">🛏️</span>
              <span class="feature-label">Bedrooms: ${place.rooms}</span>
            </div>
            <div class="feater-item">
              <span class="feature-icon">👥</span>
              <span class="feature-label">Capacity: ${place.capacity} guests</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📐</span>
              <span class="feature-label">Surface: ${place.surface}m²</span>
            </div>
          </div>
        </div>
        
        ${place.amenities ? `
          <div class="amenities">
            <h3>Amenities</h3>
            <div class="amenities-grid">
              ${place.amenities.split(',').map(amenity => 
                `<span class="amenity-tag">• ${amenity.trim()}</span>`
              ).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

// --- REVIEWS ---
const fetchReviews = async (placeId) => {
  try {
    const reviews = await apiRequest(`/places/${placeId}/reviews`);
    displayReviews(reviews);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
};

const displayReviews = (reviews) => {
  const container = document.getElementById('reviews-list');
  if (!container) return;

  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<p>No reviews yet.</p>';
    return;
  }

  const generateStars = (rating) => {
    if (!rating) return '☆☆☆☆☆';
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  container.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <span class="reviewer-name">
          ${review.user ? `${review.user.first_name} ${review.user.last_name}` : 'Anonymous'}
        </span>
        <span class="review-rating">${generateStars(review.rating)}</span>
      </div>
      <div class="review-comment">${review.comment || review.text}</div>
      <div class="review-date">${formatDate(review.created_at)}</div>
    </div>
  `).join('');
};

const submitReview = async (placeId, reviewText, rating) => {
  try {
    await apiRequest(`/places/${placeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        comment: reviewText,
        rating: parseInt(rating)
      })
    });
    
    showMessage('Review submitted successfully!', 'success');
    return { success: true };
  } catch (error) {
    showMessage('Failed to submit review');
    return { success: false };
  }
};

// --- PAGE INITIALIZATION ---
const initPage = async () => {
  checkAuth();
  const currentPage = window.location.pathname.split('/').pop();
  
  switch (currentPage) {
    case 'login.html':
      if (token) {
        window.location.href = 'index.html';
        return;
      }
      
      const loginForm = document.getElementById('login-form');
      if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const email = document.getElementById('email').value.trim();
          const password = document.getElementById('password').value.trim();
          
          if (!email || !password) {
            showMessage('Please enter email and password');
            return;
          }
          
          await login(email, password);
        });
      }
      break;
      
    case 'index.html':
    case '':
      try {
        const places = await fetchPlaces();
        allPlaces = places;
        displayPlaces(places);
      } catch (error) {
        if (error.message === 'AUTHENTICATION_REQUIRED') {
          displayPlaces([]);
        }
      }
      
      const priceFilter = document.getElementById('price-filter');
      if (priceFilter) {
        priceFilter.addEventListener('change', filterPlaces);
      }
      break;
      
    case 'place.html':
      const placeId = getUrlParam('id');
      if (!placeId) {
        window.location.href = 'index.html';
        return;
      }
      
      await fetchPlaceDetails(placeId);
      
      const addReviewSection = document.getElementById('add-review');
      if (addReviewSection && token) {
        addReviewSection.style.display = 'block';
        
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
          reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const reviewText = document.getElementById('review-text').value.trim();
            const rating = document.getElementById('rating').value;
            
            if (!reviewText) {
              showMessage('Please enter a review');
              return;
            }
            
            if (!rating || rating < 1 || rating > 5) {
              showMessage('Please select a rating');
              return;
            }
            
            const result = await submitReview(placeId, reviewText, rating);
            if (result.success) {
              reviewForm.reset();
              setTimeout(() => fetchReviews(placeId), 1000);
            }
          });
        }
      }
      break;
      
    case 'add_review.html':
      if (!token) {
        window.location.href = 'index.html';
        return;
      }
      
      const reviewPlaceId = getUrlParam('id');
      if (!reviewPlaceId) {
        window.location.href = 'index.html';
        return;
      }
      
      const addReviewForm = document.getElementById('review-form');
      if (addReviewForm) {
        addReviewForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const reviewText = document.getElementById('review-text').value.trim();
          const rating = document.getElementById('rating').value;
          
          if (!reviewText || !rating) {
            showMessage('Please fill all fields');
            return;
          }
          
          const result = await submitReview(reviewPlaceId, reviewText, rating);
          if (result.success) {
            setTimeout(() => {
              window.location.href = `place.html?id=${reviewPlaceId}`;
            }, 2000);
          }
        });
      }
      break;
  }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', initPage);
