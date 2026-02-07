import Image from "next/image";
import Link from "next/link";

import img from "../../public/images/banner/banner-01.png";
import shape1 from "../../public/images/shape/shape-01.png";
import shape2 from "../../public/images/shape/shape-02.png";
import { useSettings } from "@/context/SettingsContext";
import MirrorLoader from "../Common/MirrorLoader";

import HomeCourses from "./Home-Sections/HomeCourse";

const MainDemoBanner = ({ courses }) => {
  const { settings, loading } = useSettings();
  const hero = settings?.hero_section;

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12 pb--120 pt--70 space-responsive-xxl">
            <div className="content">
              <div className="inner">
                {loading || !hero?.badge ? (
                  <MirrorLoader widthClass="w-200" heightClass="h-40" radiusClass="radius-15" className="mb--20" />
                ) : (
                  <div className="rbt-new-badge rbt-new-badge-one">
                    <span className="rbt-new-badge-icon"></span> {hero?.badge}
                  </div>
                )}

                {loading || !hero?.title ? (
                  <div className="mb--20">
                    <MirrorLoader widthClass="w-500" heightClass="h-60" className="mb-2" />
                    <MirrorLoader widthClass="w-400" heightClass="h-60" />
                  </div>
                ) : (
                  <h1 className="title" dangerouslySetInnerHTML={{ __html: hero?.title }}>
                  </h1>
                )}

                {loading || !hero?.body ? (
                  <div className="mb--30">
                    <MirrorLoader widthClass="w-500" heightClass="h-20" className="mb-2" />
                    <MirrorLoader widthClass="w-500" heightClass="h-20" className="mb-2" />
                    <MirrorLoader widthClass="w-300" heightClass="h-20" />
                  </div>
                ) : (
                  <p className="description" dangerouslySetInnerHTML={{ __html: hero?.body }}>
                  </p>
                )}

                <div className="slider-btn">
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">View Course</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
              <div className="shape-wrapper" id="scene">
                {loading || !hero?.banner ? (
                  <MirrorLoader widthClass="w-full-banner" className="h-banner" radiusClass="radius-15" />
                ) : (
                  <>
                    <Image
                      src={hero?.banner}
                      width={1200}
                      height={1400}
                      alt="Hero Image"
                      priority={true}
                    />
                    {hero?.shape_1 && (
                      <div className="hero-bg-shape-1 layer" data-depth="0.4">
                        <Image
                          src={hero?.shape_1}
                          width={428}
                          height={377}
                          alt="Hero Image Background Shape"
                        />
                      </div>
                    )}
                    {hero?.shape_2 && (
                      <div className="hero-bg-shape-2 layer" data-depth="0.4">
                        <Image
                          src={hero?.shape_2}
                          width={372}
                          height={396}
                          alt="Hero Image Background Shape"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="banner-card pb--60 swiper rbt-dot-bottom-center banner-swiper-active">
                <HomeCourses start={0} end={3} courses={courses} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainDemoBanner;
