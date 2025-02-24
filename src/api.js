export const apiBaseUrl = 'https://hhgapn3j77.execute-api.eu-central-1.amazonaws.com/Prod';

export const cognitoAuthConfig = {
  authority: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_BWEHXT4Tp",
  client_id: "61df6ljed1jmvvts3fl2b1jcja",
  redirect_uri: "https://main.d1ggpxgt9g91jp.amplifyapp.com",
  response_type: "code",
  scope: "aws.cognito.signin.user.admin email openid",
};

export const signOutRedirect = () => {
  const clientId = "61df6ljed1jmvvts3fl2b1jcja";
  const logoutUri = "<logout uri>";
  const cognitoDomain = "https://61df6ljed1jmvvts3fl2b1jcja.auth.eu-central-1.amazoncognito.com";
  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};