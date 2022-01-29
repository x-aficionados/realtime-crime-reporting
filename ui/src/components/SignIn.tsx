import { useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertIcon } from "@chakra-ui/react";

import GoogleButton from "./GoogleButton";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

function SignIn() {
  const { signIn, authorized } = useGoogleAuth();
  let location = useLocation() as any;
  let navigate = useNavigate();

  let from = location.state?.from?.pathname || "/";
  if (authorized) {
    navigate(from, { replace: true });
  }
  return (
    <>
      {from !== "/" && (
        <Alert status="warning">
          <AlertIcon />
          You must sign in to view the page at {from}.
        </Alert>
      )}

      <GoogleButton handleSignIn={signIn} />
    </>
  );
}

export default SignIn;
