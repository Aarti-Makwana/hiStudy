"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/Context";
import User from "../Offcanvas/User";
import { getToken, getUser } from "../../../utils/storage";

const HeaderRightTwo = ({ btnClass, btnText, userType }) => {
  const { mobile, setMobile, search, setSearch } = useAppContext();
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = getToken();
    const u = getUser();
    setLogged(!!t);
    setUser(u);
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
            <Link className={`rbt-btn ${btnClass}`} href="/dashboard">
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
