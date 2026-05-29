"use client";

import { Provider } from "react-redux";
import { store } from "./index";

import { GoogleOAuthProvider } from '@react-oauth/google';
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Use your real Google Client ID from environment settings or local string validation
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    </Provider>
  );
}