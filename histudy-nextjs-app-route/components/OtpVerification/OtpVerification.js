"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserAuthServices } from "../../services/User";
import Toaster, { showToast } from "../Toaster/Toaster";

const OtpVerification = ({ email, xId, xAction, redirectPath = "/login" }) => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(val);
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email || "");
      formData.append("otp", otp);

      const headers = {
        "X-Id": xId,
        "X-Action": xAction,
      };

      const res = await UserAuthServices.otpVerify(formData, headers);
        console.log('res ',res);

      if (res && res.status === "success") {
        showToast("success", res.message || "OTP verified");
        setOtp("");
        // redirect based on prop
        router.push(redirectPath);
        
      } else {
        const msg = res?.message || "OTP verification failed";
        showToast("error", msg);
      }
    } catch (err) {
      showToast("error", err?.message || "OTP verification error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-verification">
      <Toaster />
      <h4>Enter OTP</h4>
      <p>We've sent a 6-digit code to <strong>{email}</strong></p>
      <div className="form-group">
        <input
          value={otp}
          onChange={handleChange}
          placeholder="Enter 4-digit OTP"
          maxLength={6}
          className="form-control"
          inputMode="numeric"
        />
      </div>
      <div className="form-submit-group">
        <button
          className="rbt-btn btn-md btn-gradient hover-icon-reverse"
          disabled={otp.length !== 6 || loading}
          onClick={handleVerify}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
