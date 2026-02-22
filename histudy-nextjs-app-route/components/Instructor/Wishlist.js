import CourseWidgets from "./Dashboard-Section/widgets/CourseWidget";
import { useAppContext } from "../../context/Context";

const Wishlist = () => {
  const { userData, loadingUser } = useAppContext();

  if (loadingUser) return <div className="skeleton" style={{ height: "400px" }}></div>;

  const u = userData || {};

  const mapEnrollmentToCourse = (enrollment) => {
    const c = enrollment.course || {};
    return {
      id: c.id,
      title: c.title,
      lectures: c.number_of_lectures,
      courseDuration: "N/A",
      enrolledStudent: "N/A",
      courseThumbnail: "/images/course/course-01.jpg",
      coursePrice: c.actual_price,
      offerPrice: c.discounted_price,
      progressValue: enrollment.completion_percentage,
      rating: {
        average: c.reviews_avg_rating || 0,
      }
    };
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Wishlist</h4>
          </div>
          <div className="row g-5">
            {(u.active_enrollments || []).map((enrollment, index) => (
              <div
                className="col-lg-4 col-md-6 col-12"
                key={`course-wishlist-${index}`}
              >
                <CourseWidgets
                  data={mapEnrollmentToCourse(enrollment)}
                  courseStyle="two"
                  isCompleted={false}
                  isProgress={false}
                  showDescription={false}
                  showAuthor={false}
                  isEdit={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wishlist;
