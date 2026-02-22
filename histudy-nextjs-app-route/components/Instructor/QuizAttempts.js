"use client";

import { useState } from "react";
import Link from "next/link";
import Select, { components } from "react-select";

import { useAppContext } from "../../context/Context";

const ValueContainer = ({ children, ...props }) => {
  const { getValue, hasValue } = props;
  const nbValues = getValue().length;
  if (!hasValue) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }
  return (
    <components.ValueContainer {...props}>
      {`${nbValues} items selected`}
    </components.ValueContainer>
  );
};

const MultiValue = (props) => {
  return "3 Selected";
};

const QuizAttempts = () => {
  const { userData, loadingUser } = useAppContext();
  const customComponents = { ValueContainer, MultiValue };
  const [course, setCourses] = useState({ value: "", label: "" });
  const [sortBy, setSortBy] = useState({ value: "Default", label: "Default" });
  const [sortByOffer, setSortByOffer] = useState({
    value: "Free",
    label: "Free",
  });

  if (loadingUser) return <div className="skeleton" style={{ height: "400px" }}></div>;

  const courses = (userData?.active_enrollments || []).map(en => ({
    value: en.course?.id || en.course_id,
    label: en.course?.title || "Unknown Course"
  }));

  const sortByOptions = [
    { value: "Default", label: "Default" },
    { value: "Latest", label: "Latest" },
    { value: "Popularity", label: "Popularity" },
    { value: "Trending", label: "Trending" },
    { value: "Price: low to high", label: "Price: low to high" },
    { value: "Price: high to low", label: "Price: high to low" },
  ];

  const sortByOffers = [
    { value: "Free", label: "Free" },
    { value: "Paid", label: "Paid" },
    { value: "Premium", label: "Premium" },
  ];

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">My Quiz Attempts</h4>
          </div>

          <div className="rbt-dashboard-filter-wrapper">
            <div className="row g-5">
              <div className="col-lg-6">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Courses</span>
                  <Select
                    instanceId="sortByAuthor"
                    className="react-select"
                    classNamePrefix="react-select"
                    defaultValue={course}
                    onChange={setCourses}
                    options={courses}
                    closeMenuOnSelect={true}
                    isMulti
                    components={customComponents}
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Short By</span>
                  <Select
                    instanceId="sortBySelect"
                    className="react-select"
                    classNamePrefix="react-select"
                    defaultValue={sortBy}
                    onChange={setSortBy}
                    options={sortByOptions}
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Short By Offer</span>
                  <Select
                    instanceId="sortBySelect"
                    className="react-select"
                    classNamePrefix="react-select"
                    defaultValue={sortByOffer}
                    onChange={setSortByOffer}
                    options={sortByOffers}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="mt--30" />

          <div className="rbt-dashboard-table table-responsive mobile-table-750 mt--30">
            <table className="rbt-table table table-borderless">
              <thead>
                <tr>
                  <th>Quiz Name</th>
                  <th>Score %</th>
                  <th>Attempt</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(userData?.quiz_attempts || []).length > 0 ? (
                  userData.quiz_attempts.map((attempt, index) => (
                    <tr key={index}>
                      <th>
                        <span className="h6 mb--5">{attempt.quiz?.title || "Quiz Name"}</span>
                        <p className="b3">Date: {attempt.created_at || "N/A"}</p>
                      </th>
                      <td>
                        <p className="b3">{attempt.score_percentage || 0}%</p>
                      </td>
                      <td>
                        <p className="b3">{attempt.attempt_number || 1}</p>
                      </td>
                      <td>
                        <div className="rbt-button-group justify-content-end">
                          <Link
                            className="rbt-btn btn-sm bg-primary-opacity radius-round"
                            href={`/course-quiz/${attempt.quiz?.id || "#"}`}
                          >
                            Reattempt
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <th>
                        <span className="h6 mb--5">User Interface Mock Quiz</span>
                        <p className="b3">Date: December 26, 2024</p>
                      </th>
                      <td>
                        <p className="b3">85%</p>
                      </td>
                      <td>
                        <p className="b3">1</p>
                      </td>
                      <td>
                        <div className="rbt-button-group justify-content-end">
                          <Link className="rbt-btn btn-sm bg-primary-opacity radius-round" href="#">
                            Reattempt
                          </Link>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <span className="h6 mb--5">Advanced React Quiz</span>
                        <p className="b3">Date: January 10, 2025</p>
                      </th>
                      <td>
                        <p className="b3">40%</p>
                      </td>
                      <td>
                        <p className="b3">2</p>
                      </td>
                      <td>
                        <div className="rbt-button-group justify-content-end">
                          <Link className="rbt-btn btn-sm bg-primary-opacity radius-round" href="#">
                            Reattempt
                          </Link>
                        </div>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizAttempts;
