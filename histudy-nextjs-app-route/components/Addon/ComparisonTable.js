import React from "react";
import "./comparison.css";

const ComparisonTable = () => {
    return (
        <div className="container my-5">
            <h2 className="text-center fw-bold mb-3">
                MilesWeb vs Others: Who delivers more value?
            </h2>
            <p className="text-center text-muted mb-5">
                We’ve compared MilesWeb with leading web hosting providers to help you
                make the smarter choice.
            </p>

            <div className="row justify-content-center">
                <div className="col-md-10">

                    <div className="table-responsive">
                        <table className="table align-middle text-center comparison-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th className="highlight-column">
                                        <h5 className="fw-bold">MilesWeb</h5>
                                        <small className="text-muted">
                                            Your Hosting, Our Responsibility.
                                        </small>
                                    </th>
                                    <th>
                                        <h5 className="fw-bold">Hostinger</h5>
                                    </th>
                                    <th>
                                        <h5 className="fw-bold">GoDaddy</h5>
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td className="text-start fw-semibold">Company origin</td>
                                    <td className="highlight-column text-success">✔</td>
                                    <td className="text-danger">✖</td>
                                    <td className="text-danger">✖</td>
                                </tr>

                                <tr className="section-title">
                                    <td className="text-primary fw-bold text-start">Price</td>
                                    <td className="highlight-column"></td>
                                    <td></td>
                                    <td></td>
                                </tr>

                                <tr>
                                    <td className="text-start">Offer price</td>
                                    <td className="highlight-column fw-bold">₹99.00/mo</td>
                                    <td>₹129.00/mo</td>
                                    <td>₹219.00/mo</td>
                                </tr>

                                <tr>
                                    <td className="text-start">Renewal price</td>
                                    <td className="highlight-column fw-bold">
                                        ₹99.00/mo
                                        <div className="text-primary small">
                                            (Same price at renewal)
                                        </div>
                                    </td>
                                    <td>
                                        ₹449.00/mo
                                        <div className="text-warning small">
                                            (300% increase)
                                        </div>
                                    </td>
                                    <td>
                                        ₹599.00/mo
                                        <div className="text-warning small">
                                            (270% increase)
                                        </div>
                                    </td>
                                </tr>

                                <tr className="section-title">
                                    <td className="text-primary fw-bold text-start">Features</td>
                                    <td className="highlight-column"></td>
                                    <td></td>
                                    <td></td>
                                </tr>

                                <tr>
                                    <td className="text-start">Email accounts</td>
                                    <td className="highlight-column">Free</td>
                                    <td>Paid</td>
                                    <td>Free</td>
                                </tr>

                                <tr>
                                    <td className="text-start">SSH access</td>
                                    <td className="highlight-column text-success">✔</td>
                                    <td className="text-success">✔</td>
                                    <td className="text-danger">✖</td>
                                </tr>

                                <tr>
                                    <td className="text-start">Daily backups</td>
                                    <td className="highlight-column text-success">✔</td>
                                    <td className="text-success">✔</td>
                                    <td className="text-danger">✖</td>
                                </tr>

                                <tr>
                                    <td className="text-start">Full website migration</td>
                                    <td className="highlight-column text-success">✔</td>
                                    <td className="text-danger">✖</td>
                                    <td className="text-danger">✖</td>
                                </tr>

                                <tr>
                                    <td className="text-start">Email migration</td>
                                    <td className="highlight-column text-success">✔</td>
                                    <td className="text-danger">✖</td>
                                    <td className="text-danger">✖</td>
                                </tr>

                                <tr>
                                    <td className="text-start">Database migration</td>
                                    <td className="highlight-column text-success">✔</td>
                                    <td className="text-danger">✖</td>
                                    <td className="text-danger">✖</td>
                                </tr>

                                <tr>
                                    <td className="text-start">Application migration</td>
                                    <td className="highlight-column text-success">✔</td>
                                    <td className="text-danger">✖</td>
                                    <td className="text-danger">✖</td>
                                </tr>

                                <tr>
                                    <td></td>
                                    <td className="highlight-column">
                                        <button className="btn btn-primary px-4 rounded-pill">
                                            Get Started
                                        </button>
                                    </td>
                                    <td></td>
                                    <td></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ComparisonTable;
