import Image from "next/image";
import Link from "next/link";
import React from "react";

const Instructor = ({ checkMatchCourses }) => {
  return (
    <>
      <div className="about-author border-0 pb--0 pt--0">
        <div className="section-title mb--30">
          <h4 className="rbt-title-style-3">{checkMatchCourses.title}</h4>
        </div>
        {checkMatchCourses.body.map((teacher, innerIndex) => (
            <div className="media align-items-center" key={innerIndex}>
            <div className="thumbnail">
              <Link href={`#`}>
                <Image
                  src={teacher.img}
                  width={250}
                  height={250}
                  alt="Author Images"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </Link>
            </div>
            <div className="media-body">
              <div className="author-info">
                {teacher.companies && teacher.companies.length > 0 && (
                  <div className="company-info-wrapper d-flex align-items-center flex-wrap gap-3 mb--10">
                    {teacher.companies.slice(0, 1).map((company, cIndex) => (
                      <div key={cIndex} className="company-item d-flex align-items-center gap-2">
                        {company.logo?.url && (
                          <div className="company-logo">
                            <Image
                              src={company.logo.url}
                              width={32}
                              height={32}
                              alt={company.name}
                              style={{ objectFit: 'contain', borderRadius: '4px' }}
                            />
                          </div>
                        )}
                        <span className="company-name b3" style={{ fontSize: '16px', fontWeight: '600' }}>
                          {company.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <ul className="rbt-meta instructor-meta d-flex flex-wrap gap-4 mt--10 mb--15 liststyle-none" style={{ padding: 0 }}>
                  <li className="d-flex align-items-center gap-1">
                    <i className="feather-star color-warning"></i> 
                    <span><b>{teacher.star}</b> Rating</span>
                  </li>
                  <li className="d-flex align-items-center gap-1">
                    <i className="feather-message-square color-primary"></i> 
                    <span><b>{teacher.ratingNumber}</b> Reviews</span>
                  </li>
                  <li className="d-flex align-items-center gap-1">
                    <i className="feather-user color-info"></i> 
                    <span><b>{teacher.studentNumber}</b> Students</span>
                  </li>
                  <li className="d-flex align-items-center gap-1">
                    <i className="feather-video color-secondary"></i> 
                    <span><b>{teacher.course}</b> Courses</span>
                  </li>
                </ul>

                <div className="company-info-wrapper d-flex align-items-center flex-wrap gap-3 mt--15 mb--15">
                  {teacher.companies && teacher.companies.length > 1 &&
                    teacher.companies.slice(1).map((company, cIndex) => (
                      <div key={cIndex} className="company-item d-flex align-items-center gap-2">
                        {company.logo?.url && (
                          <div className="company-logo">
                            <Image
                              src={company.logo.url}
                              width={24}
                              height={24}
                              alt={company.name}
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        )}
                        <span className="company-name b3">
                          {company.name}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div className="content">
                <div 
                  className="description instructor-bio-text" 
                  dangerouslySetInnerHTML={{ __html: teacher.desc }}
                ></div>

                <div className="instructor-actions">
                  <Link 
                    href={teacher.linkedinUrl} 
                    className="rbt-btn btn-gradient hover-icon-reverse linkedin-btn-custom"
                  >
                    <span className="btn-text">LinkedIn</span>
                    <span className="btn-icon"><i className="feather-linkedin"></i></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Instructor;
