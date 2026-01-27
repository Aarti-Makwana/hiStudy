import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserData from "../../../data/user.json";
import { getUser, clearAuth } from "../../../utils/storage";
import { UserAuthServices } from "../../../services/User";
import { showSuccess, showInfo, showError } from "../../../utils/swal";

const User = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
  }, []);

  const handleLogout = async (e) => {
    e && e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await UserAuthServices.logoutService();
      // Clear client-side auth regardless of API response to avoid stuck sessions
      clearAuth();
      if (res && res.status === "success") {
        await showSuccess("Logged out", res.message || "You have been logged out");
      } else {
        await showInfo("Logged out", res?.message || "You have been logged out");
      }
      router.replace("/");
    } catch (err) {
      clearAuth();
      await showError("Logged out", err?.message || "You have been logged out");
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const display = user
    ? { name: user.name || `${user.first_name || ""} ${user.last_name || ""}`, img: user.profile?.file?.url }
    : UserData?.user?.[0] || { name: "User", img: "/images/avatar.png" };

  return (
    <>
      <div className="rbt-user-wrapper">
        <div className="user-dropdown-wrapper">
          <div className="rbt-user-menu-list-wrapper">
            <div className="inner">
              <div className="rbt-admin-profile">
                <div className="admin-thumbnail">
                  <Image
                    src={display.img}
                    width={43}
                    height={43}
                    alt="User Images"
                  />
                </div>
                <div className="admin-info">
                  <span className="name">{display.name}</span>
                  <Link
                    className="rbt-btn-link color-primary"
                    href="/instructor-profile"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
              <ul className="user-list-wrapper">
                <li>
                  <Link href="/instructor-dashboard">
                    <i className="feather-briefcase"></i>
                    <span>My Courses</span>
                  </Link>
                </li>
              </ul>
              <hr className="mt--10 mb--10" />
              <ul className="user-list-wrapper">
                <li>
                  <Link href="#">
                    <i className="feather-book-open"></i>
                    <span>Getting Started</span>
                  </Link>
                </li>
              </ul>
              <hr className="mt--10 mb--10" />
              <ul className="user-list-wrapper">
                <li>
                  <Link href="/instructor-settings">
                    <i className="feather-settings"></i>
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <a href="#" onClick={handleLogout}>
                    <i className="feather-log-out"></i>
                    <span>{loading ? "Logging out..." : "Logout"}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default User;
