document.addEventListener('DOMContentLoaded', () => {
    const getLocationButton = document.getElementById('getLocationButton');
    const placeTypeSection = document.getElementById('place-type-section');
    const placeTypeSelect = document.getElementById('place-type-select');
    const radiusSlider = document.getElementById('radius-slider');
    const radiusValueDisplay = document.getElementById('radius-value');
    const searchPlacesButton = document.getElementById('searchPlacesButton');
    const locationInfoDiv = document.getElementById('location-info');
    const mapDiv = document.getElementById('map');
    const addressDiv = document.getElementById('address');
    const placesDiv = document.getElementById('places');
  
    const API_KEY = 'GOOGLE_API_KEY'; // Replace with your actual API key
    let currentLatitude = null;
    let currentLongitude = null;
  
    getLocationButton.addEventListener('click', () => {
      // Clear previous results
      locationInfoDiv.innerHTML = '';
      mapDiv.innerHTML = '';
      addressDiv.innerHTML = '';
      placesDiv.innerHTML = '';
      placeTypeSection.style.display = 'none';
      getLocationButton.disabled = true;
      getLocationButton.textContent = 'Loading...';
  
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
      } else {
        locationInfoDiv.innerHTML = "<p class='error'>Geolocation is not supported by this browser.</p>";
        resetButton();
      }
    });
  
    function showPosition(position) {
      currentLatitude = position.coords.latitude;
      currentLongitude = position.coords.longitude;
  
      locationInfoDiv.innerHTML = `
        <strong>Your Location:</strong>
        <p>Latitude: ${currentLatitude.toFixed(4)}</p>
        <p>Longitude: ${currentLongitude.toFixed(4)}</p>
      `;
  
      // Display the map
      displayMap(currentLatitude, currentLongitude);
  
      // Fetch address
      fetchAddress(currentLatitude, currentLongitude);
  
      // Show place type and radius selection
      placeTypeSection.style.display = 'block';
  
      resetButton();
    }
  
    function displayMap(latitude, longitude) {
      mapDiv.innerHTML = `
        <img src="https://corsproxy.io/?https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=300x200&scale=2&markers=color:red%7C${latitude},${longitude}&key=${API_KEY}" alt="Map of your location">
      `;
    }
  
    function fetchAddress(latitude, longitude) {
      const geocodingUrl = `https://corsproxy.io/?https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
  
      fetch(geocodingUrl)
        .then(response => response.json())
        .then(data => {
          if (data.status === "OK" && data.results.length > 0) {
            addressDiv.innerHTML = `
              <strong>Address:</strong>
              <p>${data.results[0].formatted_address}</p>
            `;
          } else {
            addressDiv.innerHTML = "<p class='error'>Address not found.</p>";
          }
        })
        .catch(error => {
          addressDiv.innerHTML = `<p class='error'>Error fetching address: ${error.message}</p>`;
        });
    }
  
    // Update radius value display when the slider is adjusted
    radiusSlider.addEventListener('input', () => {
      radiusValueDisplay.textContent = radiusSlider.value;
    });
  
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
      resetButton();
    }
  
    function resetButton() {
      getLocationButton.disabled = false;
      getLocationButton.textContent = 'Get Current Location';
    }
  
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  });
  