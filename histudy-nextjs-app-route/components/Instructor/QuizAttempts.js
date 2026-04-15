"use client";

import { useState } from "react";
import Link from "next/link";
import Select from "react-select";

import { useAppContext } from "../../context/Context";

const QuizAttempts = () => {
  const { userData, loadingUser } = useAppContext();
  const [selectedCourse, setSelectedCourse] = useState({ value: "", label: "All Courses" });

  if (loadingUser) return <div className="skeleton" style={{ height: "400px" }}></div>;

  const courses = [
    { value: "", label: "All Courses" },
    ...(userData?.active_enrollments || []).map((en) => ({
      value: en.course?.id || en.course_id,
      label: en.course?.title || "Unknown Course",
    })),
  ];

  const filteredAttempts = (userData?.quiz_attempts || []).filter((attempt) => {
    if (!selectedCourse?.value) return true;
    return (
      String(attempt.course_id || attempt.course?.id || attempt.quiz?.course_id || attempt.quiz?.course?.id || "") ===
      String(selectedCourse.value)
    );
  });

  const getAttemptResult = (attempt) => {
    if (!attempt) return "N/A";
    if (attempt.result) return String(attempt.result);
    if (attempt.status) return String(attempt.status);
    if (attempt.score_percentage !== undefined && attempt.score_percentage !== null) {
      return attempt.score_percentage >= 50 ? "Pass" : "Fail";
    }
    return "N/A";
  };

  const getResultBadgeClass = (result) => {
    const normalized = String(result || "").toLowerCase();
    if (normalized.includes("pass") || normalized.includes("success") || normalized.includes("completed")) {
      return "rbt-badge-5 bg-color-success-opacity color-success";
    }
    return "rbt-badge-5 bg-color-danger-opacity color-danger";
  };

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
                    instanceId="courseSelect"
                    className="react-select"
                    classNamePrefix="react-select"
                    value={selectedCourse}
                    onChange={setSelectedCourse}
                    options={courses}
                    closeMenuOnSelect={true}
                    isMulti={false}
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
                  <th>Result</th>
                  <th>Attempt</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.length > 0 ? (
                  filteredAttempts.map((attempt, index) => {
                    const resultText = getAttemptResult(attempt);
                    return (
                      <tr key={index}>
                        <th>
                          <span className="h6 mb--5">{attempt.quiz?.title || "Quiz Name"}</span>
                          <p className="b3">Date: {attempt.created_at || "N/A"}</p>
                        </th>
                        <td>
                          <p className="b3">{attempt.score_percentage ?? 0}%</p>
                        </td>
                        <td>
                          <span className={getResultBadgeClass(resultText)}>{resultText}</span>
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
                              Attempt
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <p className="b3">No quiz attempts found for the selected course.</p>
                    </td>
                  </tr>
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
