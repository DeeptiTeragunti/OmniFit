export const authConfig = {
  clientId: 'oauth2-pkce-client',
  // The library defaults to redirecting to Keycloak immediately on load, which never gives
  // our own login screen a chance to render. We want login to be an explicit user action.
  autoLogin: false,
  authorizationEndpoint: 'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/auth',
  tokenEndpoint: 'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/token',
  logoutEndpoint: 'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/logout',
  redirectUri: 'http://localhost:5173',
  // no offline_access - the Keycloak client (Phase 2) doesn't grant it, and a regular
  // refresh token (tied to the SSO session) is the safer default anyway.
  scope: 'openid profile email',
  onRefreshTokenExpire: (event) => event.logIn(),
}
