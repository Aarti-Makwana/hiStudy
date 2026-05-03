import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserData from "../../../data/user.json";
import { getUser, clearAuth } from "../../../utils/storage";
import { UserAuthServices } from "../../../services/User";
import { showSuccess, showInfo, showError } from "../../../utils/swal";
import { useAppContext } from "../../../context/Context";
import { usePathname } from "next/navigation";
import InstructorSidebarData from "../../../data/dashboard/instructor/siderbar.json";
import StudentSidebarData from "../../../data/dashboard/student/siderbar.json";

const User = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userData } = useAppContext();
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

  const fallbackProfile = UserData?.user?.[0] || { name: "User", img: "/images/avatar.png" };
  const display = userData
    ? { 
        name: userData.name || `${userData.first_name || ""} ${userData.last_name || ""}`, 
        img: userData.profile?.file?.url || userData.profile?.avatar || fallbackProfile.img,
        role: pathname?.startsWith("/student") ? "student" : "instructor"
      }
    : { ...fallbackProfile, role: "instructor" };

  const sidebarData = display.role === "student" ? StudentSidebarData : InstructorSidebarData;
  const menuItems = sidebarData?.siderbar || [];
  
  // Filter out Settings and Logout to show them at the bottom specifically if we want to follow the existing UI structure
  // but the user said "same to same", and sidebar.json includes them at the end.
  // I'll filter them out for the main list and show them in the bottom section for better UI consistency with the theme.
  const mainMenuItems = menuItems.filter(item => 
    !item.text.toLowerCase().includes("settings") && 
    !item.text.toLowerCase().includes("logout")
  );
  
  const settingsItem = menuItems.find(item => item.text.toLowerCase().includes("settings"));
  const logoutItem = menuItems.find(item => item.text.toLowerCase().includes("logout"));

  const profileLink = display.role === "student" ? "/student-profile" : "/instructor-profile";

  return (
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
                <Link className="rbt-btn-link color-primary" href={profileLink}>
                  View Profile
                </Link>
              </div>
            </div>
             <ul className="user-list-wrapper">
              {mainMenuItems.map((item, index) => (
                <li key={`user-menu-item-${index}`}>
                  <Link href={item.link || "#"} className="d-flex align-items-center">
                    <i className={item.icon || "feather-chevron-right"}></i>
                    <span>{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <hr className="mt--10 mb--10" />
            <ul className="user-list-wrapper">
              <li>
                <Link href={settingsItem?.link || (display.role === "student" ? "/student-settings" : "/instructor-settings")}>
                  <i className={settingsItem?.icon || "feather-settings"}></i>
                  <span>{settingsItem?.text || "Settings"}</span>
                </Link>
              </li>
              <li>
                <a href="#" onClick={handleLogout}>
                  <i className={logoutItem?.icon || "feather-log-out"}></i>
                  <span>{loading ? "Logging out..." : (logoutItem?.text || "Logout")}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User;
