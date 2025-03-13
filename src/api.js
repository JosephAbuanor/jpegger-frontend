export const apiBaseUrl = 'https://rmawjdnkq9.execute-api.eu-central-1.amazonaws.com/Prod';

export const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_KPRV58PNq",
  client_id: "4vug47lgce7tq11asejl4791oe",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid",
};

export const signOutRedirect = () => {
  const clientId = "4vug47lgce7tq11asejl4791oe";
  const logoutUri = "<logout uri>";
  const cognitoDomain = "https://4vug47lgce7tq11asejl4791oe.auth.eu-central-1.amazoncognito.com";
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

// env or
// parameter store to manage the switch in zones