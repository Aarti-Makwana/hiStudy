import BackToTop from "@/app/backToTop";
import SingleCoursePage from "./index";
import CourseDetails from "../../../../data/course-details/courseData.json";

// 🔹 Static params for Next.js export
export async function generateStaticParams() {
  const courses = CourseDetails.courseDetails;

  return courses.map((course) => ({
    courseId: course.category.toString(), // or slugify(course.category) if your client component expects
  }));
}


export const metadata = {
  title:
    "Course Filter Two Open - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const Page = ({ params }) => {
  return (
    <>
      <SingleCoursePage getParams={params} />

      <BackToTop />
    </>
  );
};

export default Page;
