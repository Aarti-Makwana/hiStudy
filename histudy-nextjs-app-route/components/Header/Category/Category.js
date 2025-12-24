"use client";

import React, { useEffect, useState } from "react";
import { getToken, getUser } from "../../../utils/storage";

const Category = () => {
  const [logged, setLogged] = useState(false);
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const t = getToken();
    const u = getUser();
    setLogged(!!t);
    setUserState(u);
  }, []);

  return (
    <div className="rbt-category-menu-wrapper rbt-category-update">
      <div className="rbt-category-btn">
        <div className="rbt-offcanvas-trigger md-size icon">
          <span className="d-none d-xl-block">
            <i className="feather-grid"></i>
          </span>
          <i title="Category" className="feather-grid d-block d-xl-none"></i>
        </div>
        <span className="category-text d-none d-xl-block">{logged && user?.name ? `Hi, ${user.name}` : 'Category'}</span>
      </div>

        {/* Dropdown intentionally disabled for left-side greeting. */}
    </div>
  );
};
export default Category;
