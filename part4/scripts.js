document.addEventListener('DOMContentLoaded', () => {
    fetchPlaces();

    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener("change", fetchPlaces);
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById("loading-indicator").style.display = "block";

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          const response = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });

          const result = await response.json();
          if (response.ok) {
            localStorage.setItem("Token", result.token);
            window.location.href = "index.html";
          } else {
            showError(result.error || "Login failed. Please try again later");
          }
        } catch (error) {
            showError("Server error. Please try again later");
        } finally {
          document.getElementById("loading-indicator").style.display = "none";
        }
      });
    }

    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn && localStorage.getItem("Token")) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem("Token");
        window.location.href = "login.html";
      });
    }

    const reviewForm = document.getElementById("review-form");
    if (reviewForm) {
      reviewForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("Token");

        const placeId = document.getElementById("place-id")?.value || "PLACE_ID";
        const review = document.getElementById("review").value;
        const rating = document.getElementById("rating").value;

        try {
          const response = await fetch(`http://localhost:8000/api/v1/places/${placeId}/reviews`, {
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
    }

    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('id');
    if (placeId && document.getElementById("place-title")) {
      fetch(`http://localhost:8000/api/v1/places/${placeId}`)
        .then(response => response.json())
        .then(place => {
          document.getElementById("place-title").textContent = place.name;
        });
      
      fetch(`http://localhost:8000/api/v1/places/${placeId}/reviews`)
        .then(response => response.json())
        .then(reviews => {
          const reviewSection = document.getElementById("reviews");
          reviewSection.innerHTML = `<h2> Reviews </h2>`;
          reviews.forEach(review => {
            const div = document.createElement("div");
            div.className = "review-card";
            div.innerHTML = `<p> ${review.text} </p><small> ${review.user} - Rating: ${review.rating} </p>`
            reviewSection.appendChild(div);            
          });
        });
    }
});

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
  } else {
    alert(message);
  }
}

function fetchPlaces() {
  const container = document.getElementById("places-list");
  const maxPrice = document.getElementById("price-filter")?.value;

  if (!container) return;

  fetch("http://localhost:8000/api/v1/places")
    .then(response => response.json())
    .then(data => {
      container.innerHTML = "";
      data.forEach(place => {
        if (!maxPrice || maxPrice === "All" || place.price <= parseInt(maxPrice)) {
          const item = document.createElement("div");
          item.className = "place-card";
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
          `;
          container.appendChild(item);
        }
      });
    })
    .catch(error => {
      console.error("Error fetching places:", error);
    });
}
