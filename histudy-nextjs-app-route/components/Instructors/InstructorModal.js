import React from "react";
import Image from "next/image";
import Link from "next/link";

const InstructorModal = ({ instructor, onClose }) => {
    if (!instructor) return null;

    return (
        <div
            className="rbt-default-modal modal fade show"
            style={{ display: 'block', paddingRight: '17px', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content border-0">
                    <div className="modal-header">
                        <button
                            type="button"
                            className="rbt-round-btn"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <i className="feather-x"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="inner">
                            <div className="row g-5 align-items-center">
                                <div className="col-lg-5">
                                    <div className="thumbnail">
                                        <Image
                                            src={instructor.file?.url || "/images/team/team-01.jpg"}
                                            width={415}
                                            height={555}
                                            alt={instructor.name}
                                            className="w-100 rbt-radius"
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-7">
                                    <div className="content pl--20 pl_md--0 pl_sm--0">
                                        <div className="d-flex align-items-center gap-3 mb--5">
                                            <h4 className="title mb-0">{instructor.name}</h4>
                                            {instructor.socialMedia && (
                                                <ul className="social-icon social-default icon-naked m-0 p-0 d-flex gap-2" style={{ listStyle: 'none' }}>
                                                    {instructor.socialMedia.map((social, idx) => (
                                                        <li key={idx} className="m-0">
                                                            <Link href={social.url} target="_blank" aria-label={social.platform}>
                                                                <i className={`feather-${social.platform.toLowerCase()}`} style={{ fontSize: '20px', color: 'var(--color-primary)' }}></i>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <h6 className="subtitle theme-gradient mb--15">{instructor.subject || instructor.expertise}</h6>

                                        {instructor.companies && (
                                            <div className="companies-list mb--20">
                                                <ul className="rbt-meta justify-content-start mt--10 mb--10 list-horizontal-bullets">
                                                    {(typeof instructor.companies === 'string'
                                                        ? instructor.companies.split(',')
                                                        : Array.isArray(instructor.companies)
                                                            ? instructor.companies
                                                            : []
                                                    ).map((company, idx) => (
                                                        <li key={idx} className="mr--15" style={{ display: 'inline-flex', alignItems: 'center', fontSize: '14px', color: 'var(--color-body)' }}>
                                                            {idx > 0 && <span className="bullet-separator" style={{ marginRight: '10px' }}>•</span>}
                                                            {typeof company === 'string' ? (
                                                                company.trim()
                                                            ) : (company && typeof company === 'object') ? (
                                                                <>
                                                                    {company.logo && company.logo.url && (
                                                                        <Image
                                                                            src={company.logo.url}
                                                                            width={24}
                                                                            height={24}
                                                                            alt={company.name || "Company Logo"}
                                                                            style={{ marginRight: '8px', objectFit: 'contain', borderRadius: '4px' }}
                                                                        />
                                                                    )}
                                                                    {company.name}
                                                                </>
                                                            ) : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="description mt--20">
                                            <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--color-body)' }}>
                                                {instructor.bio || instructor.short_description}
                                            </p>
                                        </div>

                                        {instructor.socialMedia && (
                                            <div className="social-links-area mt--30">
                                                <ul className="social-icon social-default justify-content-start">
                                                    {instructor.socialMedia.map((social, idx) => {
                                                        const isLinkedIn = social.platform.toLowerCase() === 'linkedin';
                                                        return (
                                                            <li key={idx} className={isLinkedIn ? "linkedin-link-wrapper" : ""}>
                                                                <Link href={social.url} className="d-flex align-items-center gap-2">
                                                                    <i className={`feather-${social.platform.toLowerCase()}`}></i>
                                                                    {isLinkedIn && <span className="social-text">LinkedIn</span>}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorModal;
