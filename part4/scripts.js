// === CONFIGURATION AND GLOBAL VARIABLES ===
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Global variables
let token = null;
let allPlaces = [];
let allAmenities = [];
let currentFilters = {
  price: null,
  search: '',
  rooms: null,
  capacity: null,
  amenities: []
};

// === INITIALIZATION ON DOM LOAD ===
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing');
  
  // Get token
  token = getCookie('token') || localStorage.getItem('token');
  
  // Check authentication
  checkAuthentication();
  
  // Determine current page
  const currentPage = window.location.pathname;
  
  // Page routing
  if (currentPage.includes('login.html')) {
    document.body.classList.add('login-page');
    setupLoginPage();
  } else if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/')) {
    await setupIndexPage();
  } else if (currentPage.includes('place.html')) {
    await setupPlacePage();
  } else if (currentPage.includes('add_review.html')) {
    setupReviewPage();
  }
  
  // Setup common elements
  setupCommonElements();
});

// === COOKIE MANAGEMENT ===
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// === AUTHENTICATION MANAGEMENT ===
function checkAuthentication() {
  console.log('Checking authentication...');
  
  const loginLink = document.getElementById('login-link') || document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const addReviewSection = document.getElementById('add-review');
  
  if (loginLink) {
    if (!token) {
      loginLink.style.display = 'block';
      loginLink.textContent = 'Login';
      loginLink.onclick = () => window.location.href = 'login.html';
    } else {
      loginLink.style.display = 'block';
      loginLink.textContent = 'Logout';
      loginLink.onclick = logoutUser;
    }
  }
  
  if (logoutButton) {
    logoutButton.style.display = token ? 'block' : 'none';
  }
  
  if (addReviewSection) {
    addReviewSection.style.display = token ? 'block' : 'none';
  }
  
  // Redirect if not authenticated only for pages that require it
  const isLoginPage = window.location.pathname.includes('login.html');
  const isIndexPage = window.location.pathname.includes('index.html') || 
                     window.location.pathname === '/' || 
                     window.location.pathname.endsWith('/');
  
  // Allow access to index and login without token
  if (!token && !isLoginPage && !isIndexPage) {
    window.location.href = 'login.html';
    return;
  }
  
  // Display authentication status
  if (token) {
    displayAuthStatus();
  }
  
  return token;
}

async function displayAuthStatus() {
  const authStatusDiv = document.getElementById('auth-status');
  if (!authStatusDiv || !token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const user = await response.json();
      authStatusDiv.innerHTML = `
        <span>Welcome ${user.name || user.first_name || user.email}</span>
        <button id="logout-button" class="logout-button">Logout</button>
      `;
      
      // Reattach logout event
      document.getElementById('logout-button').addEventListener('click', logoutUser);
    } else {
      throw new Error(errorData.message || 'Error adding review');
    }
  } catch (error) {
    console.error('Error adding review:', error);
    return { success: false, message: error.message };
  }
}

function setupReviewForm() {
  const reviewForm = document.getElementById('review-form');
  const placeId = getPlaceIdFromURL();
  
  if (!reviewForm || !token || !placeId) {
    return;
  }

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const reviewText = document.getElementById('review-text') || document.getElementById('review');
    const ratingInput = document.getElementById('rating');
    
    if (!reviewText) {
      showError('Review field not found');
      return;
    }
    
    const review = reviewText.value.trim();
    const rating = ratingInput ? parseInt(ratingInput.value) : null;

    if (!review) {
      showError('Please enter a review');
      return;
    }
    
    if (ratingInput && (!rating || rating < 1 || rating > 5)) {
      showError('Please select a rating between 1 and 5');
      return;
    }

    try {
      const result = await submitReview(token, placeId, review, rating);
      
      const successMessage = document.getElementById('success-message');
      const errorMessage = document.getElementById('error-message');
      
      if (result.success) {
        if (successMessage) {
          successMessage.textContent = result.message;
          successMessage.style.display = 'block';
        }
        if (errorMessage) {
          errorMessage.style.display = 'none';
        }
        reviewForm.reset();
        
        // Reload reviews
        setTimeout(() => {
          fetchPlaceReviews(token, placeId);
        }, 1000);
        
        // If on add_review page, redirect
        if (window.location.pathname.includes('add_review.html')) {
          setTimeout(() => {
            window.location.href = `place.html?id=${placeId}`;
          }, 2000);
        }
      } else {
        if (errorMessage) {
          errorMessage.textContent = result.message;
          errorMessage.style.display = 'block';
        }
        if (successMessage) {
          successMessage.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to submit review. Please try again.');
    }
  });
}

