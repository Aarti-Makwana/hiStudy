import BackToTop from "@/app/backToTop";
import SingleCourse from "../index";

export async function generateStaticParams() {
  // return ALL course ids here
  return [
    { courseId: "1" },
    { courseId: "2" },
    { courseId: "3" },
  ];
}


export const metadata = {
  title: "Course Details Two - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const SingleCourseLayoutTwo = ({ params }) => {
  return (
    <>
      <SingleCourse getParams={params} />
      <BackToTop />
    </>
  );
};

export default SingleCourseLayoutTwo;
