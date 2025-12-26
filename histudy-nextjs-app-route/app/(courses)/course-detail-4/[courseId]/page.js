import BackToTop from "@/app/backToTop";
import SingleCourse from "../index";
import CourseDetails from "../../../../data/course-details/courseData.json";

export async function generateStaticParams() {
  return CourseDetails.courseDetails.map(course => ({
    courseId: course.id.toString()
  }));
}

export const metadata = {
  title: "Course Details - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const SingleCourseLayoutThree = ({ params }) => {
  return (
    <>
      <SingleCourse getParams={params} />
      <BackToTop />
    </>
  );
};

export default SingleCourseLayoutThree;
