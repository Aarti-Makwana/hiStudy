import BackToTop from "@/app/backToTop";
import SingleEvent from "../index";

import CourseDetails from "../../../../data/course-details/courseData.json";

// 🔹 Static params for Next.js export
export async function generateStaticParams() {
  return [
    { eventId: "1" },
    { eventId: "2" },
    { eventId: "3" }
  ];
}

export const metadata = {
  title: "Event Details - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const SingleEventLayout = ({ params }) => {
  return (
    <>
      <SingleEvent getParams={params} />
      <BackToTop />
    </>
  );
};

export default SingleEventLayout;
