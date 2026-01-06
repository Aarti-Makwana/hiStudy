"use client";
import React from "react";
import Image from "next/image";

const Loader = () => {
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                height: "100vh",
                width: "100%",
                position: "fixed",
                top: 0,
                left: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                zIndex: 9999,
            }}
        >
            <Image
                src="/images/lodder/AddOnn loader Animation gif format.gif"
                alt="Loading..."
                width={100}
                height={100}
                unoptimized // Required for GIFs in some Next.js versions/configs
            />
        </div>
    );
};

export default Loader;