// === DISPLAY UTILITIES ===
function generateStarRating(rating) {
  if (!rating) return '☆☆☆☆☆';
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let stars = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  
  // Half star (optional)
  if (hasHalfStar) {
    stars += '☆';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }
  
  return stars;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

function updateResultsCount(count) {
  const resultsCount = document.getElementById('results-count');
  if (resultsCount) {
    resultsCount.textContent = `${count} place${count > 1 ? 's' : ''} found`;
  }
}

// === SUCCESS AND ERROR MESSAGES ===
function showSuccess(message) {
  const successDiv = document.getElementById('success-message') || createMessageDiv('success');
  successDiv.textContent = message;
  successDiv.classList.add('show');
  successDiv.style.display = 'block';
  
  setTimeout(() => {
    successDiv.classList.remove('show');
    successDiv.style.display = 'none';
  }, 3000);
}

function showError(message) {
  const errorDiv = document.getElementById('error-message') || createMessageDiv('error');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.classList.remove('show');
    errorDiv.style.display = 'none';
  }, 5000);
}

function createMessageDiv(type) {
  let div = document.getElementById(`${type}-message`);
  if (!div) {
    div = document.createElement('div');
    div.id = `${type}-message`;
    div.className = `message ${type}-message`;
    div.style.display = 'none';
    
    // Insert at top of page
    const main = document.querySelector('main') || document.body;
    main.insertBefore(div, main.firstChild);
  }
  return div;
}

// === MAIN EVENT HANDLERS ===
function handleLoginPage() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      await loginUser(email, password);
    });
  }
}

function handleIndexPage(token) {
  // Use new setupIndexPage logic
  if (typeof setupIndexPage === 'function') {
    setupIndexPage();
  } else {
    // Fallback to old logic - try even without token
    fetchPlaces(null, token).then(places => {
      if (places && places.length > 0) {
        // Places could be loaded
        allPlaces = places;
      } else if (!token) {
        // No token and no places, show public message
        showPublicMessage();
      }
    }).catch(error => {
      if (!token) {
        showPublicMessage();
      }
    });
    
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
      priceFilter.addEventListener('change', filterPlacesByPrice);
    }
  }
}

function handlePlacePage(token) {
  const placeId = getPlaceIdFromURL();
  
  if (!placeId) {
    window.location.href = 'index.html';
    return;
  }
  
  fetchPlaceDetails(token, placeId);
  
  const addReviewSection = document.getElementById('add-review');
  if (addReviewSection && token) {
    addReviewSection.style.display = 'block';
    
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const reviewText = document.getElementById('review-text').value;
        const rating = document.getElementById('rating').value;
        
        const result = await submitReview(token, placeId, reviewText, rating);
        
        if (result.success) {
          alert(result.message);
          reviewForm.reset();
          await fetchPlaceReviews(token, placeId);
        } else {
          alert(result.message);
        }
      });
    }
  }
}

function handleAddReviewPage(token) {
  if (!token) {
    window.location.href = 'index.html';
    return;
  }
  
  const placeId = getPlaceIdFromURL();
  if (!placeId) {
    window.location.href = 'index.html';
    return;
  }
  
  setupReviewForm();
}

