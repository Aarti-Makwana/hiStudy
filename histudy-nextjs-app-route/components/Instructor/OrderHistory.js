"use client";

import React, { useEffect, useState } from "react";
import { UserAuthServices } from "../../services/User";

import { useAppContext } from "../../context/Context";

const OrderHistory = () => {
  const { userData, loadingUser } = useAppContext();

  if (loadingUser) return <div className="skeleton" style={{ height: "400px" }}></div>;

  const u = userData || {};
  const orders = u.orders || [];

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
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={index}>
                      <th>#{order.order_id}</th>
                      <td>
                        {order.items?.map(item => item.course?.title).join(", ") || "N/A"}
                      </td>
                      <td>{order.created_at}</td>
                      <td>${order.final_amount}</td>
                      <td>
                        <span className={`rbt-badge-5 ${order.status === 'paid' ? 'bg-color-success-opacity color-success' : 'bg-primary-opacity'}`}>
                          {order.status_label}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No orders found</td>
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
