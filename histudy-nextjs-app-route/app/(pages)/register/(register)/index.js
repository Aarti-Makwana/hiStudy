"use client";

import BreadCrumb from "@/components/Common/BreadCrumb";
import FooterOne from "@/components/Footer/Footer-One";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import Register from "@/components/Resgister/Register";
import NewsletterThree from "@/components/Newsletters/Newsletter-Three";
import Context from "@/context/Context";
import Store from "@/redux/store";
import React from "react";
import { Provider } from "react-redux";

const RegisterPage = () => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
          <MobileMenu />
          <Cart />
          {/* <BreadCrumb title="Register" text="Register" /> */}

          <div className="rbt-elements-area bg-color-white rbt-section-gap">
            <div className="container">
              <div className="row gy-5 row--30 justify-content-center">
                <Register />
              </div>
            </div>
          </div>

          <div className="rbt-newsletter-area bg-gradient-6 ptb--50">
            <NewsletterThree />
          </div>

          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default RegisterPage;