// Function to show public welcome message
function showPublicMessage() {
  const placesContainer = document.getElementById('places-list');
  if (placesContainer) {
    placesContainer.innerHTML = `
      <div class="public-message">
        <h2>Welcome to HBnB</h2>
        <p>Discover unique accommodations around the world.</p>
        <p>
          <a href="login.html" class="login-cta">Login</a> 
          to see all available places and make reservations.
        </p>
      </div>
    `;
  }
}

// === ROUTING COMPATIBLE WITH YOUR ORIGINAL CODE ===
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop();
  
  // Check authentication
  const authToken = checkAuthentication();
  
  // Page routing - compatible with your original logic
  switch (currentPage) {
    case 'login.html':
      handleLoginPage();
      break;
      
    case 'index.html':
    case '':
      handleIndexPage(authToken);
      break;
      
    case 'place.html':
      handlePlacePage(authToken);
      break;
      
    case 'add_review.html':
      handleAddReviewPage(authToken);
      break;
  }
});

// === EXPORT FUNCTIONS FOR EXTERNAL USE ===
window.HBnBApp = {
  // Public API to interact with the application
  getToken: () => token,
  getAllPlaces: () => allPlaces,
  getAllAmenities: () => allAmenities,
  applyFilters: applyFilters,
  searchPlaces: (query) => {
    currentFilters.search = query.toLowerCase();
    applyFilters();
  },
  filterByAmenities: (amenityIds) => {
    currentFilters.amenities = amenityIds;
    applyFilters();
  },
  refreshData: async () => {
    try {
      const [places, amenities] = await Promise.all([
        fetchPlaces(),
        fetchAmenities()
      ]);
      allPlaces = places;
      allAmenities = amenities;
      applyFilters();
      generateAmenitiesFilters();
      return { places, amenities };
    } catch (error) {
      console.error('Error refreshing data:', error);
      throw error;
    }
  }
};

// === GLOBAL ERROR HANDLING ===
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showError('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showError('Connection error. Check your internet connection.');
});

// === DEBUG AND DEVELOPMENT ===
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Development mode - expose debug functions
  window.DEBUG = {
    token,
    allPlaces,
    allAmenities,
    currentFilters,
    API_BASE_URL,
    // Useful debug functions
    testAPI: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/places`);
        console.log('API Test:', response.status, await response.json());
      } catch (error) {
        console.error('API Test failed:', error);
      }
    },
    simulateLogin: () => {
      token = 'debug-token';
      localStorage.setItem('token', token);
      checkAuthentication();
    }
  };
  
  console.log('HBnB App loaded in development mode');
  console.log('Available debug functions:', Object.keys(window.DEBUG));
  ('Failed to fetch user info');

} else (error)
  console.error('Failed to fetch user info:', error);
    // Invalid token, logout
  logoutUser();


// === PAGE SETUP ===
function setupLoginPage() {
  // If already logged in, redirect to index
  if (token) {
    window.location.href = 'index.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      
      if (!email || !password) {
        showError('Please enter your email and password');
        return;
      }
      
      await loginUser(email, password);
    });
  }
}

async function setupIndexPage() {
  try {
    // Load amenities even without token
    const amenities = await fetchAmenities();
    allAmenities = amenities;
    
    // If we have a token, load places with authentication
    if (token) {
      const places = await fetchPlaces();
      allPlaces = places;
      displayPlaces(allPlaces);
    } else {
      // Try to load places without authentication
      try {
        const places = await fetchPlaces();
        allPlaces = places;
        displayPlaces(allPlaces);
      } catch (error) {
        console.log('Places need authentication, showing login message');
        showPublicMessage();
      }
    }
    
    // Setup dynamic elements
    setupAdvancedFilters();
    setupSearchBar();
    setupSorting();
    setupDetailsNavigation();
    
    // Generate amenities filters dynamically
    generateAmenitiesFilters();
    
  } catch (error) {
    console.error('Error setting up index page:', error);
    showError('Error loading page');
  }
}

async function setupPlacePage() {
  const placeId = getPlaceIdFromURL();
  if (!placeId) {
    showError('Missing place ID');
    return;
  }
  
  try {
    await loadPlaceDetails(placeId);
  } catch (error) {
    console.error('Error setting up place page:', error);
    showError('Error loading place details');
  }
}

function setupReviewPage() {
  setupReviewForm();
}

function setupCommonElements() {
  // Setup logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logoutUser);
  }
}

// === LOGIN MANAGEMENT ===
async function loginUser(email, password) {
  console.log('Logging in...');
  const submitButton = document.getElementById('submit-button') || document.querySelector('button[type="submit"]');
  
  // Handle loading button
  if (submitButton) {
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Logging in...';
  }
  
  try {
    console.log('Sending request to:', `${API_BASE_URL}/auth/login`);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Login successful, storing token');
      
      // Store token
      token = data.access_token;
      localStorage.setItem('token', data.access_token);
      setCookie('token', data.access_token);
      
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      
      // Success message
      showSuccess('Login successful! Redirecting...');
      
      // Redirect with delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Login error. Please check your credentials.');
  } finally {
    // Restore button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Login';
    }
  }
}

function logoutUser() {
  console.log('Logging out');
  
  // Remove tokens
  token = null;
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  deleteCookie('token');
  
  // Redirect to login page
  window.location.href = 'login.html';
}

// Legacy logout function compatible with your original code
function logout() {
  logoutUser();
}

// === AMENITIES MANAGEMENT ===
async function fetchAmenities() {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/amenities`, {
      method: 'GET',
      headers: headers
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.amenities || data;
    } else {
      console.warn('Failed to fetch amenities, using fallback');
      return generateFallbackAmenities();
    }
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return generateFallbackAmenities();
  }
}

