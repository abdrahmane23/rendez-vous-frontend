import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'Rendez-vous',
  clientId: 'Rendez-vous-frontend',
});

export const initKeycloak = (onAuthenticatedCallback) => {
  keycloak.init({ 
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html' 
  })
    .then((authenticated) => {
      if (authenticated) {
        // Token refresh logic: refresh if token expires in < 70 seconds
        setInterval(() => {
          keycloak.updateToken(70).catch(() => {
            console.error('Failed to refresh token');
          });
        }, 60000);
      }
      onAuthenticatedCallback();
    })
    .catch(err => {
      console.error("Initialization failed", err);
    });
};

export default keycloak;