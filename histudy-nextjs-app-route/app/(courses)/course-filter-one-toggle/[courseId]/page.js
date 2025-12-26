import BackToTop from "@/app/backToTop";
import SingleCoursePage from "./index";
import CourseDetails from "../../../../data/course-details/courseData.json";

export const metadata = {
  title:
    "Course Filter One Toggle - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

export async function generateStaticParams() {
  const courses = CourseDetails.courseDetails;

  return courses.map((course) => ({
    courseId: course.category.toString(), // or slugify(course.category) if you need
  }));
}

const Page = ({ params }) => {
  return (
    <>
      <SingleCoursePage getParams={params} />

      <BackToTop />
    </>
  );
};

export default Page;