function generateFallbackAmenities() {
  return [
    { id: 'wifi', name: 'WiFi', icon: '📶' },
    { id: 'parking', name: 'Parking', icon: '🚗' },
    { id: 'pool', name: 'Pool', icon: '🏊' },
    { id: 'gym', name: 'Gym', icon: '🏋️' },
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
    { id: 'spa', name: 'Spa', icon: '🧖' },
    { id: 'laundry', name: 'Laundry', icon: '👕' },
    { id: 'petfriendly', name: 'Pet Friendly', icon: '🐕' },
    { id: 'balcony', name: 'Balcony', icon: '🏠' },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳' },
    { id: 'ac', name: 'Air Conditioning', icon: '❄️' },
    { id: 'heating', name: 'Heating', icon: '🔥' }
  ];
}

function generateAmenitiesFilters() {
  const amenitiesContainer = document.getElementById('amenities-filters');
  if (!amenitiesContainer || !allAmenities.length) return;
  
  amenitiesContainer.innerHTML = '<h4>Amenities</h4>';
  
  allAmenities.forEach(amenity => {
    const amenityDiv = document.createElement('div');
    amenityDiv.className = 'amenity-filter';
    amenityDiv.innerHTML = `
      <label class="amenity-label">
        <input type="checkbox" value="${amenity.id || amenity.name}" class="amenity-checkbox">
        <span class="amenity-icon">${amenity.icon || '•'}</span>
        <span class="amenity-name">${amenity.name}</span>
      </label>
    `;
    amenitiesContainer.appendChild(amenityDiv);
  });
  
  const checkboxes = amenitiesContainer.querySelectorAll('.amenity-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      updateAmenitiesFilter();
    });
  });
}

function updateAmenitiesFilter() {
  const checkboxes = document.querySelectorAll('.amenity-checkbox:checked');
  currentFilters.amenities = Array.from(checkboxes).map(cb => cb.value);
  applyFilters();
}

