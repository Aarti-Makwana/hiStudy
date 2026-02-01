"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { UserOrderServices } from "@/services/User";
import { isValidCouponFormat } from "@/validations/coupon";

import CheckoutCartList from "./CheckoutCartList";

const Checkout = () => {
  const { cart: reduxCart, total_amount: reduxTotal } =
    useSelector((state) => state.CartReducer);

  const searchParams = useSearchParams();
  const buyNowId = searchParams.get("id");

  const cart = buyNowId
    ? reduxCart.filter((item) => item.id == buyNowId)
    : reduxCart;

  const total_amount = buyNowId
    ? cart.reduce((total, item) => total + item.price * 1, 0)
    : reduxTotal;

  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountedTotal, setDiscountedTotal] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);


  const handleApplyCoupon = async () => {
    setCouponError(null);
    setCouponSuccess(null);

    if (!isValidCouponFormat(couponCode)) {
      setCouponError("Invalid coupon format. Expected 8-character code (e.g., A489F27A).");
      return;
    }

    try {
      const payload = {
        code: couponCode,
        order_total: total_amount,
      };

      const res = await UserOrderServices.applyCoupon(payload);

      if (res?.status === "success" || res?.type === "success") {
        setCouponSuccess(res.message || "Coupon applied successfully!");

        const couponData = res.data;
        if (couponData && couponData.final_amount !== undefined) {
          setDiscountedTotal(couponData.final_amount);
        } else if (res.discounted_total !== undefined) {
          setDiscountedTotal(res.discounted_total);
        } else {
          setCouponSuccess("Coupon applied, but no discount info returned.");
        }
      } else {
        setCouponError(res?.message || "Invalid coupon.");
        setDiscountedTotal(null);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || err.message || "Failed to apply coupon");
      setDiscountedTotal(null);
    }
  };

  /* ---------------- Razorpay SDK Loader ---------------- */
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  /* ---------------- Backend API Call ---------------- */
  const placeOrder = async (payload) => {
    const data = await UserOrderServices.placeOrder(payload);
    return data;
  };

  /* ---------------- Payment Flow ---------------- */
  const handlePayment = async () => {
    try {
      setStatus("loading");
      setError(null);

      const loaded = await loadRazorpay();
      if (!loaded) {
        setStatus("failed");
        setError("Razorpay SDK failed to load");
        return;
      }

      /* 1️⃣ Create Order */
      const finalAmount = discountedTotal !== null ? discountedTotal : total_amount;
      const discountAmount = discountedTotal !== null ? (total_amount - discountedTotal) : 0;

      const orderPayload = {
        order_status: "create_order",
        courses: cart.map((item) => item.product?.id),
        bundles: [],
        coupon_code: discountedTotal !== null ? couponCode : "",
        order_sub_total: total_amount,
        order_discount: discountAmount,
        order_total: finalAmount,
      };

      const data = await placeOrder(orderPayload);

      // The service returns the response data directly or throws
      // APIrequest typically returns res.data which corresponds to the body
      // We need to check the status field from the backend response
      if (data?.status !== "success") {
        setStatus("failed");
        setError("Unable to create order");
        return;
      }

      const res = data.data;

      /* 2️⃣ Razorpay Options */
      const options = {
        key: res.gateway_key,
        amount: res.gateway_amount,
        currency: res.gateway_currency,
        name: "Histudy",
        description: "Course Purchase",
        order_id: res.gateway_order_id,

        handler: async (response) => {
          try {
            /* 3️⃣ Verify Payment */
            const verifyPayload = {
              ...orderPayload,
              order_status: "verify_order_payment",
              gateway_order_id: response.razorpay_order_id,
              gateway_payment_id: response.razorpay_payment_id,
              gateway_signature: response.razorpay_signature,
              gateway_amount: res.gateway_amount,
              gateway_currency: res.gateway_currency,
            };

            const verifyRes = await placeOrder(verifyPayload);

            if (verifyRes?.status === "success") {
              setStatus("success");
            } else {
              setStatus("pending");
            }
          } catch {
            setStatus("pending");
          }
        },

        modal: {
          ondismiss: () => {
            setStatus("failed");
            setError("Payment cancelled by user");
          },
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

      const rzp = new window.Razorpay(options);

      /* 4️⃣ Payment Failed */
      rzp.on("payment.failed", async (res) => {
        setStatus("failed");
        setError(res.error?.description || "Payment failed");

        await placeOrder({
          ...orderPayload,
          order_status: "failed",
          gateway_order_id: res.error?.metadata?.order_id,
          gateway_payment_id: res.error?.metadata?.payment_id,
          reason: res.error?.description,
          payload: res.error,
        });
      });

      rzp.open();
    } catch (err) {
      setStatus("failed");
      setError("Unable to initiate payment");
      console.error(err);
    }
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
                        <span>
                          Rs.{" "}
                          {buyNowId
                            ? data.product.price
                            : data.product.price * data.amount}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p>
                    Sub Total
                    <span>Rs. {total_amount}</span>
                  </p>


                  <div className="coupon-section mt--20">
                    <div
                      className="checkout-coupon-toggle d-flex justify-content-between align-items-center"
                      onClick={() => setCouponOpen(!couponOpen)}
                    >
                      <span>Got a coupon? Enter here</span>
                      <i
                        className={`feather-${couponOpen ? "chevron-up" : "chevron-down"
                          }`}
                      ></i>
                    </div>
                    {couponOpen && (
                      <div className="checkout-coupon-input mt--10">
                        <div className="d-flex">
                          <input
                            type="text"
                            placeholder="Coupon Code"
                            className="w-100 mr--10"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                          />
                          <button
                            className="rbt-btn btn-gradient btn-sm d-flex justify-content-center align-items-center"
                            onClick={handleApplyCoupon}
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-danger mt-2">{couponError}</p>}
                        {couponSuccess && <p className="text-success mt-2">{couponSuccess}</p>}
                      </div>
                    )}
                  </div>

                  <h4 className="mt--30">
                    Grand Total <span>Rs. {total_amount}</span>
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
                    <label htmlFor="payment_check">
                      Razorpay (Online Payment)
                    </label>
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
                    disabled={status === "loading"}
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">
                        {status === "loading"
                          ? "Processing..."
                          : "Proceed to Pay"}
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </button>
                  {status === "success" && (
                    <p className="mt-3 text-success">✅ Payment Successful</p>
                  )}
                  {status === "pending" && (
                    <p className="mt-3 text-warning">⏳ Payment Pending</p>
                  )}
                  {status === "failed" && (
                    <p className="mt-3 text-danger">❌ {error}</p>
                  )}
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
