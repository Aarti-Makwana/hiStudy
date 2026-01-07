"use client";

import React from "react";
import Image from "next/image";
import { useSelector } from "react-redux";

const CheckoutCartList = ({ cart, buyNowId }) => {

    return (
        <div className="col-lg-7">
            {buyNowId && (
                <div className="course-id-display mb--10">
                    Course ID: #{buyNowId}
                </div>
            )}
            {!buyNowId && cart.length > 0 && (
                <div className="course-id-display mb--10">
                    Course IDs: {cart.map(item => `#${item.id}`).join(', ')}
                </div>
            )}

            <div className="checkout-content-wrapper mb--20">
                <div className="checkout-table table-responsive">
                    <h4 className="checkout-title">Your Cart</h4>
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="pro-thumbnail">Course Video</th>
                                <th className="pro-title">Course</th>
                                <th className="pro-price">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((data, index) => (
                                <tr key={index}>
                                    <td className="pro-thumbnail" data-title="Course Video">
                                        <div className="course-item">
                                            <Image
                                                src={data.product.courseImg || data.product.img}
                                                width={100}
                                                height={70}
                                                alt="Course"
                                            />
                                        </div>
                                    </td>
                                    <td className="pro-title" data-title="Course">
                                        <span className="item-title">
                                            {data.product.courseTitle || data.product.title}
                                        </span>
                                        <ul>
                                            {data.product.roadmap ? (
                                                data.product.roadmap.slice(0, 2).map((item, i) => (
                                                    <li key={i}>{item.text}: {item.desc}</li>
                                                ))
                                            ) : (
                                                <>
                                                    <li>Start Date: Enrolled</li>
                                                    <li>Lectures: Skill Level</li>
                                                </>
                                            )}
                                        </ul>
                                    </td>
                                    <td className="pro-price" data-title="Price">
                                        <span>Rs. {buyNowId ? data.product.price : data.product.price * data.amount}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="trust-badge-section text-center">
                <div className="trust-badge-container">
                    <div className="badge-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr--10">
                            <circle cx="12" cy="12" r="10" fill="#28a745" fillOpacity="0.1" />
                            <path d="M8 12L11 15L16 9" stroke="#28a745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>100% safe and secure</span>
                    </div>
                    <div className="badge-item">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr--10">
                            <rect x="5" y="11" width="14" height="10" rx="2" stroke="#28a745" strokeWidth="2" />
                            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#28a745" strokeWidth="2" />
                            <circle cx="12" cy="16" r="1" fill="#28a745" />
                        </svg>
                        <div className="secure-text">
                            <div className="title">SECURE</div>
                            <div className="subtitle">SSL ENCRYPTION</div>
                        </div>
                    </div>
                    <div className="badge-item">
                        <svg width="100" height="24" viewBox="0 0 100 24" fill="none" className="razorpay-logo-v2">
                            <path d="M12.5 4L4 13H11L10 20L18.5 11H11.5L12.5 4Z" fill="#2b7fff" />
                            <text x="22" y="18">Razorpay</text>
                        </svg>
                    </div>
                </div>
                <p className="no-hidden-charges">(No Hidden Charges)</p>
            </div>
        </div>
    );
};

export default CheckoutCartList;
