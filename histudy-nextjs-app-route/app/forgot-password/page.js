import BackToTop from "@/app/backToTop";
import ForgetPasswordPage from "./(forgot-password)";

export const metadata = {
  title: "Login & Register - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const ForgetPasswordLayout = () => {
  return (
    <>
      <ForgetPasswordPage />
      <BackToTop />
    </>
  );
};

export default ForgetPasswordLayout;
