"use client";

import { Provider } from "react-redux";
import Store from "@/redux/store";
import Context from "@/context/Context";

import Contact from "@/components/Contacts/Contact";
import ContactForm from "@/components/Contacts/Contact-Form";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterOne from "@/components/Footer/Footer-One";

import { useSettings } from "@/context/SettingsContext";
import MirrorLoader from "@/components/Common/MirrorLoader";

const ContactPage = () => {
  const { settings, loading } = useSettings();
  const contactData = settings?.contact_us;

  return (
    <>
      <Provider store={Store}>
        <Context>
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
          <MobileMenu />
          <Cart />

          <div className="rbt-conatct-area bg-gradient-11 rbt-section-gap">
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="section-title text-center mb--60">
                    <span className="subtitle bg-secondary-opacity">
                      Contact Us
                    </span>
                    {loading ? (
                      <div className="d-flex justify-content-center mt-3">
                        <MirrorLoader widthClass="w-400" heightClass="h-50" />
                      </div>
                    ) : (
                      <h2
                        className="title"
                        dangerouslySetInnerHTML={{
                          __html: contactData?.heading?.replace(/\n/g, "<br />") || "Histudy Course Contact <br /> can join with us.",
                        }}
                      ></h2>
                    )}
                  </div>
                </div>
              </div>
              <Contact />
            </div>
          </div>

          <ContactForm />

          <div className="rbt-google-map bg-color-white rbt-section-gapTop">
            {loading ? (
              <MirrorLoader widthClass="w-100p" heightClass="h-600" />
            ) : (
              <iframe
                className="w-100"
                src={contactData?.map_link || "https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d2965.0824050173574!2d-93.63905729999999!3d41.998507000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sWebFilings%2C+University+Boulevard%2C+Ames%2C+IA!5e0!3m2!1sen!2sus!4v1390839289319"}
                height="600"
                style={{ border: "0" }}
              ></iframe>
            )}
          </div>

          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default ContactPage;
