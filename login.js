document.addEventListener('DOMContentLoaded', () => {
    const googleSignInButton = document.getElementById('googleSignInButton');
  
    googleSignInButton.addEventListener('click', () => {
      // Initiate OAuth 2.0 flow
      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (chrome.runtime.lastError || !token) {
          console.error(chrome.runtime.lastError);
          alert('Authentication failed: ' + chrome.runtime.lastError.message);
          return;
        }
  
        // Token acquired, you can now make API calls
        // Optionally, get user info
        fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token)
          .then(response => response.json())
          .then(userInfo => {
            // Save user info in storage if needed
            chrome.storage.sync.set({ userInfo: userInfo }, () => {
              // Redirect to main extension page
              window.location.href = 'popup.html';
            });
          })
          .catch(error => {
            console.error('Error fetching user info:', error);
          });
      });
    });
  });
  