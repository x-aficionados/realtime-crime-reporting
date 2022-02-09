import React, { useState, useEffect, SetStateAction } from "react";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Prompt } from "expo-auth-session";

import {
  validateLogIn,
  validateOAuthCallback,
  validateSignUp,
} from "../util/util";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = React.createContext({
  authenticated: false,
  signIn: async (
    data: { email: string; password: string },
    setServerError: (message: string) => void
  ) => {},
  signOut: async () => {},
  signUp: async (
    data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    },
    setServerError: (message: string) => void
  ) => {},
  signInWithGoogle: () => {},
});

export const AuthProvider = ({ children }: { children: any }) => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: "GOOGLE_GUID.apps.googleusercontent.com",
    iosClientId: "GOOGLE_GUID.apps.googleusercontent.com",
    androidClientId: "GOOGLE_GUID.apps.googleusercontent.com",
    webClientId: Constants.manifest.extra.webClientId,
    scopes: ["email", "profile"],
    prompt: Prompt.Consent,
  });
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params.id_token;
      validateOAuthCallback({ auth_type: "google" }, idToken, () =>
        setAuthenticated(true)
      );
    }
  }, [response]);

  const signInWithGoogle = async () => {
    await promptAsync();
  };
  const signIn = async (
    data: { email: string; password: string },
    setServerError: (message: string) => void
  ) => {
    validateLogIn(
      data,
      () => setAuthenticated(true),
      (message: string) => setServerError(message)
    );
  };
  const signUp = async (
    data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
    },
    setServerError: (message: string) => void
  ) => {
    validateSignUp(
      data,
      () => setAuthenticated(true),
      (message: string) => setServerError(message)
    );
  };
  const signOut = async () => {
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        signIn,
        signOut,
        signUp,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
