export const apiBaseUrl = 'https://xeq4tu82aa.execute-api.eu-central-1.amazonaws.com/Prod';

export const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_0OqH7QaUV",
  client_id: "706l8eiv3c11gb7i0eiei9mj7p",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid",
};

export const signOutRedirect = () => {
  const clientId = "706l8eiv3c11gb7i0eiei9mj7p";
  const logoutUri = "<logout uri>";
  const cognitoDomain = "https://706l8eiv3c11gb7i0eiei9mj7p.auth.eu-central-1.amazoncognito.com";
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

// env or
// parameter store to manage the switch in zones