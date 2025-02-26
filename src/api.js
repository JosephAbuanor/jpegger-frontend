export const apiBaseUrl = 'https://nf0yzo9cmf.execute-api.eu-central-1.amazonaws.com/Prod';

export const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_S4L0y0W2I",
  client_id: "5dcrjp1hhvtb5g9qof7j3qait8",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid",
};

export const signOutRedirect = () => {
  const clientId = "5dcrjp1hhvtb5g9qof7j3qait8";
  const logoutUri = "<logout uri>";
  const cognitoDomain = "https://5dcrjp1hhvtb5g9qof7j3qait8.auth.eu-central-1.amazoncognito.com";
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};