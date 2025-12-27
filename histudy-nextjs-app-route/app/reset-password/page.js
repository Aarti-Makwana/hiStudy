import BackToTop from "@/app/backToTop";
import ResetPasswordPage from "./(reset-password)";

export const metadata = {
  title: "Login & Register - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const ResetPasswordLayout = () => {
  return (
    <>
      <ResetPasswordPage />
      <BackToTop />
    </>
  );
};

export default ResetPasswordLayout;
