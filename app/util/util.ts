import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { encode, decode } from "base-64";

const baseUrl = Constants.manifest.extra.apiUrl;
const redirectUri = `${baseUrl}/auth/v1/oauth/callback`;
const logInUri = `${baseUrl}/auth/v1/login`;
const signUpUri = `${baseUrl}/auth/v1/signup`;
const refreshUri = `${baseUrl}/auth/v1/refresh_token`;
const getCurrentUserInfo = `${baseUrl}/api/v1/userinfo`;

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

export const refreshToken = async (
  onSuccess: CallableFunction = (result: object) => {},
  onFailure: CallableFunction = (message: string) => {}
) => {
  try {
    const res = await fetch(refreshUri, {
      method: "POST",
    });
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      onFailure(message);
      return;
    }
    const { access_token: accessToken } = await res.json();
    onSuccess(accessToken);
    return accessToken;
  } catch (e) {
    console.error(e);
    onFailure("Failed to fetch");
    return;
  }
};

export const isTokenExpired = (jwtToken: string) => {
  var tokenParts = jwtToken.split(".");
  const { exp } = JSON.parse(decode(tokenParts[1]));
  const now = Date.now() / 1000;
  // adding some buffer time to prevent expiry right after user logs in
  return exp - 30 < now;
};

export const accessTokenManager = {
  get: async () => {
    try {
      const res = await AsyncStorage.getItem("@accessToken");
      return res;
    } catch (e) {
      return false;
    }
  },
  set: async (value: string) => {
    try {
      await AsyncStorage.setItem("@accessToken", value);
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  remove: async () => {
    try {
      await AsyncStorage.removeItem("@accessToken");
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};

export const makeFetch = async (
  data: {
    uri: string;
    method: string;
    body: object;
  },
  onSuccess: CallableFunction = (result: object) => {},
  onFailure: CallableFunction = (message: string) => {}
) => {
  const uri = `${baseUrl}${data.uri}`;
  let accessToken = await accessTokenManager.get();
  if (!accessToken || isTokenExpired(accessToken)) {
    accessToken = await refreshToken((newAccessToken: string) => {
      AsyncStorage.setItem("@accessToken", newAccessToken);
    });
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  try {
    const params = data.method == "GET" ? {
      method: data.method,
      headers,
    }: {
      method: data.method,
      body: JSON.stringify(data.body),
      headers,
    }
    const res = await fetch(uri, params);
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
