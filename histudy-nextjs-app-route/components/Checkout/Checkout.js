"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import CheckoutCartList from "./CheckoutCartList";

const Checkout = () => {
  const { cart: reduxCart, total_amount: reduxTotal, shipping_fee } = useSelector(
    (state) => state.CartReducer
  );
  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("id");

  const cart = buyNowId
    ? reduxCart.filter((item) => item.id == buyNowId)
    : reduxCart;

  const total_amount = buyNowId
    ? cart.reduce((total, item) => total + item.price * 1, 0)
    : reduxTotal;

  const [couponOpen, setCouponOpen] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay();

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: (total_amount + shipping_fee) * 100,
      currency: "INR",
      name: "Histudy",
      description: "Course Purchase",
      image: "/images/logo/logo.png",
      handler: function (response) {
        alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#192335",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <>
      <div className="container">
        <div className="row g-5 checkout-form">
          <CheckoutCartList cart={cart} buyNowId={buyNowId} />

          <div className="col-lg-5">
            <div className="row pl--50 pl_md--0 pl_sm--0">
              <div className="col-12 mb--60">
                <h4 className="checkout-title">Summary</h4>

                <div className="checkout-cart-total">
                  <h4>
                    Product <span>Total</span>
                  </h4>

                  <ul>
                    {cart.map((data, index) => (
                      <li key={index}>
                        {data.product.courseTitle || data.product.title}
                        <span>Rs. {buyNowId ? data.product.price : data.product.price * data.amount}</span>
                      </li>
                    ))}
                  </ul>

                  <p>
                    Sub Total
                    <span>Rs. {total_amount}</span>
                  </p>

                  <p>
                    Shipping Fee <span>Rs. {shipping_fee}</span>
                  </p>

                  <div className="coupon-section mt--20">
                    <div
                      className="checkout-coupon-toggle d-flex justify-content-between align-items-center"
                      onClick={() => setCouponOpen(!couponOpen)}
                    >
                      <span>Got a coupon? Enter here</span>
                      <i className={`feather-${couponOpen ? 'chevron-up' : 'chevron-down'}`}></i>
                    </div>
                    {couponOpen && (
                      <div className="checkout-coupon-input mt--10 d-flex">
                        <input
                          type="text"
                          placeholder="Coupon Code"
                          className="w-100 mr--10"
                        />
                        <button className="rbt-btn btn-gradient btn-sm d-flex justify-content-center align-items-center">
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 className="mt--30">
                    Grand Total <span>Rs. {total_amount + shipping_fee}</span>
                  </h4>
                </div>
              </div>

              <div className="col-12 mb--60">
                <h4 className="checkout-title">Payment Method</h4>
                <div
                  className="checkout-payment-method accordion rbt-accordion-style rbt-accordion-05"
                  id="accordionExamplea1"
                >
                  <div className="single-method">
                    <input
                      type="radio"
                      id="payment_check"
                      name="payment-method"
                      value="check"
                      defaultChecked
                    />
                    <label htmlFor="payment_check">Razorpay (Online Payment)</label>
                  </div>

                  <div className="single-method">
                    <input type="checkbox" id="accept_terms" />
                    <label htmlFor="accept_terms">
                      I’ve read and accept the terms & conditions
                    </label>
                  </div>
                </div>
                <div className="plceholder-button mt--50">
                  <button
                    className="rbt-btn btn-gradient hover-icon-reverse w-100"
                    onClick={handlePayment}
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Proceed to Pay</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(Checkout), { ssr: false });
