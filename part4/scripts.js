const API_BASE_URL = 'http://localhost:5000/api/v1';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing ');

  // Add a login page
  const loginFormPage = document.getElementById('login-form');
    if (loginFormPage) {
      document.body.classList.add('login-page');
    }

  checkAuthentication();

// Add an event listener for the form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if (email && password) {
        await loginUser(email, password);
      } else {
        alert('Alert Message');
      }
    });
  }
});

// Make the AJAX request to the API
async function loginUser(email, password) {
  const response = await fetch(API_BASE_URL + '/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password})
  });

// Handle the API response and store the token in cookie
  if (response.ok) {
    const data = await response.json();
    document.cookie = `token=${data.access_token}; path=/`;
    window.location.href = 'index.html';
  } else {
    alert('Login failed: ' + response.statusText);
  }
}

// Check user auhentification: check for the JWT token in cookies
// and control the visibility of the login link
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
    loginLink.style.display = 'Block';
  } else {
    loginLink.style.display = 'none';
    fetchPlaces(token);
  }

  const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn && localStorage.getItem("Token")) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem("Token");
        window.location.href = "login.html";
      });
    }

    document.addEventListener("click", function (event) {
      if (event.target.classList.contains("details-button")) {
        const placeCard = event.target.closest(".place-card");
        const placeId = placeCard?.dataset.id || "1";
        if (placeId) {
          window.location.href = `place.html?id=${placeId}`;
        } else {
          showError("Unable to find place ID");
        }
      }
    });


  const addReviewSection = document.getElementById('add-review');

  if (!token) {
    addReviewSection.style.display = 'none';
  } else {
    addReviewSection.style.display = 'block';
    fetchPlaceDetails(token, placeId);
  }

  if (!token) {
    window.location.href = 'index.html';
  }
  return token;
}

function getCookie(name) {
  const cookieValue = document.cookie.split(';');
  for (let i = 0; i < cookieValue.length; i++) {
    const cookie = cookieValue[i].split('=');
    if (name = cookie[0]) {
      return cookie[1];
    }
  }
}

// Fetch places data: use the Fetch API to get 
// the list of places and handle the response
function fetchPlaces() {
  const container = document.getElementById("places-list");
  const maxPrice = document.getElementById("price-filter")?.value;

  if (!container) return;

  fetch(API_BASE_URL + "/places")
    .then(response => response.json())
    .then(data => {
      container.innerHTML = "";
      data.forEach(place => {
        if (!maxPrice || maxPrice === "All" || place.price <= parseInt(maxPrice)) {
          const item = document.createElement("div");
          item.className = "place-card";
          item.setAttribute("data-id", place.id);
          item.innerHTML = `
            <h2> ${place.title} </h2>
            <p> Description: ${place.description} </p>
            <p> Price: ${place.price} </p>
            <p> Latitude: ${place.latitude} </p>
            <p> Longitude: ${place.longitude} </p>
            <p> Rooms: ${place.rooms} </p>
            <p> Capacity: ${place.capacity} </p>
            <p> Surface: ${place.surface} </p>
            <p> Owner ID: ${place.owner} </p>
            <p> Created at: ${new Date(place.created_at).toLocaleDateString()} </p>
            <p> Updated at: ${new Date(place.updated_at).toLocaleDateString()} </p>
            <button class="details-button"> View Details </button>
          `;
          container.appendChild(item);
        }
      });
    })
    .catch(error => {
      console.error("Error fetching places:", error);
    });
}

async function fetchPlaces(token) {
  try {
    const response = await fetch(`${API_BASE_URL + '/places'}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Bearer ${token}'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      alert('Fetching places failed: ' + response.statusText);
    }
  } catch (error) {
    console.error(error);
  }
}

// Populate places list: create HTML elements 
// for each place and append them to the #places-list
function displayPlaces(places) {
  const PlacesContainer = document.getElementById('places-container');
  if (!PlacesContainer)
    return;

  PlacesContainer.innerHTML = '';
}

// Implement client-side filtering
document.getElementById('price-filter').addEventListener('change', (event) => {

});

// Get place ID from URL
function getPlaceIdFromURL() {

}

// Fetch place details
async function fetchPlaceDetails(token, placeId) {

}

// Populate place details
function displayPlaceDetails(place) {

}

// Setup event listener for review form
document.addEventListener('DOMContentLoaded', () => {
  const reviewForm = document.getElementById('review-form');
  const token = checkAuthentication();
  const placeId = getPlaceIdFromURL();

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
    });

    const token = localStorage.getItem("Token");
      if (!token) {
        showError("You must be logged in to submit a review.");
      return;
      }

    const placeId = document.getElementById("place-id")?.value;
    const review = document.getElementById("review")?.value;
    const rating = document.getElementById("rating")?.value;

      if (!placeId || !review || !rating) {
        showError("Please fill in all fields");
      return;
      }

      try {
        const response = await fetch(API_BASE_URL + `/places/${placeId}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ review, rating })
        });

        if (response.ok) {
          alert("Review submitted successfully!");
          window.location.href = `place.html?id=${placeId}`;
        } else {
          alert("Failed to submit review. Please try again.");
        }
      } catch (error) {
        alert("Server error. Please try again later.");
      }
    });

    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('id');

    if (placeId && document.getElementById("place-title")) {
      fetch(API_BASE_URL + `/places/${placeId}`)
        .then(response => response.json())
        .then(place => {
          document.getElementById("place-title").textContent = place.name;
        });
      
      fetch(API_BASE_URL + `/places/${placeId}/reviews`)
        .then(response => response.json())
        .then(reviews => {
          const reviewSection = document.getElementById("reviews");
          if (reviewSection) {
            reviewSection.innerHTML = `<h2> Reviews </h2>`;
            reviews.forEach(review => {
              const div = document.createElement("div");
              div.className = "review-card";
              div.innerHTML = `<p> ${review.text} </p><small> ${review.user} - Rating: ${review.rating} </p>`
            reviewSection.appendChild(div);            
            });
          };
        });
    }
  
// Make AJAX request to submit review
async function submitReview(token, placeId, reviewText) {

}

// Handle API response
function handleResponse(response) {
  if (response.ok) {
    alert('Review submitted successfully!');
  } else {
    alert('Failed to submit review');
  }
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
  } else {
    alert(message);
  }
}
