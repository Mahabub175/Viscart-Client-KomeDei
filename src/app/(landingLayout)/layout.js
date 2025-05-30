import BackToTop from "@/components/Shared/BackToTop";
import FixedCart from "@/components/Shared/FixedCart";
import FloatingContact from "@/components/Shared/FloatingContact";
import LandingFooter from "@/components/Shared/Footer/LandingFooter";
import MobileCategories from "@/components/Shared/MobileCategories";
import BottomNavigation from "@/components/Shared/Navbar/BottomNavigation";
import LandingHeader from "@/components/Shared/Navbar/LandingHeader";
import SidebarCategories from "@/components/Shared/Sidebar/SidebarCategories";

const LandingLayout = ({ children }) => {
  return (
    <>
      <LandingHeader />
      <div className="mt-28 md:mt-[6.4rem] lg:mt-[10rem] xxl:mt-[10rem] flex items-start relative">
        <div className="sticky top-5 z-10 w-[320px] hidden lg:block">
          <SidebarCategories />
        </div>

        <div className="container mx-auto overflow-x-hidden">
          <div>{children}</div>
          <LandingFooter />
        </div>
      </div>
      <FixedCart />
      <FloatingContact />
      <BackToTop />
      <MobileCategories />
      <BottomNavigation />
    </>
  );
};

export default LandingLayout;
