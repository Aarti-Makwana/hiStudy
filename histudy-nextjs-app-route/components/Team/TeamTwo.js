import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { InstructorServices } from "../../services/User";
import Loader from "../Common/Loader";
import InstructorCardCore from "../Instructors/InstructorCardCore";

const TeamTwo = () => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await InstructorServices.getAllInstructors();
        if (res && res.success) {
          const data = res.data.sort((a, b) => a.order - b.order);
          setInstructors(data);
          // Set instructor with order 1 as default, or the first one if not found
          const defaultInstructor =
            data.find((ins) => ins.order === 1) || data[0];
          setSelectedInstructor(defaultInstructor);
        }
      } catch (error) {
        console.error("Error fetching instructors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="row g-5">
        <div className="col-12 text-center">
          <Loader />
        </div>
      </div>
    );
  }

  if (instructors.length === 0) {
    return null;
  }

  return (
    <div className="rbt-team-area bg-color-white ">
      <div className="container">
        <div className="row mb--60">
          <div className="col-lg-12">
            <div className="section-title text-center">
              <span className="subtitle bg-primary-opacity">Our Teacher</span>
              <h2 className="title">Whose Inspirations You</h2>
            </div>
          </div>
        </div>
        <div className="row g-5">
          <div className="col-lg-7">
            {/* Start Tab Content  */}
            <div
              className="rbt-team-tab-content tab-content"
              id="myTabContent"
            >
              {instructors.map((instructor, index) => {
                const isActive = selectedInstructor?.id === instructor.id;
                return (
                  <div
                    key={index}
                    className={`tab-pane fade ${isActive ? "active show" : ""}`}
                    id={`team-tab${index + 1}`}
                    role="tabpanel"
                    aria-labelledby={`team-tab${index + 1}-tab`}
                  >
                    <div className="inner">
                      <div className="rbt-team-thumbnail">
                        <div className="thumb">
                          <Image
                            src={
                              instructor.file?.url || "/images/team/team-01.jpg"
                            }
                            width={415}
                            height={555}
                            priority
                            alt={instructor.name}
                          />
                        </div>
                      </div>
                      <div className="rbt-team-details">
                        <div className="author-info">
                          <h4 className="title">{instructor.name}</h4>
                          <span className="designation theme-gradient">
                            {instructor.expertise}
                          </span>
                          <span className="team-form">
                            <i className="feather-map-pin"></i>
                            <span className="location">CO Miego, AD,USA</span>
                          </span>
                        </div>
                        <p>{instructor.short_description}</p>
                        <ul className="social-icon social-default mt--20 justify-content-start">
                          {instructor.socialMedia &&
                            instructor.socialMedia.length > 0 ? (
                            instructor.socialMedia.map((social, idx) => (
                              <li key={idx}>
                                <Link href={social.url}>
                                  <i
                                    className={`feather-${social.platform.toLowerCase()}`}
                                  ></i>
                                </Link>
                              </li>
                            ))
                          ) : (
                            <>
                              <li>
                                <a href="https://www.facebook.com/">
                                  <i className="feather-facebook"></i>
                                </a>
                              </li>
                              <li>
                                <a href="https://www.twitter.com">
                                  <i className="feather-twitter"></i>
                                </a>
                              </li>
                              <li>
                                <a href="https://www.instagram.com/">
                                  <i className="feather-instagram"></i>
                                </a>
                              </li>
                            </>
                          )}
                        </ul>
                        <ul className="rbt-information-list mt--25">
                          <li>
                            <a href="#">
                              <i className="feather-phone"></i>+1-202-555-0174
                            </a>
                          </li>
                          <li>
                            <a href="mailto:hello@example.com">
                              <i className="feather-mail"></i>
                              example@gmail.com
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="top-circle-shape"></div>
            </div>
            {/* End Tab Content  */}
          </div>

          <div className="col-lg-5">
            {/* Start Tab Nav  */}
            <ul
              className="rbt-team-tab-thumb nav nav-tabs"
              id="myTab"
              role="tablist"
            >
              {instructors.slice(0, 6).map((data, index) => {
                const isActive = selectedInstructor?.id === data.id;
                return (
                  <li key={index}>
                    <a
                      className={isActive ? "active" : ""}
                      id={`team-tab${index + 1}-tab`}
                      data-bs-target={`#team-tab${index + 1}`}
                      role="tab"
                      aria-controls={`team-tab${index + 1}`}
                      aria-selected={isActive}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedInstructor(data);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="rbt-team-thumbnail">
                        <div className="thumb">
                          <Image
                            src={data.file?.url || "/images/team/team-01.jpg"}
                            width={415}
                            height={555}
                            priority
                            alt={data.name}
                          />
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
            {/* End Tab Content  */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamTwo;
