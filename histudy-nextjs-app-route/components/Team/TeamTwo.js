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
          const defaultInstructor = data.find(ins => ins.order === 1) || data[0];
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
    return <div className="row g-5"><div className="col-12 text-center"><Loader /></div></div>;
  }

  if (instructors.length === 0) {
    return null;
  }

  return (
    <>
      <div className="row g-3 align-items-stretch">
        <div className="col-lg-7 d-flex">
          <div className="rbt-team-tab-content tab-content show active w-100 h-100">
            {selectedInstructor && (
              <div className="inner h-100 d-flex align-items-center">
                <div className="rbt-team-thumbnail">
                  <div className="thumb">
                    <Image
                      src={selectedInstructor.file?.url || "/images/team/team-01.jpg"}
                      width={415}
                      height={555}
                      priority
                      alt={selectedInstructor.name}
                    />
                  </div>
                </div>
                <div className="rbt-team-details">
                  <div className="author-info">
                    <h4 className="title">{selectedInstructor.name}</h4>
                    <span className="designation theme-gradient">
                      {selectedInstructor.expertise}
                    </span>
                    {selectedInstructor.companies && (
                      <ul className="rbt-meta justify-content-start mt--10 mb--10 list-horizontal-bullets">
                        {(typeof selectedInstructor.companies === 'string'
                          ? selectedInstructor.companies.split(',')
                          : Array.isArray(selectedInstructor.companies)
                            ? selectedInstructor.companies
                            : []
                        ).map((company, idx) => (
                          <li key={idx} className="mr--15" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {idx > 0 && <span className="bullet-separator mr--15">•</span>}
                            {typeof company === 'string'
                              ? company.trim()
                              : (company && typeof company === 'object' && company.name)
                                ? company.name
                                : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <p className="description">{selectedInstructor.short_description}</p>
                  <ul className="social-icon social-default mt--20 justify-content-start">
                    {selectedInstructor.socialMedia && selectedInstructor.socialMedia.map((social, idx) => (
                      <li key={idx}>
                        <Link href={social.url}>
                          <i className={`feather-${social.platform.toLowerCase()}`}></i>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="top-circle-shape"></div>
          </div>
        </div>

        <div className="col-lg-5 d-flex">
          <div className="rbt-team-tab-thumb-wrapper w-100 h-100">
            <ul className="rbt-team-tab-thumb nav nav-tabs w-100 h-100" id="myTab" role="tablist">
              {instructors.slice(0, 6).map((data, index) => (
                <li key={index}>
                  <button
                    className={`nav-link ${selectedInstructor?.id === data.id ? "active" : ""}`}
                    onClick={() => setSelectedInstructor(data)}
                    type="button"
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
                        {selectedInstructor?.id === data.id && (
                          <div className="active-overlay">
                            <i className="feather-corner-up-left"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="row mt--60">
        <div className="col-lg-12">
          <div className="view-more-btn text-center">
            <Link href="/instructors" className="rbt-btn btn-gradient hover-icon-reverse">
              <span className="icon-reverse-wrapper">
                <span className="btn-text">View More</span>
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
      </div>
    </>
  );
};

export default TeamTwo;
