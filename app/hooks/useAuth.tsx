import React, { useState, useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { Prompt } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = "http://localhost/auth/v1/login";

const validateTokenAndObtainSession = async ({
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

const AuthContext = React.createContext({
  authenticated: false,
  signIn: () => {},
  signOut: () => {},
  signUp: () => {},
  signInWithGoogle: () => {},
});

export const AuthProvider = ({ children }: { children: any }) => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: "GOOGLE_GUID.apps.googleusercontent.com",
    iosClientId: "GOOGLE_GUID.apps.googleusercontent.com",
    androidClientId: "GOOGLE_GUID.apps.googleusercontent.com",
    webClientId: "GOOGLE_GUID.apps.googleusercontent.com",
    scopes: ["email", "profile"],
    prompt: Prompt.Consent,
  });
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params.id_token;

      const googleAuthCallback = async () => {
        const res = await validateTokenAndObtainSession({
          data: { auth_type: "google" },
          idToken,
        });
        if (!res.ok) {
          const message = `An error has occured: ${res.status}`;
          console.error(message);
          return;
        }
        const result = await res.json();
        console.log(result);
        setAuthenticated(true);
      };
      googleAuthCallback();
    }
  }, [response]);

  const signInWithGoogle = async () => {
    await promptAsync();
  };
  const signIn = async () => {
    setAuthenticated(true);
  };
  const signUp = async () => {
    setAuthenticated(true);
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
