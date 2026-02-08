"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const MoneyBackGuarantee = () => {
    return (
        <section className="rbt-section-gap px-md-4 mw_money_v3_new">
            <div className="container">
                <div className="mw-money-back2 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
                    <div className="row align-items-center">
                        <div className="col-md-3 text-center mb-4 mb-md-0">
                            <div className="mw-money-back2-img">
                                <img
                                    className="img-fluid"
                                    src="https://www.milesweb.in/assets/img/mw/30-day3.png"
                                    loading="lazy"
                                    alt="30-Day Money Back | MilesWeb India"
                                    title="30-Day Money Back | MilesWeb India"
                                    width="229"
                                    height="174"
                                />
                            </div>
                        </div>
                        <div className="col-md-9 ps-md-4">
                            <h2 className="mw-h2 mw-money-back-h2 mb-3">30-Day Money Back</h2>
                            <p className="mw-p mw-money-back-p2 mb-4">
                                Experience MilesWeb with confidence. If we don’t meet your expectations, simply&nbsp;<span>request a refund</span>&nbsp; — we’ll process it promptly with <span>no questions asked</span>.
                            </p>
                            <div className="mw-money-kori-s mb-3">
                                <img
                                    className="img-fluid"
                                    src="https://www.milesweb.in/assets/img/mw/deepak_kori-s.png"
                                    loading="lazy"
                                    alt="Deepak Kori | MilesWeb India"
                                    title="Deepak Kori | MilesWeb India"
                                    width="153"
                                    height="48"
                                />
                            </div>
                            <div className="d-flex align-items-center mb-4">
                                <div className="flex-shrink-0">
                                    <img
                                        className="img-fluid rounded-circle"
                                        src="https://www.milesweb.in/assets/img/mw/deepak-kori-2.png"
                                        width="70"
                                        height="70"
                                        loading="lazy"
                                        alt="Deepak Kori | MilesWeb India"
                                        title="Deepak Kori | MilesWeb India"
                                        style={{ width: '70px', height: '70px' }}
                                    />
                                </div>
                                <div className="ms-3">
                                    <div className="mw_our_name fw-bold">Deepak Kori</div>
                                    <span className="text-muted">Co-Founder, MilesWeb</span>
                                </div>
                            </div>
                            <div className="mw-money-back-btn">
                                <div className="btn btn-light mw-btn jump-to-plans mw-money-btn py-2 px-4 fw-bold text-primary bg-opacity-10" style={{ background: '#eef5ff' }}>Start Risk-Free</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MoneyBackGuarantee;
