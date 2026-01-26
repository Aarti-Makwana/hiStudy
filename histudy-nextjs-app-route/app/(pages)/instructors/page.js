"use client";

import React from "react";
import HomePageLayout from "../../01-main-demo/(main-demo)";
import InstructorsList from "@/components/Instructors/InstructorsList";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterThree from "@/components/Footer/Footer-Three";
import Context from "@/context/Context";
import { Provider } from "react-redux";
import Store from "@/redux/store";
import Separator from "@/components/Common/Separator";

const InstructorsPage = () => {
    return (
        <Provider store={Store}>
            <Context>
                <MobileMenu />
                <HeaderStyleTen headerSticky="rbt-sticky" headerType="" />
                <Cart />

                <div className="rbt-breadcrumb-area breadcrumb-style-1 bg-color-extra2 ptb--100">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="breadcrumb-inner text-center">
                                    <h2 className="title">Our Instructors</h2>
                                    <ul className="page-list">
                                        <li className="rbt-breadcrumb-item">
                                            <a href="/">Home</a>
                                        </li>
                                        <li>
                                            <div className="icon-right">
                                                <i className="feather-chevron-right"></i>
                                            </div>
                                        </li>
                                        <li className="rbt-breadcrumb-item active">Our Instructors</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <InstructorsList />

                <Separator />
                <FooterThree />
            </Context>
        </Provider>
    );
};

export default InstructorsPage;
