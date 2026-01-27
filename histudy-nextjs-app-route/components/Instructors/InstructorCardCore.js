import React from "react";
import Image from "next/image";

const InstructorCardCore = ({ instructor, onOpenModal, className = "", showSocialIcons = true }) => {
    const imageUrl = instructor.file?.url || "/images/team/team-01.jpg";

    return (
        <div className={`rbt-team team-style-variant instructor-card-rectangular ${className}`}>
            <div className="inner">
                <div className="thumbnail-wrapper">
                    <div className="thumbnail">
                        <Image
                            src={imageUrl}
                            width={415}
                            height={555}
                            alt={instructor.name}
                            priority
                        />

                        {/* Central Arrow Icon - restored for rectangular card */}
                        {!showSocialIcons && (
                            <div className="hover-overlay-centered">
                                <div className="arrow-icon" onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenModal && onOpenModal(instructor);
                                }}>
                                    <i className="feather-corner-up-left"></i>
                                </div>
                            </div>
                        )}

                        <div className="content-overlay-bottom">
                            {showSocialIcons && (
                                <ul className="social-icon">
                                    <li><a href="#"><i className="feather-facebook"></i></a></li>
                                    <li><a href="#"><i className="feather-linkedin"></i></a></li>
                                    <li><a href="#"><i className="feather-twitter"></i></a></li>
                                </ul>
                            )}
                            <h4 className="title">{instructor.name}</h4>

                            {/* Company Name Display */}
                            <h6 className="subtitle theme-gradient">{instructor.expertise}</h6>
                            {instructor.companies && (
                                <div className="company-name" style={{ fontSize: '14px', color: '#ffffff', marginTop: '5px' }}>
                                    {(typeof instructor.companies === 'string'
                                        ? instructor.companies.split(',')
                                        : Array.isArray(instructor.companies)
                                            ? instructor.companies
                                            : []
                                    ).map((company, idx) => (
                                        <span key={idx}>
                                            {idx > 0 && <span className="bullet-separator" style={{ margin: '0 5px' }}>•</span>}
                                            {typeof company === 'string'
                                                ? company.trim()
                                                : (company && typeof company === 'object' && company.name)
                                                    ? company.name
                                                    : ''}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* LinkedIn Icon Display */}
                            {instructor.socialMedia && instructor.socialMedia.some(social => social.platform.toLowerCase() === 'linkedin') && (
                                <div className="linkedin-icon" style={{ marginTop: '5px' }}>
                                    {instructor.socialMedia.filter(social => social.platform.toLowerCase() === 'linkedin').map((social, idx) => (
                                        <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', fontSize: '18px' }} onClick={(e) => e.stopPropagation()}>
                                            <i className="feather-linkedin"></i>
                                        </a>
                                    ))}
                                </div>
                            )}

                            <div className="hover-content">
                                {instructor.courses && (
                                    <span className="course-count">{instructor.courses.length} Courses</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorCardCore;
