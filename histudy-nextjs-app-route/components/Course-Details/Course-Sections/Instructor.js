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
                />
              </Link>
            </div>
            <div className="media-body">
              <div className="author-info">
                <div className="author-name-wrap d-flex align-items-center gap-2 mb--5">
                  <h5 className="title mb-0">
                    <Link className="hover-flip-item-wrapper" href={`#`}>
                      {teacher.name}
                    </Link>
                  </h5>
                  <Link href={teacher.linkedinUrl} className="linkedin-icon-link">
                    <i className="feather-linkedin branding-linkedin"></i>
                  </Link>
                </div>

                <span className="b3 subtitle instructor-subtitle">
                  JAVA, DSA in JAVA
                </span>

                <div className="company-info-wrapper d-flex align-items-center flex-wrap gap-3 mt--15 mb--15">
                  {teacher.companies && teacher.companies.length > 0 &&
                    teacher.companies.map((company, cIndex) => (
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
