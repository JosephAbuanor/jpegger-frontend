export const apiBaseUrl = 'https://nf0yzo9cmf.execute-api.eu-central-1.amazonaws.com/Prod';

export const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_1WJKGNgVF",
  client_id: "2pv58vgq9gp1emiaa7r9m3bega",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid",
};

export const signOutRedirect = () => {
  const clientId = "2pv58vgq9gp1emiaa7r9m3bega";
  const logoutUri = "<logout uri>";
  const cognitoDomain = "https://2pv58vgq9gp1emiaa7r9m3bega.auth.eu-central-1.amazoncognito.com";
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

// env or
// parameter store to manage the switch in zones