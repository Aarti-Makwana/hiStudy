"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/Context";
import { getToken } from "../../../utils/storage";

const HeaderRightThree = ({ btnClass, btnText }) => {
  const { mobile, setMobile, search, setSearch } = useAppContext();
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const t = getToken();
    setLogged(!!t);
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

        {!logged ? (
          <>
            <li className="access-icon d-none d-xl-block">
              <Link className="rbt-round-btn" href="/login">
                Login
              </Link>
            </li>
            <li className="access-icon d-none d-xl-block">
              <Link className="rbt-btn btn-gradient" href="/register">
                Register Now
              </Link>
            </li>
          </>
        ) : (
          <li className="access-icon d-none d-xl-block">
            <Link className={`rbt-btn ${btnClass}`} href="/dashboard">
              <span data-text={`Dashboard`}>Dashboard</span>
            </Link>
          </li>
        )}
      </ul>

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

export default HeaderRightThree;