// === PLACES MANAGEMENT ===
async function fetchPlaces(maxPrice = null, token = null) {
  try {
    let url = `${API_BASE_URL}/places`;
    if (maxPrice) {
      url += `?max_price=${maxPrice}`;
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Use global token or passed token
    const authToken = token || window.token;
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    if (response.ok) {
      const data = await response.json();
      const places = data.places || data;
      
      // Process amenities for each place and map your fields
      return places.map(place => ({
        ...place,
        // Mapping your fields to expected fields
        title: place.name || place.title_of_the_place || place.title,
        description: place.description_of_the_place || place.description,
        price: place.price_per_night || place.price,
        city: place.city || 'Unknown city',
        country: place.country || 'Unknown country',
        // Keep your original fields
        name: place.name,
        title_of_the_place: place.title_of_the_place,
        description_of_the_place: place.description_of_the_place,
        price_per_night: place.price_per_night,
        latitude: place.latitude,
        longitude: place.longitude,
        owner_id: place.owner_id,
        owner: place.owner,
        rooms: place.rooms,
        capacity: place.capacity,
        surface: place.surface,
        amenities: place.amenities,
        reviews: place.reviews,
        // Process amenities
        amenities_list: parseAmenities(place.amenities),
        amenities_display: formatAmenitiesDisplay(place.amenities)
      }));
    } else if (response.status === 401) {
      // If unauthorized and no token, throw specific error
      if (!authToken) {
        throw new Error('AUTHENTICATION_REQUIRED');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching places:', error);
    
    // If authentication is required, don't show generic error
    if (error.message === 'AUTHENTICATION_REQUIRED') {
      throw error;
    }
    
    showError('Error loading places. Please try again later.');
    return [];
  }
}

function parseAmenities(amenitiesString) {
  if (!amenitiesString) return [];
  
  if (Array.isArray(amenitiesString)) return amenitiesString;
  
  return amenitiesString
    .split(',')
    .map(amenity => amenity.trim())
    .filter(amenity => amenity.length > 0);
}

function formatAmenitiesDisplay(amenities) {
  const amenitiesList = parseAmenities(amenities);
  
  return amenitiesList.map(amenityName => {
    const amenityObj = allAmenities.find(a => 
      a.name.toLowerCase() === amenityName.toLowerCase() ||
      a.id === amenityName.toLowerCase()
    );
    
    if (amenityObj) {
      return `<span class="amenity-tag">${amenityObj.icon} ${amenityObj.name}</span>`;
    } else {
      return `<span class="amenity-tag">• ${amenityName}</span>`;
    }
  }).join(' ');
}

// === PLACES DISPLAY (Compatible with your structure) ===
function displayPlaces(places) {
  const placesContainer = document.getElementById('places-list');
  if (!placesContainer) {
    console.error('Places container not found');
    return;
  }
  
  placesContainer.innerHTML = '';
  
  if (!places || places.length === 0) {
    placesContainer.innerHTML = '<p>No places available.</p>';
    return;
  }
  
  places.forEach(place => {
    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';
    placeCard.dataset.id = place.id;
    placeCard.dataset.price = place.price_per_night || place.price;
    
    placeCard.innerHTML = `
      <div class="place-info">
        <h3>${place.name}</h3>
        <p class="place-title">${place.title_of_the_place}</p>
        <p class="place-description">${place.description_of_the_place}</p>
        <p class="place-price">${place.price_per_night}€ / night</p>
        <p class="place-latitude">${place.latitude}</p>
        <p class="place-longitude">${place.longitude}</p>
        <p class="place-owner_id">${place.owner_id}</p>
        <p class="place-owner">${place.owner}</p>
        <p class="place-rooms">${place.rooms}</p>
        <p class="place-capacity">${place.capacity}</p>
        <p class="place-surface">${place.surface}</p>
        <p class="place-amenities">${place.amenities}</p>
        <p class="place-reviews">${place.reviews}</p>
        <button class="details-button" onclick="window.location.href='place.html?id=${place.id}'">
          View Details
        </button>
      </div>
    `;
    
    placesContainer.appendChild(placeCard);
  });
}

// === FILTERS ===
function setupAdvancedFilters() {
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter) {
    priceFilter.addEventListener('change', (event) => {
      currentFilters.price = event.target.value || null;
      applyFilters();
    });
  }
  
  const roomsFilter = document.getElementById('rooms-filter');
  if (roomsFilter) {
    roomsFilter.addEventListener('change', (event) => {
      currentFilters.rooms = event.target.value || null;
      applyFilters();
    });
  }
  
  const capacityFilter = document.getElementById('capacity-filter');
  if (capacityFilter) {
    capacityFilter.addEventListener('change', (event) => {
      currentFilters.capacity = event.target.value || null;
      applyFilters();
    });
  }
}

function filterPlacesByPrice() {
  const filterValue = document.getElementById('price-filter').value;
  const placeCards = document.querySelectorAll('.place-card');

  placeCards.forEach(card => {
    const price = parseFloat(card.dataset.price);
    
    if (filterValue === 'all') {
      card.style.display = 'block';
    } else {
      const maxPrice = parseFloat(filterValue);
      card.style.display = price <= maxPrice ? 'block' : 'none';
    }
  });
}

function setupSearchBar() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (event) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilters.search = event.target.value.toLowerCase().trim();
        applyFilters();
      }, 300);
    });
  }
}

