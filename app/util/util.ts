import Constants from "expo-constants";
import { encode } from "base-64";

const baseUrl = Constants.manifest.extra.apiUrl;
const redirectUri = `${baseUrl}/auth/v1/oauth/callback`;
const logInUri = `${baseUrl}/auth/v1/login`;
const signUpUri = `${baseUrl}/auth/v1/signup`;

export const validateOAuthCallback = async (
  data: {
    auth_type: string;
  },
  idToken: string,
  onSuccess: CallableFunction = () => {},
  onFailure: CallableFunction = () => {}
) => {
  const headers = {
    Authorization: idToken,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(redirectUri, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    });
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      onFailure(message);
      return;
    }
    const result = await res.json();
    onSuccess(result);
  } catch (e) {
    console.error(e);
    onFailure("Failed to fetch");
    return;
  }
};

export const validateLogIn = async (
  {
    email,
    password,
  }: {
    email: string;
    password: string;
  },
  onSuccess: CallableFunction = () => {},
  onFailure: CallableFunction = () => {}
) => {
  const headers = {
    Authorization: `Basic ${encode(email + ":" + password)}`,
    "Content-Type": "application/json",
  };
  try {
    const res = await fetch(logInUri, {
      method: "POST",
      body: JSON.stringify({ auth_type: "local" }),
      headers,
    });
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      onFailure(message);
      return;
    }
    const result = await res.json();
    onSuccess(result);
  } catch (e) {
    console.error(e);
    onFailure("Failed to fetch");
    return;
  }
};

export const validateSignUp = async (
  data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  },
  onSuccess: CallableFunction = (result: object) => {},
  onFailure: CallableFunction = (message: string) => {}
) => {
  const headers = {
    "Content-Type": "application/json",
  };
  try {
    const res = await fetch(signUpUri, {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    });
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      onFailure(message);
      return;
    }
    const result = await res.json();
    onSuccess(result);
  } catch (e) {
    console.error(e);
    onFailure("Failed to fetch");
    return;
  }
};
