import Link from "next/link";
import CourseWidgets from "../Instructor/Dashboard-Section/widgets/CourseWidget";
import { useAppContext } from "../../context/Context";

const EnrolledCourses = () => {
  const { userData, loadingUser } = useAppContext();

  if (loadingUser) return <div className="skeleton" style={{ height: "400px" }}></div>;

  const u = userData || {};

  const mapEnrollmentToCourse = (enrollment) => {
    const c = enrollment.course || {};
    return {
      enrollment_id: enrollment.id,
      id: c.id,
      title: c.title,
      lectures: c.number_of_lectures,
      courseDuration: c.duration || "N/A",
      enrolledStudent: c.enrolled_users_count || "N/A",
      courseThumbnail: c.file?.url || "/images/course/course-01.jpg",
      coursePrice: c.actual_price,
      offerPrice: c.discounted_price,
      progressValue: enrollment.completion_percentage,
      certificateStatus: enrollment.certificate_status,
      certificateMessage: enrollment.certificate_message,
      userReviewText: enrollment.review?.review || "",
      userRating: enrollment.review?.rating || 0,
      rating: {
        average: c.reviews_avg_rating || 0,
      },
      reviews: {
        oneStar: 0, twoStar: 0, threeStar: 0, fourStar: 0, fiveStar: 0 
      }
    };
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Enrolled Courses</h4>
          </div>
          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              id="myTab-4"
              role="tablist"
            >
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button active"
                  id="home-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#home-4"
                  role="tab"
                  aria-controls="home-4"
                  aria-selected="true"
                >
                  <span className="title">Enrolled Courses</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="profile-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#profile-4"
                  role="tab"
                  aria-controls="profile-4"
                  aria-selected="false"
                >
                  <span className="title">Active Courses</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="contact-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#contact-4"
                  role="tab"
                  aria-controls="contact-4"
                  aria-selected="false"
                >
                  <span className="title">Completed Courses</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="refunded-tab-4"
                  data-bs-toggle="tab"
                  data-bs-target="#refunded-4"
                  role="tab"
                  aria-controls="refunded-4"
                  aria-selected="false"
                >
                  <span className="title">Refunded Courses</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div
              className="tab-pane fade active show"
              id="home-4"
              role="tabpanel"
              aria-labelledby="home-tab-4"
            >
              <div className="row g-5">
                {(u.active_enrollments || []).length > 0 ? (
                  (u.active_enrollments || []).map((enrollment, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-enrolled-${index}`}
                    >
                      <CourseWidgets
                        data={mapEnrollmentToCourse(enrollment)}
                        courseStyle="two"
                        isProgress={true}
                        isCompleted={false}
                        isEdit={false}
                        showDescription={false}
                        showAuthor={false}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center p--40 bg-primary-opacity radius-round-10">
                      <p className="mb--0">There are no courses to display</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="profile-4"
              role="tabpanel"
              aria-labelledby="profile-tab-4"
            >
              <div className="row g-5">
                {(u.active_enrollments || []).length > 0 ? (
                  (u.active_enrollments || []).map((enrollment, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-active-${index}`}
                    >
                      <CourseWidgets
                        data={mapEnrollmentToCourse(enrollment)}
                        courseStyle="two"
                        isCompleted={false}
                        isProgress={true}
                        isEdit={false}
                        showDescription={false}
                        showAuthor={false}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center p--40 bg-primary-opacity radius-round-10">
                      <p className="mb--0">There are no courses to display</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="contact-4"
              role="tabpanel"
              aria-labelledby="contact-tab-4"
            >
              <div className="row g-5">
                {(u.completed_enrollments || []).length > 0 ? (
                  (u.completed_enrollments || []).map((enrollment, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-completed-${index}`}
                    >
                      <CourseWidgets
                        data={mapEnrollmentToCourse(enrollment)}
                        courseStyle="two"
                        isCompleted={true}
                        isProgress={true}
                        showDescription={false}
                        isEdit={false}
                        showAuthor={false}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center p--40 bg-primary-opacity radius-round-10">
                      <p className="mb--0">There are no courses to display</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="tab-pane fade"
              id="refunded-4"
              role="tabpanel"
              aria-labelledby="refunded-tab-4"
            >
              <div className="row g-5">
                {(u.refunded_enrollments || []).length > 0 ? (
                  (u.refunded_enrollments || []).map((enrollment, index) => (
                    <div
                      className="col-lg-4 col-md-6 col-12"
                      key={`course-refunded-${index}`}
                    >
                      <CourseWidgets
                        data={mapEnrollmentToCourse(enrollment)}
                        courseStyle="two"
                        isCompleted={false}
                        isProgress={false}
                        isEdit={false}
                        showDescription={false}
                        showAuthor={false}
                        isRefunded={true}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div className="text-center p--40 bg-primary-opacity radius-round-10">
                      <p className="mb--0">There are no courses to display</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrolledCourses;
