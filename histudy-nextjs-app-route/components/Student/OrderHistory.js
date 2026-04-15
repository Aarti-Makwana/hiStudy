import React, { useState } from "react";

const OrderHistory = () => {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundOrderId, setRefundOrderId] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundError, setRefundError] = useState("");

  const orders = [
    {
      order_id: "5478",
      course: "App Development",
      date: "January 27, 2022",
      price: "$100.99",
      status: "Success",
    },
    {
      order_id: "4585",
      course: "Graphic",
      date: "May 27, 2022",
      price: "$200.99",
      status: "Processing",
    },
    {
      order_id: "9656",
      course: "Graphic",
      date: "March 27, 2022",
      price: "$200.99",
      status: "On Hold",
    },
    {
      order_id: "2045",
      course: "Application",
      date: "March 27, 2022",
      price: "$200.99",
      status: "Canceled",
    },
  ];

  const openRefundModal = (orderId) => {
    setRefundOrderId(orderId);
    setRefundReason("");
    setRefundError("");
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundOrderId("");
    setRefundReason("");
    setRefundError("");
  };

  const handleRefundSubmit = () => {
    if (!refundReason.trim() || refundReason.trim().length < 20) {
      setRefundError("Please enter at least 20 characters.");
      return;
    }

    // TODO: Replace with actual refund request API call.
    alert(`Refund requested for Order ID #${refundOrderId}`);
    closeRefundModal();
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
                {orders.map((order) => (
                  <tr key={order.order_id}>
                    <th>#{order.order_id}</th>
                    <td>{order.course}</td>
                    <td>{order.date}</td>
                    <td>{order.price}</td>
                    <td>
                      <span
                        className={`rbt-badge-5 ${
                          order.status === "Success"
                            ? "bg-color-success-opacity color-success"
                            : order.status === "Canceled"
                            ? "bg-color-danger-opacity color-danger"
                            : order.status === "On Hold"
                            ? "bg-color-warning-opacity color-warning"
                            : "bg-primary-opacity"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="rbt-btn btn-sm btn-border"
                        onClick={() => openRefundModal(order.order_id)}
                      >
                        Refund
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRefundModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "520px" }}>
            <div className="modal-content rbt-shadow-box">
              <div className="modal-header border-0">
                <h5 className="modal-title">Refund Request</h5>
                <button type="button" className="btn-close" onClick={closeRefundModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb--20">
                  <label className="form-label">Order ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`#${refundOrderId}`}
                    readOnly
                  />
                </div>

                <div className="mb--20">
                  <label className="form-label">Reason for refund</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={refundReason}
                    onChange={(e) => {
                      setRefundReason(e.target.value);
                      if (refundError && e.target.value.trim().length >= 20) {
                        setRefundError("");
                      }
                    }}
                    placeholder="Enter at least 20 characters..."
                  ></textarea>
                  {refundError && (
                    <p className="text-danger mt--10" style={{ fontSize: "13px" }}>
                      {refundError}
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-end">
                <button className="rbt-btn btn-sm btn-border" onClick={closeRefundModal}>
                  Cancel
                </button>
                <button className="rbt-btn btn-sm btn-gradient" onClick={handleRefundSubmit}>
                  Okay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderHistory;
