"use client";

import { useState, useEffect } from "react";

const MOT_DE_PASSE = "l1a2m3B5";

export function useAdminAuth() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("dicter_auth") === MOT_DE_PASSE) setAuthed(true);
  }, []);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (password === MOT_DE_PASSE) {
      sessionStorage.setItem("dicter_auth", password);
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  function logout() {
    setAuthed(false);
    setPassword("");
    sessionStorage.removeItem("dicter_auth");
  }

  return { authed, password, setPassword, error, login, logout };
}
