import React from "react";

import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Container, Flex } from "@chakra-ui/react";

import { useGoogleAuth } from "./hooks/useGoogleAuth";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import SignIn from "./components/SignIn";
import { Nav, NavLink } from "./components/Nav";
import Foot from "./components/Foot";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { authorized } = useGoogleAuth();
  let location = useLocation();

  if (!authorized) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const { authorized } = useGoogleAuth();
  // TODO: implement protected routes
  return (
    <Flex
      direction="column"
      align="center"
      justifyContent={"space-between"}
      h="100vh"
    >
      <Nav>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </Nav>
      <Container maxW={"6xl"} flexGrow="1" my="6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </Container>
      <Foot />
    </Flex>
  );
}

export default App;
