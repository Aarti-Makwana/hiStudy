import React from "react";
import Link from "next/link";
import "./comparison.css";

const ComparisonTable = ({ settings }) => {
    if (!settings) return null;

    const { heading, features, providers, site } = settings;

    const logoSrc = site?.logo?.url || site?.logo || null;

    const keyMap = {
        "Know Your Tutor Before Joining": "know_tutor",
        "Curriculum": "curriculum",
        "Course Updates": "updates",
        "Resume Help": "resume_help",
        "Community": "community",
        "Pricing": "pricing",
        "Refund Policy": "refund"
    };

    const labelMap = {
        "Know Your Tutor Before Joining": "Tutor Before Joining"
    };

    const normalizeKey = (text) => text?.toString().toLowerCase().replace(/[^a-z0-9]+/g, "") || "";

    const getProviderValue = (provider, feature) => {
        const data = provider.data || {};
        const dataKey = keyMap[feature] || Object.keys(data).find((key) => normalizeKey(key) === normalizeKey(feature));
        if (dataKey && data[dataKey] !== undefined) {
            return data[dataKey];
        }

        const fallbackKey = Object.keys(data).find((key) => normalizeKey(feature).includes(normalizeKey(key)) || normalizeKey(key).includes(normalizeKey(feature)));
        return fallbackKey ? data[fallbackKey] : provider.data?.[feature] ?? "—";
    };

    const getDisplayFeature = (feature) => labelMap[feature] || feature;

    return (
        <div className="comparison-section container my-5">
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

            <div className="row justify-content-center">
                <div className="col-md-10">

                    <div className="table-responsive">
                        <table className="table align-middle text-center comparison-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    {providers.map((provider, index) => (
                                        <th key={index} className={provider.highlight === "1" ? "highlight-column" : ""}>
                                            {index === 0 && logoSrc ? (
                                                <div className="comparison-provider-logo">
                                                    <img src={logoSrc} alt={provider.name} />
                                                </div>
                                            ) : (
                                                <h5 className="fw-bold">{provider.name}</h5>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {features.map((feature, featureIndex) => {
                                    const displayFeature = getDisplayFeature(feature);
                                    return (
                                        <tr key={featureIndex}>
                                            <td className="text-start">{displayFeature}</td>
                                            {providers.map((provider, providerIndex) => {
                                                const value = getProviderValue(provider, feature);
                                                const isCheck = value.includes("✅");
                                                const isCross = value.includes("❌");

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
                                                <Link href="#live-courses" className="btn btn-primary px-4 rounded-pill">
                                                    Explore
                                                </Link>
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
