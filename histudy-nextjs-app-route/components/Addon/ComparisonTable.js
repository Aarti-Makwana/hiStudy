import React from "react";
import "./comparison.css";

const ComparisonTable = ({ settings }) => {
    if (!settings) return null;

    const { heading, features, providers } = settings;

    // Mapping feature text to data keys based on API response structure
    const keyMap = {
        "Know Your Tutor Before Joining": "know_tutor",
        "Curriculum": "curriculum",
        "Course Updates": "updates",
        "Resume Help": "resume_help",
        "Community": "community",
        "Pricing": "pricing",
        "Refund Policy": "refund"
    };

    return (
        <div className="container my-5">
            <div className="section-title text-center mb-3">
                {settings?.subTitle && (
                    <span className="subtitle bg-primary-opacity">
                        {settings.subTitle}
                    </span>
                )}
                <h2 className="title fw-bold">
                    {heading}
                </h2>
            </div>
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
                                    {providers.map((provider, index) => (
                                        <th key={index} className={provider.highlight === "1" ? "highlight-column" : ""}>
                                            <h5 className="fw-bold">{provider.name}</h5>
                                            {provider.highlight === "1" && (
                                                <small className="text-muted">
                                                    Your Hosting, Our Responsibility.
                                                </small>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {features.map((feature, featureIndex) => {
                                    const dataKey = keyMap[feature] || feature; // Fallback to feature name if no map
                                    return (
                                        <tr key={featureIndex}>
                                            <td className="text-start fw-semibold">{feature}</td>
                                            {providers.map((provider, providerIndex) => {
                                                const value = provider.data[dataKey] || "—";
                                                const isCheck = value.includes("✅");
                                                const isCross = value.includes("❌");

                                                // Simple formatting for check/cross if needed, or just render text
                                                return (
                                                    <td key={providerIndex} className={provider.highlight === "1" ? "highlight-column" : ""}>
                                                        {isCheck ? <span className="text-success">{value}</span> :
                                                            isCross ? <span className="text-danger">{value}</span> :
                                                                value}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td></td>
                                    {providers.map((provider, index) => (
                                        <td key={index} className={provider.highlight === "1" ? "highlight-column" : ""}>
                                            {provider.highlight === "1" && (
                                                <button className="btn btn-primary px-4 rounded-pill">
                                                    Get Started
                                                </button>
                                            )}
                                        </td>
                                    ))}
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