function setupSorting() {
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      const sortType = event.target.value;
      const sortedPlaces = sortPlaces([...allPlaces], sortType);
      const filteredPlaces = applyFiltersToPlaces(sortedPlaces);
      displayPlaces(filteredPlaces);
    });
  }
}

function sortPlaces(places, sortType) {
  switch (sortType) {
    case 'price-asc':
      return places.sort((a, b) => parseFloat(a.price_per_night || a.price) - parseFloat(b.price_per_night || b.price));
    case 'price-desc':
      return places.sort((a, b) => parseFloat(b.price_per_night || b.price) - parseFloat(a.price_per_night || a.price));
    case 'title-asc':
      return places.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title));
    case 'title-desc':
      return places.sort((a, b) => (b.name || b.title).localeCompare(a.name || a.title));
    case 'capacity-asc':
      return places.sort((a, b) => parseInt(a.capacity) - parseInt(b.capacity));
    case 'capacity-desc':
      return places.sort((a, b) => parseInt(b.capacity) - parseInt(a.capacity));
    case 'rooms-asc':
      return places.sort((a, b) => parseInt(a.rooms) - parseInt(b.rooms));
    case 'rooms-desc':
      return places.sort((a, b) => parseInt(b.rooms) - parseInt(a.rooms));
    default:
      return places;
  }
}

function applyFilters() {
  const filteredPlaces = applyFiltersToPlaces(allPlaces);
  displayPlaces(filteredPlaces);
  updateResultsCount(filteredPlaces.length);
}

