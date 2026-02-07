import React from "react";

/**
 * MirrorLoader component provides a shimmer (mirror) loading effect
 * using the existing .rbt-skeleton-loading CSS class and utility classes.
 */
const MirrorLoader = ({ widthClass = "w-100", heightClass = "h-20", radiusClass = "radius-4", className = "" }) => {
    return (
        <div
            className={`rbt-skeleton-loading ${widthClass} ${heightClass} ${radiusClass} ${className}`}
        />
    );
};

export default MirrorLoader;
