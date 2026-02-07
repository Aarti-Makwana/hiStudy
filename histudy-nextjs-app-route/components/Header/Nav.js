"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { useState } from "react";

const Nav = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);

  const pathname = usePathname();

  const isActive = (href) => pathname.startsWith(href);

  const toggleMenuItem = (item) => {
    setActiveMenuItem(activeMenuItem === item ? null : item);
  };

  return (
    <nav className="mainmenu-nav">
      <ul className="mainmenu">
        <li className="with-megamenu has-menu-child-item position-static">
          <Link
            className={`${isActive("/") ? "active" : ""}`}
            href="/"
          >
            Home
          </Link>
        </li>

        <li className="with-megamenu has-menu-child-item">
          <Link
            className={`${activeMenuItem === "courses" ? "open" : ""}`}
            href="/#popular-courses"
            onClick={(e) => {
              try {
                if (typeof window !== 'undefined' && (pathname === '/' || pathname === '')) {
                  e.preventDefault();
                  const el = document.getElementById('popular-courses');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              } catch (err) { }
            }}
          >
            Courses
          </Link>
        </li>
        <li className="has-dropdown has-menu-child-item">
          <Link
            className={`${isActive("/about-us") ? "active" : ""}`}
            href="/about-us"
          >
            About Us
          </Link>
        </li>
        <li className="has-dropdown has-menu-child-item">
          <Link
            className={`${isActive("/team") ? "active" : ""}`}
            href="/team"
          >
            Teams
          </Link>
        </li>
        <li className="has-dropdown has-menu-child-item">
          <Link
            className={`${isActive("/contact") ? "active" : ""}`}
            href="/contact"
          >
            Contact Us
          </Link>
        </li>
      </ul>
    </nav>
  );
};
export default Nav;
