import React from "react";

import { useGoogleAuth } from "./hooks/useGoogleAuth";
import { Routes, Route, Link } from "react-router-dom";

import Home from "./components/Home";
import Dashboard from "./components/Dashboard";

function App() {
  const { signIn, signOut, authorized } = useGoogleAuth();
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      {authorized ? (
        <button className="btn-logout" onClick={signOut}>
          Sign out
        </button>
      ) : (
        <button className="btn-login" onClick={signIn}>
          Sign In
        </button>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;
