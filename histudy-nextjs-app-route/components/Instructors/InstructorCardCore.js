import React from "react";
import Image from "next/image";

const InstructorCardCore = ({ instructor, onOpenModal, className = "", showSocialIcons = true }) => {
    const imageUrl = instructor.file?.url || "/images/team/team-01.jpg";

    return (
        <div className={`rbt-team team-style-variant instructor-card-rectangular ${className}`}>
            <div className="inner">
                <div className="thumbnail-wrapper">
                    <div className="thumbnail" onClick={() => !showSocialIcons && onOpenModal && onOpenModal(instructor)} style={{ cursor: 'pointer' }}>
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
                            <h4 className="title" onClick={(e) => {
                                e.stopPropagation();
                                onOpenModal && onOpenModal(instructor);
                            }} style={{ cursor: 'pointer' }}>{instructor.name}</h4>
                            <h6 className="subtitle">{instructor.expertise}</h6>
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
