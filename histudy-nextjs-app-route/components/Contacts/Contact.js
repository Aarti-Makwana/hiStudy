"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import MirrorLoader from "../Common/MirrorLoader";

const Contact = () => {
  const { settings, loading } = useSettings();
  const contactData = settings?.contact_us;

  const renderCard = (icon, title, value, type) => {
    if (loading || !value) {
      return (
        <div className="col-lg-4 col-md-6 col-sm-6 col-12">
          <div className="rbt-address">
            <div className="icon">
              <MirrorLoader widthClass="w-50" heightClass="h-50" radiusClass="radius-round" />
            </div>
            <div className="inner">
              <MirrorLoader widthClass="w-150" heightClass="h-25" className="mb-3" />
              <MirrorLoader widthClass="w-200" heightClass="h-20" className="mb-2" />
              <MirrorLoader widthClass="w-180" heightClass="h-20" />
            </div>
          </div>
        </div>
      );
    }

    const lines = value.split("\n").map(line => line.trim()).filter(line => line);

    return (
      <div className="col-lg-4 col-md-6 col-sm-6 col-12">
        <div className="rbt-address">
          <div className="icon">
            <i className={icon}></i>
          </div>
          <div className="inner">
            <h4 className="title">{title}</h4>
            {lines.map((line, i) => (
              <p key={i}>
                {type === "phone" ? (
                  <Link href={`tel:${line.replace(/\s+/g, "")}`}>{line}</Link>
                ) : type === "email" ? (
                  <Link href={`mailto:${line}`}>{line}</Link>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="row g-5">
      {renderCard("feather-phone", "Contact Phone Number", contactData?.phone_number, "phone")}
      {renderCard("feather-mail", "Our Email Address", contactData?.email_address, "email")}
      {renderCard("feather-map-pin", "Our Location", contactData?.location, "location")}
    </div>
  );
};

export default Contact;
