const redirectUri =
  process.env.REACT_APP_GAUTH_REDIRECT_URI || "invalid_redirect_uri";

export const validateTokenAndObtainSession = async ({
  data,
  idToken,
}: {
  data: any;
  idToken: string;
}) => {
  const headers = {
    Authorization: idToken,
    "Content-Type": "application/json",
  };

  return await fetch(redirectUri, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  });
};
