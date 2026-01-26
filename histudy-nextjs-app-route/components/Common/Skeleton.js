import React from "react";

const Skeleton = ({ width, height, borderRadius, className = "" }) => {
    return (
        <div
            className={`skeleton-loader ${className}`}
            style={{
                width: width || "100%",
                height: height || "100%",
                borderRadius: borderRadius || "var(--radius)",
                backgroundColor: "var(--color-extra2)",
                position: "relative",
                overflow: "hidden",
            }}
        />
    );
};

export default Skeleton;
