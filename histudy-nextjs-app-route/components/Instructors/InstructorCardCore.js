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
                             {/* Company and Expertise at Top */}
                             {instructor.companies && (
                                 <div className="company-info-top d-flex align-items-center mb--5" style={{ pointerEvents: 'auto' }}>
                                     {(typeof instructor.companies === 'string'
                                         ? instructor.companies.split(',')
                                         : Array.isArray(instructor.companies)
                                             ? instructor.companies
                                             : []
                                     ).map((company, idx) => (
                                         <div key={idx} className="d-flex align-items-center mr--10">
                                             {idx > 0 && <span className="bullet-separator" style={{ margin: '0 8px', color: 'var(--color-primary)' }}>•</span>}
                                             {company.logo?.url && (
                                                 <div style={{ background: '#fff', borderRadius: '4px', padding: '2px', display: 'flex', marginRight: '6px' }}>
                                                  <Image 
                                                      src={company.logo.url} 
                                                      width={20} 
                                                      height={20} 
                                                      alt="logo" 
                                                      style={{ objectFit: 'contain' }}
                                                  />
                                                 </div>
                                             )}
                                             <span style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>
                                                 {typeof company === 'string' ? company.trim() : (company?.name || '')}
                                             </span>
                                         </div>
                                     ))}
                                 </div>
                             )}
                             <h6 className="subtitle theme-gradient mb--5" style={{ fontSize: '13px', fontWeight: '500', opacity: '0.9' }}>{instructor.expertise}</h6>

                             <h4 className="title" style={{ fontSize: '26px', marginBottom: '10px' }}>{instructor.name}</h4>


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
