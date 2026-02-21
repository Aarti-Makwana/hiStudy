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
                          <div className="d-flex align-items-center gap-3 mb--5">
                            <h4 className="title mb-0">{instructor.name}</h4>
                            {instructor.socialMedia?.find(
                              (s) => s.platform.toLowerCase() === "linkedin"
                            ) && (
                                <Link
                                  href={
                                    instructor.socialMedia.find(
                                      (s) =>
                                        s.platform.toLowerCase() === "linkedin"
                                    ).url
                                  }
                                  target="_blank"
                                >
                                  <i
                                    className="feather-linkedin"
                                    style={{
                                      fontSize: "20px",
                                      color: "var(--color-primary)",
                                    }}
                                  ></i>
                                </Link>
                              )}
                          </div>
                          <span className="designation theme-gradient">
                            {instructor.subject}
                          </span>
                        </div>

                        {instructor.companies && (
                          <div className="companies-list mb--20">
                            <ul className="rbt-meta justify-content-start mt--10 mb--10 list-horizontal-bullets p-0">
                              {instructor.companies.map((company, idx) => (
                                <li
                                  key={idx}
                                  className="mr--15"
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    fontSize: "14px",
                                    color: "var(--color-body)",
                                  }}
                                >
                                  {idx > 0 && (
                                    <span
                                      className="bullet-separator"
                                      style={{ marginRight: "10px" }}
                                    >
                                      •
                                    </span>
                                  )}
                                  {company.logo?.url && (
                                    <Image
                                      src={company.logo.url}
                                      width={24}
                                      height={24}
                                      alt={company.name || "Company Logo"}
                                      style={{
                                        marginRight: "8px",
                                        objectFit: "contain",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  )}
                                  {company.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="description">
                          {instructor.bio || instructor.short_description}
                        </p>

                        {instructor.socialMedia?.find(
                          (s) => s.platform.toLowerCase() === "linkedin"
                        ) && (
                            <div className="mt--30">
                              <Link
                                href={
                                  instructor.socialMedia.find(
                                    (s) => s.platform.toLowerCase() === "linkedin"
                                  ).url
                                }
                                className="rbt-btn btn-gradient hover-icon-reverse btn-sm"
                                target="_blank"
                              >
                                <span className="icon-reverse-wrapper">
                                  <span className="btn-text">LinkedIn</span>
                                  <span className="btn-icon">
                                    <i className="feather-linkedin"></i>
                                  </span>
                                  <span className="btn-icon">
                                    <i className="feather-linkedin"></i>
                                  </span>
                                </span>
                              </Link>
                            </div>
                          )}
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
