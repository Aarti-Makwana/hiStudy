"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const MoneyBackGuarantee = ({ settings }) => {
    return (
        <section className="rbt-section-gap px-md-4 mw_money_v3_new">
            <div className="container">
                <div className="mw-money-back2 shadow-sm rounded-4 p-4 p-lg-5 bg-white">
                    <div className="row align-items-center">
                        <div className="col-md-3 text-center mb-4 mb-md-0">
                            <div className="mw-money-back2-img">
                                {settings?.badge && (
                                    <img className="img-fluid" src={settings.badge} loading="lazy" alt={settings?.title
                                        || "Money Back Guarantee"} width="229" height="174" />
                                )}
                            </div>
                        </div>
                        <div className="col-md-9 ps-md-4">
                            {settings?.subTitle && (
                                <div className="section-title text-start mb-3">
                                    <span className="subtitle bg-primary-opacity">
                                        {settings.subTitle}
                                    </span>
                                </div>
                            )}
                            <h2 className="mw-h2 mw-money-back-h2 mb-3">{settings?.title}</h2>
                            <p className="mw-p mw-money-back-p2 mb-4" dangerouslySetInnerHTML={{ __html: settings?.body }}>
                            </p>

                            <div className="mw-money-kori-s mb-3">
                                {settings?.sign && (
                                    <img className="img-fluid" src={settings.sign} loading="lazy" alt="Signature" width="153"
                                        height="48" />
                                )}
                            </div>
                            <div className="d-flex align-items-center mb-4">
                                <div className="flex-shrink-0">
                                    {settings?.avatar && (
                                        <img className="img-fluid rounded-circle" src={settings.avatar} width="70" height="70"
                                            loading="lazy" alt={settings?.name} style={{ width: '70px', height: '70px' }} />
                                    )}
                                </div>
                                <div className="ms-3">
                                    <div className="mw_our_name fw-bold">{settings?.name}</div>
                                    <span className="text-muted">{settings?.about}</span>
                                </div>
                            </div>
                            <div className="mw-money-back-btn">
                                <div className="btn btn-light mw-btn jump-to-plans mw-money-btn py-2 px-4 fw-bold text-primary bg-opacity-10"
                                    style={{ background: '#eef5ff' }}>Start Risk-Free</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MoneyBackGuarantee;