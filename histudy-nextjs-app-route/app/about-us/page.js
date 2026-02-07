import BackToTop from "@/app/backToTop";
import AboutUsPage from "../(pages)/about-us-01/(about-us-01)/index";

export const metadata = {
    title: "About Us - Online Courses & Education NEXTJS14 Template",
    description: "Online Courses & Education NEXTJS14 Template",
};
const AboutUsLayout = () => {
    return (
        <>
            <AboutUsPage />
            <BackToTop />
        </>
    );
};

export default AboutUsLayout;
