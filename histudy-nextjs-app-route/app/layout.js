"use client";

import React, { useEffect } from "react";

import "bootstrap/scss/bootstrap.scss";
import "../public/scss/default/euclid-circulara.scss";

// ========= Plugins CSS START =========
import "../node_modules/sal.js/dist/sal.css";
import "../public/css/plugins/fontawesome.min.css";
import "../public/css/plugins/feather.css";
import "../public/css/plugins/odometer.css";
import "../public/css/plugins/animation.css";
import "../public/css/plugins/euclid-circulara.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-cards";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
// ========= Plugins CSS END =========

import "../public/scss/styles.scss";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";

const Favicon = () => {
  const { settings } = useSettings();
  const favicon = settings?.site?.addonn_favicon || "/images/favicon.png";

  useEffect(() => {
    if (!favicon) return;

    const head = document.head || document.getElementsByTagName("head")[0];
    const existingIcons = Array.from(head.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']"));

    const setLink = (relValue) => {
      let link = head.querySelector(`link[rel='${relValue}']`);
      if (!link) {
        link = document.createElement("link");
        link.rel = relValue;
        head.appendChild(link);
      }
      link.type = "image/x-icon";
      link.href = favicon;
    };

    setLink("icon");
    setLink("shortcut icon");

    existingIcons.forEach((iconLink) => {
      if (iconLink.href !== favicon) {
        iconLink.href = favicon;
      }
    });
  }, [favicon]);

  return null;
};

export default function RootLayout({ children }) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="icon" href="/images/favicon.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,400;0,600;0,700;0,900;1,400&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap" />
      </head>
      <body className="" suppressHydrationWarning={true}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <SettingsProvider>
            <Toaster position="top-right" reverseOrder={false} />
            <Favicon />
            {children}
          </SettingsProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
