import SingleProductPage from "../index";

// Hardcoded product IDs for static export
export async function generateStaticParams() {
  return [
    { singleId: "1" },
    { singleId: "2" },
    { singleId: "3" }
  ];
}

export const metadata = {
  title: "Single Product - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const SingleProductLayout = ({ params }) => {
  return (
    <>
      <SingleProductPage getParams={params} />
    </>
  );
};

export default SingleProductLayout;
