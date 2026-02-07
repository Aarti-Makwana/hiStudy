"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useAppContext } from "@/context/Context";
import { useSettings } from "@/context/SettingsContext";
import MirrorLoader from "../../Common/MirrorLoader";

const HeaderTopEight = ({
  bgColor,
  gapSpaceBetween,
  container,
  flexDirection,
}) => {
  const router = useRouter();
  const { toggle, setToggle } = useAppContext();
  const { settings, loading } = useSettings();

  const promo = settings?.promo;
  const socialLinks = settings?.social_links;

  const renderSocialLinks = () => {
    if (loading) {
      return (
        <div className="d-flex gap-3">
          <MirrorLoader widthClass="w-20" heightClass="h-20" radiusClass="radius-round" />
          <MirrorLoader widthClass="w-20" heightClass="h-20" radiusClass="radius-round" />
          <MirrorLoader widthClass="w-20" heightClass="h-20" radiusClass="radius-round" />
        </div>
      );
    }

    if (socialLinks && typeof socialLinks === 'object' && Object.keys(socialLinks).length > 0) {
      return Object.entries(socialLinks).map(([key, value]) => {
        if (!value || typeof value !== 'string') return null;
        let iconClass = "";
        switch (key) {
          case 'facebook': iconClass = "fab fa-facebook-square"; break;
          case 'instagram': iconClass = "fab fa-instagram"; break;
          case 'twitter': iconClass = "fab fa-twitter"; break;
          case 'linkedin': iconClass = "fab fa-linkedin-in"; break;
          case 'whatsapp': iconClass = "fab fa-whatsapp"; break;
          case 'github': iconClass = "fab fa-github"; break;
          default: iconClass = `fab fa-${key}`;
        }
        return (
          <li key={key}>
            <Link href={value}>
              <i className={iconClass}></i>
            </Link>
          </li>
        );
      });
    }

    // If not loading and no social links, show placeholders or nothing? 
    // User said "I only here show the icons thats come". 
    // But if we want a premium feel, maybe 3 small loaders if truly empty? 
    // Let's go with nada for social if API explicitly empty, but loaders if loading.
    return null;
  };

  return (
    <>
      <div
        className={`rbt-header-top rbt-header-top-1 ${gapSpaceBetween} ${bgColor} top-expended-activation ${!toggle ? "d-none" : ""
          }`}
      >
        <div className={`${container}`}>
          <div className="top-expended-wrapper">
            <div
              className={`top-expended-inner rbt-header-sec align-items-center ${flexDirection}`}
            >
              <div className="rbt-header-sec-col rbt-header-left d-none d-xl-block">
                <div className="rbt-header-content">
                  <div className="header-info">
                    {/* Left section now empty per user request */}
                  </div>
                </div>
              </div>
              <div className="rbt-header-sec-col rbt-header-center">
                <div className="rbt-header-content justify-content-center w-100">
                  <div className="header-info">
                    <div className="rbt-header-top-news">
                      <div className="inner">
                        <div className="content">
                          {loading ? (
                            <div className="d-flex align-items-center gap-2">
                              <MirrorLoader widthClass="w-40" heightClass="h-20" radiusClass="radius-15" />
                              <MirrorLoader widthClass="w-200" heightClass="h-20" />
                            </div>
                          ) : promo ? (
                            <>
                              <span className="rbt-badge variation-02 bg-color-primary color-white radius-round">
                                {promo?.badge}
                              </span>
                              <span className="news-text">
                                {promo?.offer}
                              </span>
                            </>
                          ) : (
                            // Strictly dynamic: if no promo data, show shimmer or hide? 
                            // Shimmer looks more "loading from API" even if it failed/empty.
                            <div className="d-flex align-items-center gap-2">
                              <MirrorLoader widthClass="w-40" heightClass="h-20" radiusClass="radius-15" />
                              <MirrorLoader widthClass="w-200" heightClass="h-20" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rbt-header-sec-col rbt-header-right mt_md--10 mt_sm--10">
                <div className="rbt-header-content justify-content-start justify-content-lg-end">
                  <div className="header-info">
                    <ul className="rbt-information-list">
                      {renderSocialLinks()}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="header-info">
              <div className="top-bar-expended d-block d-lg-none">
                <button
                  className="topbar-expend-button rbt-round-btn"
                  onClick={() => setToggle(!toggle)}
                >
                  <i className="feather-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderTopEight;









