"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { GeneralInfoService } from "@/services/User/GeneralInfo/index.service";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        const keys = [
            "promo",
            "site",
            "hero_section",
            "social_links",
            "whyus_section",
            "moneyback_section",
            "contact_us",
            "comparison",
            "counters",
            "aboutus_section",
            "footer",
        ];

        try {
            setLoading(true);
            const responses = await Promise.all(
                keys.map((key) => GeneralInfoService.getSettings(key))
            );

            const newSettings = {};
            responses.forEach((res, index) => {
                if (res?.data?.value) {
                    newSettings[keys[index]] = res.data.value;
                } else if (res?.value) {
                    newSettings[keys[index]] = res.value;
                } else if (res?.data) {
                    newSettings[keys[index]] = res.data;
                }
            });

            setSettings(newSettings);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};
