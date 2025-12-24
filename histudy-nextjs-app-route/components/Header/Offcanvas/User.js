import Image from "next/image";
import Link from "next/link";

import UserData from "../../../data/user.json";

const User = () => {
  return (
    <>
      <div className="user-dropdown-wrapper" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 9999, minWidth: 260 }}>
        <div className="rbt-user-menu-list-wrapper" style={{ boxShadow: '0 6px 18px rgba(0,0,0,0.08)', background: '#fff', borderRadius: 6, overflow: 'hidden' }}>
        {UserData &&
          UserData.user.map((person, index) => (
            <div className="inner" key={index}>
              <div className="rbt-admin-profile">
                <div className="admin-thumbnail">
                  <Image
                    src={person.img}
                    width={43}
                    height={43}
                    alt="User Images"
                  />
                </div>
                <div className="admin-info">
                  <span className="name">{person.name}</span>
                  <Link
                    className="rbt-btn-link color-primary"
                    href="/instructor-profile"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
              <ul className="user-list-wrapper">
                {person.userList.map((list, innerIndex) => (
                  <li key={innerIndex}>
                    <Link href={list.link}>
                      <i className={list.icon}></i>
                      <span>{list.text}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <hr className="mt--10 mb--10" />
              <ul className="user-list-wrapper">
                <li>
                  <Link href="#">
                    <i className="feather-book-open"></i>
                    <span>Getting Started</span>
                  </Link>
                </li>
              </ul>
              <hr className="mt--10 mb--10" />
              <ul className="user-list-wrapper">
                <li>
                  <Link href="/instructor-settings">
                    <i className="feather-settings"></i>
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <Link href="/">
                    <i className="feather-log-out"></i>
                    <span>Logout</span>
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default User;
