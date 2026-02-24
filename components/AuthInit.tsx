"use client";

import { useEffect } from "react";

export default function AuthInit() {
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth-storage");
  }, []);
  return null;
}
