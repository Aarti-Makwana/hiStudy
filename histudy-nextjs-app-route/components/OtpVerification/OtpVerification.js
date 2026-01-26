"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/navigation";
import { UserAuthServices } from "../../services/User";
import Link from "next/link";
import Swal from "sweetalert2";
import { setToken, setUser } from "../../utils/storage";
import { setLocalStorageToken } from "../../utils/common.util";

const OtpVerification = forwardRef((props, ref) => {
  const { email, xId, xAction, redirectPath = "/login", hideInternalButton = false, onSuccess } = props;
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [currentXId, setCurrentXId] = useState(xId);
  const [currentXAction, setCurrentXAction] = useState(xAction);

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
        "X-Id": currentXId || xId,
        "X-Action": currentXAction || xAction,
      };

      const res = await UserAuthServices.otpVerify(formData, headers);
      if (res && res.status === "success") {
        let handledExternally = false;
        if (typeof props.onSuccess === 'function') {
          handledExternally = props.onSuccess(res);
        }

        if (handledExternally) return;

        Swal.fire("Success!", res.message || "OTP verified", "success");
        setOtp("");
        // If this was a forgot password flow, redirect to reset-password with token
        if (xAction === "forgot") {
          const token = res?.data?.token || "";
          const url = `/reset-password?email=${encodeURIComponent(email || "")}&token=${encodeURIComponent(token)}`;
          router.push(url);
        } else {
          // For login/register OTP verification, store token and user and redirect to home
          const token = res?.data?.token || "";
          const userObj = res?.data?.user || null;
          if (token) setLocalStorageToken(token); // Use encrypted storage
          if (userObj) setUser(userObj);

          window.dispatchEvent(new Event("auth-change")); // Sync header state
          router.push("/");
        }

      } else {
        const msg = res?.message || "OTP verification failed";
        Swal.fire("Oops!", msg, "error");
      }
    } catch (err) {
      Swal.fire("Oops!", err?.message || "OTP verification error", "error");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    verify: handleVerify,
    isReady: () => otp.length === 6,
  }));

  // Resend OTP handler with simple 30s cooldown
  const handleResend = async () => {
    if (resendDisabled) return;
    setResendDisabled(true);
    setResendCountdown(60);
    try {
      const body = { email: email || "", type: currentXAction || xAction || "forgot" };
      const resp = await UserAuthServices.resendOtp(body);
      if (resp && resp.status === "success") {
        Swal.fire("Success!", resp.message || "OTP resent", "success");
        // update current xId/xAction from response so verify uses latest headers
        const newXId = resp?.data?.x_id;
        const newXAction = resp?.data?.x_action;
        if (newXId) setCurrentXId(newXId);
        if (newXAction) setCurrentXAction(newXAction);
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            const stored = JSON.parse(sessionStorage.getItem('otp_flow')) || {};
            const updated = { ...stored, email: email || stored.email, x_id: newXId || stored.x_id, x_action: newXAction || stored.x_action };
            sessionStorage.setItem('otp_flow', JSON.stringify(updated));
          }
        } catch (e) { }
      } else {
        Swal.fire("Oops!", resp?.message || "Failed to resend OTP", "error");
      }
    } catch (err) {
      Swal.fire("Oops!", err?.message || "Resend OTP error", "error");
    }
    // start countdown timer
    const timer = setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="otp-verification">
      <h4>Enter OTP</h4>
      <p>We've sent a 6-digit code to <strong>{email}</strong></p>
      <div className="form-group">
        <input
          value={otp}
          onChange={handleChange}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className="form-control"
          inputMode="numeric"
        />
      </div>
      {!hideInternalButton && (
        <div className="form-submit-group">
          <button
            type="button"
            className="rbt-btn btn-md btn-gradient hover-icon-reverse"
            disabled={otp.length !== 6 || loading}
            onClick={handleVerify}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}
      <div className="mt-2 text-center">
        {/* <button type="button" className="rbt-btn-link" onClick={handleResend} disabled={resendDisabled}>
          {resendDisabled ? `Resend OTP (${resendCountdown}s)` : "Resend OTP"}
        </button> */}

        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (!resendDisabled) handleResend();
          }}
          className={`otp-back-link ${resendDisabled ? "disabled" : ""}`}
        >
          {resendDisabled
            ? `Resend OTP (${resendCountdown}s)`
            : "Resend OTP"}
        </Link>
      </div>
    </div>
  );
});

export default OtpVerification;
