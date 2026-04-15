"use client";

import React, { useMemo, useState } from "react";
import { showInfo } from "../../utils/swal";

import { useAppContext } from "../../context/Context";

const OrderHistory = () => {
  const { userData, loadingUser } = useAppContext();
  const [refundStatusMap, setRefundStatusMap] = useState({});

  const u = userData || {};
  const orders = useMemo(() => u.orders || [], [u.orders]);

  if (loadingUser) return <div className="skeleton" style={{ height: "400px" }}></div>;

  const normalizeOrderStatus = (order) => {
    const label = String(order.status_label || order.status || "").trim();
    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes("cancel")) return "Cancel";
    if (lowerLabel.includes("pending")) return "Pending";
    if (lowerLabel.includes("success")) return "Successful";
    if (lowerLabel.includes("paid")) return "Successful";
    return label || "N/A";
  };

  const formatDate = (dateString) => {
    if (!dateString) return { date: "-", time: "-" };
    const parts = String(dateString).split(" ");
    if (parts.length >= 2) {
      return { date: parts[0], time: parts.slice(1).join(" ") };
    }
    return { date: dateString, time: "" };
  };

  const getInfoMessage = (order) => {
    return (
      order.message ||
      order.status_message ||
      order.refund?.message ||
      order.refund?.note ||
      order.note ||
      ""
    );
  };

  const handleShowInfo = async (message) => {
    if (!message) return;
    await showInfo("Order Message", String(message));
  };

  const handleRefundClick = (orderId) => {
    setRefundStatusMap((prev) => ({
      ...prev,
      [orderId]: prev[orderId] === "Pending" ? "Pending" : "Pending",
    }));
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Order History</h4>
          </div>

          <div className="rbt-dashboard-table table-responsive mobile-table-750">
            <table className="rbt-table table table-borderless">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Course Name</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => {
                    const { date, time } = formatDate(order.created_at);
                    const statusText = normalizeOrderStatus(order);
                    const orderRefundStatus =
                      order.refund?.status || refundStatusMap[order.order_id] || "";
                    const infoMessage = getInfoMessage(order);
                    const canRefund = statusText === "Successful" && !orderRefundStatus;

                    return (
                      <tr key={index}>
                        <th>#{order.order_id}</th>
                        <td>{order.items?.map((item) => item.course?.title).join(", ") || "N/A"}</td>
                        <td>
                          <div>{date}</div>
                          <div className="b3">{time}</div>
                        </td>
                        <td>${order.final_amount}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className={`rbt-badge-5 ${
                                statusText === "Successful"
                                  ? "bg-color-success-opacity color-success"
                                  : statusText === "Pending"
                                  ? "bg-color-warning-opacity color-warning"
                                  : "bg-color-danger-opacity color-danger"
                              }`}
                            >
                              {statusText}
                            </span>
                            {orderRefundStatus ? (
                              <span className="b3">{orderRefundStatus}</span>
                            ) : null}
                            {infoMessage ? (
                              <button
                                type="button"
                                className="rbt-btn btn-xs bg-color-info-opacity color-info radius-round"
                                onClick={() => handleShowInfo(infoMessage)}
                                title="View order info"
                              >
                                <i className="feather-info" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                        <td>
                          <div className="rbt-button-group justify-content-end">
                            {canRefund ? (
                              <button
                                type="button"
                                className="rbt-btn btn-xs bg-color-danger-opacity radius-round color-danger"
                                onClick={() => handleRefundClick(order.order_id)}
                              >
                                Refund
                              </button>
                            ) : orderRefundStatus ? (
                              <span className="b3">{orderRefundStatus}</span>
                            ) : (
                              <span className="b3">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
