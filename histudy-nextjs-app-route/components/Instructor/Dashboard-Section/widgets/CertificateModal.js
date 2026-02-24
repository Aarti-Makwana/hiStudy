"use client";

import React from "react";

const CertificateModal = ({ show, onClose, onConfirm }) => {
    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Certificate Options</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>Do you want to print QR on the certificate to access your report card?</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onConfirm(false)}
                        >
                            No
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => onConfirm(true)}
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateModal;
