import CourseDetails from "@/data/course-details/courseData.json";
import ClientCoursePage from "./ClientCoursePage";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\d+/g, "")
    .replace("&", "")
    .replace(/\s+/g, " ")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// 👇 THIS is required for output: "export"
export async function generateStaticParams() {
  const courses = CourseDetails.courseDetails;

  const ids = courses.map((c) => ({
    courseId: slugify(c.category),
  }));

  return ids;
}

export default function Page({ params }) {
  return <ClientCoursePage getParams={params} />;
}
