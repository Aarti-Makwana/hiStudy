"use client";

import { usePathname, useRouter } from "next/navigation";
import SidebarData from "../../data/dashboard/instructor/siderbar.json";
import Link from "next/link";
import { getUser, clearAuth } from "../../utils/storage";
import { showSuccess, showInfo, showError } from "../../utils/swal";
import { UserAuthServices } from "../../services/User";
import { useEffect, useState } from "react";

import { useAppContext } from "../../context/Context";

const InstructorDashboardSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { userData } = useAppContext();

  const handleLogout = async (e) => {
    e && e.preventDefault();
    try {
      const res = await UserAuthServices.logoutService();
      clearAuth();
      if (res && res.status === "success") {
        await showSuccess("Logged out", res.message || "You have been logged out");
      } else {
        await showInfo("Logged out", res?.message || "You have been logged out");
      }
    } catch (err) {
      clearAuth();
      await showError("Logged out", err?.message || "You have been logged out");
    }
    router.replace("/");
  };

  const renderLink = (data, index) => {
    // If this is the Logout item, call API and clear auth instead of simple link
    if ((data.text || "").toLowerCase() === "logout") {
      return (
        <li key={index}>
          <a href="#" onClick={handleLogout} className={`${pathname === data.link ? "active" : ""}`}>
            <i className={data.icon} />
            <span>{data.text}</span>
          </a>
        </li>
      );
    }
    return (
      <li key={index}>
        <Link
          href={data.link}
          className={`${pathname === data.link ? "active" : ""}`}
        >
          <i className={data.icon} />
          <span>{data.text}</span>
        </Link>
      </li>
    );
  };

  const welcomeName = userData ? userData.name || `${userData.first_name || ""} ${userData.last_name || ""}` : "User";

  return (
    <>
      <div className="rbt-default-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
        <div className="inner">
          <div className="content-item-content">
            <div className="rbt-default-sidebar-wrapper">
              <div className="section-title mb--20">
                <h6 className="rbt-title-style-2">Welcome, {welcomeName}</h6>
              </div>
              <nav className="mainmenu-nav">
                <ul className="dashboard-mainmenu rbt-default-sidebar-list nav-tabs">
                  {SidebarData &&
                    SidebarData.siderbar.slice(0, 13).map((data, index) => (
                      <li className="nav-item" key={index} role="presentation">
                        <Link
                          className={`${pathname === data.link ? "active" : ""}`}
                          href={data.link}
                        >
                          <i className={data.icon} />
                          <span>{data.text}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </nav>
              {/* 
              <div className="section-title mt--40 mb--20">
                <h6 className="rbt-title-style-2">Instructor</h6>
              </div>

              <nav className="mainmenu-nav">
                <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                  {SidebarData &&
                    SidebarData.siderbar.slice(7, 11).map((data, index) => (
                      <li key={index}>
                        <Link
                          href={data.link}
                          className={`${pathname === data.link ? "active" : ""}`}
                        >
                          <i className={data.icon} />
                          <span>{data.text}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </nav>

              <div className="section-title mt--40 mb--20">
                <h6 className="rbt-title-style-2">User</h6>
              </div>

              <nav className="mainmenu-nav">
                <ul className="dashboard-mainmenu rbt-default-sidebar-list">
                  {SidebarData &&
                    SidebarData.siderbar.slice(11, 13).map((data, index) => renderLink(data, index))}
                </ul>
              </nav> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDashboardSidebar;
