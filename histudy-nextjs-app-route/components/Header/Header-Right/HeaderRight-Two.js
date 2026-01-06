"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/Context";
import User from "../Offcanvas/User";
import { getToken, getUser } from "../../../utils/storage";
import { getLocalStorageToken } from "../../../utils/common.util";

const HeaderRightTwo = ({ btnClass, btnText, userType }) => {
  const { mobile, setMobile, search, setSearch } = useAppContext();
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Helper to check auth
    const checkAuth = () => {
      // Check for encrypted token first (common.util), then fallback to plain (storage)
      let t = getLocalStorageToken() || getToken();
      // Validate that t is not just a string "null" or "false" which can happen in some storage states
      if (t === "null" || t === "false" || t === "undefined") t = false;

      const u = getUser();
      // Require both valid token AND user data to consider logged in
      setLogged(!!t && !!u);
      setUser(u);
    };

    // Check initially
    checkAuth();

    // Listen for custom auth events for real-time updates
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, []);

  return (
    <div className="header-right">
      <ul className="quick-access">
        <li className="access-icon">
          <Link
            className={`search-trigger-active rbt-round-btn ${search ? "" : "open"}`}
            href="#"
            onClick={() => setSearch(!search)}
          >
            <i className="feather-search"></i>
          </Link>
        </li>

        {/* Cart intentionally removed per request (kept design spacing) */}

        {/* Right-side username/icon hidden. Dropdown moved under Dashboard button. */}
      </ul>

      <div className="rbt-separator d-none d-xl-block" style={{ display: 'inline-block', width: '1px', height: '36px', background: '#e6e6e6', margin: '0 18px' }} />

      <div className="rbt-btn-wrapper d-none d-xl-block">
        {logged ? (
          <div className="account-access rbt-user-wrapper" style={{ position: 'relative' }}>
            <Link className={`rbt-btn ${btnClass}`} href="/instructor-dashboard">
              <span data-text={`Dashboard`}>Dashboard</span>
            </Link>
            <User />
          </div>
        ) : (
          <Link className={`rbt-btn ${btnClass}`} href="/register">
            <span data-text={"My Account"}>{"My Account"}</span>
          </Link>
        )}
      </div>

      <div className="mobile-menu-bar d-block d-xl-none">
        <div className="hamberger">
          <button className="hamberger-button rbt-round-btn" onClick={() => setMobile(!mobile)}>
            <i className="feather-menu"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderRightTwo;
