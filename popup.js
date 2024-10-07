document.addEventListener('DOMContentLoaded', () => {
  // Page elements
  const homePage = document.getElementById('home-page');
  const searchPage = document.getElementById('search-page');

  // Home Page elements
  const getLocationButton = document.getElementById('getLocationButton');
  const findPlacesButton = document.getElementById('findPlacesButton');
  const locationInfoDiv = document.getElementById('location-info');
  const mapDiv = document.getElementById('map');

  // Search Page elements
  const backButton = document.getElementById('backButton');
  const placeTypeSelect = document.getElementById('place-type-select');
  const radiusSlider = document.getElementById('radius-slider');
  const radiusValueDisplay = document.getElementById('radius-value');
  const searchPlacesButton = document.getElementById('searchPlacesButton');
  const placesDiv = document.getElementById('places');

  const API_KEY = 'AIzaSyCjpqV727AQifxH6OJu0b9-oPjOQGenafI'; // Replace with your actual API key
  let currentLatitude = null;
  let currentLongitude = null;

  // Home Page - Get Current Location
  getLocationButton.addEventListener('click', () => {
    // Clear previous results
    locationInfoDiv.innerHTML = '';
    mapDiv.innerHTML = '';
    findPlacesButton.style.display = 'none';

    getLocationButton.disabled = true;
    getLocationButton.textContent = 'Loading...';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      locationInfoDiv.innerHTML = "<p class='error'>Geolocation is not supported by this browser.</p>";
      resetGetLocationButton();
    }
  });

  function showPosition(position) {
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;

    // Fetch address
    fetchAddress(currentLatitude, currentLongitude);

    // Display location info
    locationInfoDiv.innerHTML = `
      <strong>Your Location:</strong>
      <p>Latitude: ${currentLatitude.toFixed(4)}</p>
      <p>Longitude: ${currentLongitude.toFixed(4)}</p>
    `;

    // Display the map
    displayMap(currentLatitude, currentLongitude);

    // Show the "Find Nearby Places" button
    findPlacesButton.style.display = 'block';

    resetGetLocationButton();
  }

  function displayMap(latitude, longitude) {
    mapDiv.innerHTML = `
      <img src="https://corsproxy.io/?https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=500x300&scale=2&markers=color:red%7C${latitude},${longitude}&key=${API_KEY}" alt="Map of your location">
    `;
  }

  function fetchAddress(latitude, longitude) {
    const geocodingUrl = `https://corsproxy.io/?https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;

    fetch(geocodingUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK" && data.results.length > 0) {
          locationInfoDiv.innerHTML += `
            <p><strong>Address:</strong></p>
            <p>${data.results[0].formatted_address}</p>
          `;
        } else {
          locationInfoDiv.innerHTML += "<p class='error'>Address not found.</p>";
        }
      })
      .catch(error => {
        locationInfoDiv.innerHTML += `<p class='error'>Error fetching address: ${error.message}</p>`;
      });
  }

  function resetGetLocationButton() {
    getLocationButton.disabled = false;
    getLocationButton.textContent = 'Get Current Location';
  }

  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        locationInfoDiv.innerHTML = "<p class='error'>User denied the request for Geolocation.</p>";
        break;
      case error.POSITION_UNAVAILABLE:
        locationInfoDiv.innerHTML = "<p class='error'>Location information is unavailable.</p>";
        break;
      case error.TIMEOUT:
        locationInfoDiv.innerHTML = "<p class='error'>The request to get user location timed out.</p>";
        break;
      case error.UNKNOWN_ERROR:
        locationInfoDiv.innerHTML = "<p class='error'>An unknown error occurred.</p>";
        break;
    }
    resetGetLocationButton();
  }

  // Navigate to Search Page
  findPlacesButton.addEventListener('click', () => {
    homePage.style.display = 'none';
    searchPage.style.display = 'block';
  });

  // Back Button - Navigate to Home Page
  backButton.addEventListener('click', () => {
    searchPage.style.display = 'none';
    homePage.style.display = 'block';
    // Optionally, clear previous search results
    placesDiv.innerHTML = '';
    radiusSlider.value = '1500';
    radiusValueDisplay.textContent = '1500';
    placeTypeSelect.selectedIndex = 0;
  });

  // Search Page - Radius Slider Update
  radiusSlider.addEventListener('input', () => {
    radiusValueDisplay.textContent = radiusSlider.value;
  });

  // Search Page - Search Places
  searchPlacesButton.addEventListener('click', () => {
    // Clear previous places
    placesDiv.innerHTML = '';
    searchPlacesButton.disabled = true;
    searchPlacesButton.textContent = 'Searching...';

    const selectedPlaceType = placeTypeSelect.value;
    const selectedRadius = radiusSlider.value;
    fetchPlaces(currentLatitude, currentLongitude, selectedPlaceType, selectedRadius);
  });

  function fetchPlaces(latitude, longitude, placeType, radius) {
    const placesUrl = `https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${placeType}&key=${API_KEY}`;

    fetch(placesUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === "OK" && data.results.length > 0) {
          placesDiv.innerHTML = `
            <strong>Nearby ${capitalizeFirstLetter(placeType.replace('_', ' '))}:</strong>
            <ul>
              ${data.results.slice(0, 10).map(place => `
                <li>
                  ${place.photos ? `<img src="https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/photo?maxwidth=60&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}" alt="${place.name}">` : '<img src="placeholder.png" alt="No Image">'}
                  <div>
                    <strong>${place.name}</strong>
                    ${place.rating ? `<p>Rating: ${place.rating} ⭐</p>` : ''}
                    ${place.vicinity ? `<p>${place.vicinity}</p>` : ''}
                  </div>
                </li>
              `).join('')}
            </ul>
          `;
        } else {
          placesDiv.innerHTML = `<p>No nearby ${placeType.replace('_', ' ')} found within ${radius} meters.</p>`;
        }
      })
      .catch(error => {
        placesDiv.innerHTML = `<p class='error'>Error fetching places: ${error.message}</p>`;
      })
      .finally(() => {
        searchPlacesButton.disabled = false;
        searchPlacesButton.textContent = 'Search Places';
      });
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});
