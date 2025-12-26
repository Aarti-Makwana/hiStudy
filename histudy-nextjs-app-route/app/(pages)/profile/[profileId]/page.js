import SingleProfile from "../index";
import CourseDetails from "../../../../data/course-details/courseData.json";

// 🔹 Static params for Next.js export
export async function generateStaticParams() {
  return [
    { profileId: "1" },
    { profileId: "2" },
    { profileId: "3" },
  ];
}

export const metadata = {
  title: "Profile - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const SingleProfileLayout = ({ params }) => {
  return (
    <>
      <SingleProfile getParams={params} />
    </>
  );
};

export default SingleProfileLayout;