function applyFiltersToPlaces(places) {
  return places.filter(place => {
    const price = place.price_per_night || place.price;
    
    if (currentFilters.price && parseFloat(price) > parseFloat(currentFilters.price)) {
      return false;
    }
    
    if (currentFilters.search) {
      const searchTerm = currentFilters.search;
      const searchableText = `${place.name} ${place.title_of_the_place} ${place.description_of_the_place} ${place.amenities || ''} ${place.city || ''}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    if (currentFilters.rooms && parseInt(place.rooms) < parseInt(currentFilters.rooms)) {
      return false;
    }
    
    if (currentFilters.capacity && parseInt(place.capacity) < parseInt(currentFilters.capacity)) {
      return false;
    }
    
    if (currentFilters.amenities.length > 0) {
      const placeAmenities = place.amenities_list || parseAmenities(place.amenities);
      const hasAllAmenities = currentFilters.amenities.every(filterAmenity => {
        return placeAmenities.some(placeAmenity => 
          placeAmenity.toLowerCase().includes(filterAmenity.toLowerCase()) ||
          filterAmenity.toLowerCase().includes(placeAmenity.toLowerCase())
        );
      });
      
      if (!hasAllAmenities) {
        return false;
      }
    }
    
    return true;
  });
}

function setupDetailsNavigation() {
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('details-button')) {
      const placeCard = event.target.closest('.place-card');
      const placeId = placeCard?.dataset.id;
      
      if (placeId) {
        window.location.href = `place.html?id=${placeId}`;
      } else {
        showError('Unable to find place ID');
      }
    }
  });
}

// === PLACE DETAILS MANAGEMENT ===
function getPlaceIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function loadPlaceDetails(placeId) {
  try {
    await fetchPlaceDetails(token, placeId);
  } catch (error) {
    console.error('Error loading place details:', error);
    showError('Error loading place details');
  }
}

async function fetchPlaceDetails(token, placeId) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/places/${placeId}`, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const place = await response.json();
      displayPlaceDetails(place);
      await fetchPlaceReviews(token, placeId);
    } else {
      throw new Error('Unable to retrieve place details');
    }
  } catch (error) {
    console.error('Error loading details:', error);
    const detailsContainer = document.getElementById('place-details');
    if (detailsContainer) {
      detailsContainer.innerHTML = '<p>Error loading details.</p>';
    }
  }
}

function displayPlaceDetails(place) {
  const detailsContainer = document.getElementById('place-details');
  if (!detailsContainer) return;

  detailsContainer.innerHTML = `
    <div class="place-header">
      <h1>${place.name}</h1>
      <div class="place-location">${place.city || 'Unknown city'}, ${place.country || 'Unknown country'}</div>
    </div>
    
    <div class="place-main-info">
      <div class="place-image-main">
        <img src="placeholder-image.jpg" alt="${place.name}" onerror="this.src='https://via.placeholder.com/600x400?text=Image+not+available'">
      </div>
      
      <div class="place-info">
        <div class="price-section">
          <span class="price">${place.price_per_night}€</span>
          <span class="price-unit">/ night</span>
        </div>
        
        <div class="host-info">
          <h3>Hosted by ${place.host ? place.host.first_name + ' ' + place.host.last_name : place.owner || 'Unknown host'}</h3>
        </div>
        
        <div class="place-description">
          <h3>Description</h3>
          <p>${place.description || place.description_of_the_place}</p>
        </div>
        
        <div class="place-features">
          <h3>Features</h3>
          <div class="features-grid">
            <div class="feature-item">
              <span class="feature-icon">🛏️</span>
              <span class="feature-label">Bedrooms</span>
              <span class="feature-value">${place.rooms}</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">👥</span>
              <span class="feature-label">Capacity</span>
              <span class="feature-value">${place.capacity} guests</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📐</span>
              <span class="feature-label">Surface</span>
              <span class="feature-value">${place.surface}m²</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📍</span>
              <span class="feature-label">Location</span>
              <span class="feature-value">${place.latitude}, ${place.longitude}</span>
            </div>
          </div>
        </div>
        
        ${place.amenities ? `
          <div class="amenities">
            <h3>Amenities</h3>
            <div class="amenities-grid">
              ${parseAmenities(place.amenities).map(amenity => `<span class="amenity-tag">• ${amenity}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// === REVIEWS MANAGEMENT ===
async function fetchPlaceReviews(token, placeId) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/places/${placeId}/reviews`, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const reviews = await response.json();
      displayReviews(reviews);
    }
  } catch (error) {
    console.error('Error loading reviews:', error);
  }
}

function displayReviews(reviews) {
  const reviewsContainer = document.getElementById('reviews-list');
  if (!reviewsContainer) return;

  if (!reviews || reviews.length === 0) {
    reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
    return;
  }

  reviewsContainer.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <span class="reviewer-name">${review.user ? review.user.first_name + ' ' + review.user.last_name : 'Anonymous user'}</span>
        <span class="review-rating">${generateStarRating(review.rating)}</span>
      </div>
      <div class="review-comment">${review.comment || review.text}</div>
      <div class="review-date">${formatDate(review.created_at)}</div>
    </div>
  `).join('');
}

async function submitReview(token, placeId, reviewText, rating) {
  try {
    const response = await fetch(`${API_BASE_URL}/places/${placeId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        comment: reviewText,
        rating: parseInt(rating)
      })
    });

    if (response.ok) {
      return { success: true, message: 'Review added successfully!' };
    } else {
      const errorData = await response.json();
      throw new Error
    }
  } catch (error) {}
}

