import React, { useState } from "react";
import { useGoogleLogin, useGoogleLogout } from "react-google-login";

import { validateTokenAndObtainSession } from "../utils/utils";

const GoogleAuthContext = React.createContext({
  authorized: false,
  signIn: () => {},
  signOut: () => {},
});

export const GoogleAuthProvider = ({ children }: { children: any }) => {
  const clientId = process.env.REACT_APP_GAUTH_CLIENT_ID || "invalid_client_id";

  const [authorized, setAuthorized] = useState(false);

  const onLoginSuccess = async (response: any) => {
    console.log("success", response);
    const idToken = response.tokenId;
    const data = {
      email: response.profileObj.email,
      first_name: response.profileObj.givenName,
      last_name: response.profileObj.familyName,
      auth_type: "google",
    };

    const res = await validateTokenAndObtainSession({ data, idToken });
    if (!res.ok) {
      const message = `An error has occured: ${res.status}`;
      console.error(message);
      return;
    }
    const result = await res.json();
    console.log(result);
    setAuthorized(true);
  };
  const onLoginFailure = async (response: any) => {
    console.log("failure", response);
  };

  const onLogoutSuccess = async () => {
    console.log("success");
    setAuthorized(false);
  };
  const onLogoutFailure = async () => {
    console.log("failure");
  };

  const { signIn } = useGoogleLogin({
    onSuccess: onLoginSuccess,
    onFailure: onLoginFailure,
    clientId,
  });
  const { signOut } = useGoogleLogout({
    onFailure: onLogoutFailure,
    clientId,
    onLogoutSuccess,
  });

  return (
    <GoogleAuthContext.Provider value={{ authorized, signIn, signOut }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => React.useContext(GoogleAuthContext);
