import { reportApiError } from "~/api/reportApiError";
import { ApiError } from "~/api/client";
import { useEffect, useState } from "react";
import { NavbarWrapper } from "./styled";
import { NavLink } from "react-router";
import employerLinks from "~/constants/employerLinks";
import { useUserStore } from "~/stores/userStore";
import { useCompanyStore } from "~/stores/companyStore";
import { useCompanyQuery } from "~/hooks/useCompanyQuery";
import Loading from "~/components/Loading";
import { LogIn } from "feather-icons-react";
import IconHandWave from "~/components/Icons/IconHandWave";
import IconPanelLeftOpen from "~/components/Icons/IconPanelLeftOpen";
import IconPanelLeftClose from "~/components/Icons/IconPanelLeftClose";
import { useSkillStore } from "~/stores/skillStore";
import authService from "~/services/authService";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t } = useTranslation(["header"]);
  const [showNavbar, setShowNavbar] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { id: userId } = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const { handleSaveCompany } = useCompanyStore((s) => s);
  const { data: company, isPending, isSuccess } = useCompanyQuery(userId);
  const { saveSelectedSkillIds } = useSkillStore();

  useEffect(() => {
    if (isSuccess && company) {
      handleSaveCompany(company);
      saveSelectedSkillIds(
        company?.skills?.map((skill) => +skill.id).filter(Boolean) ?? []
      );
    }
  }, [isSuccess, company]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const token = localStorage.getItem("access_token");
    try {
      await authService.logout();
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        reportApiError(error);
        setIsLoggingOut(false);
        return;
      }
    }
    const currentToken = localStorage.getItem("access_token");
    if (currentToken && currentToken !== token) {
      setIsLoggingOut(false);
      return;
    }
    localStorage.removeItem("access_token");
    logout();
    window.location.replace("/employer/login");
  };

  return (
    <NavbarWrapper className={showNavbar ? "open" : "close"}>
      {isPending && <Loading />}
      <div className="nav-content">
        <div className="nav-heading">
          <div className="welcome">
            {showNavbar && (
              <div className="company-name">
                <IconHandWave />
                <span>{company?.companyName}</span>
              </div>
            )}
            {showNavbar ? (
              <IconPanelLeftClose
                className="toggle-nav"
                onClick={() => setShowNavbar(false)}
              />
            ) : (
              <IconPanelLeftOpen
                className="toggle-nav"
                onClick={() => setShowNavbar(true)}
              />
            )}
          </div>
        </div>
        <div className="menu-items">
          {employerLinks.map((link) => (
            <NavLink to={link.url} key={link.id}>
              {link.icon}
              <span>{t(link.label)}</span>
            </NavLink>
          ))}
          <a onClick={handleLogout} aria-disabled={isLoggingOut}>
            <LogIn />
            <span>{t("Sign out")}</span>
          </a>
        </div>
      </div>
    </NavbarWrapper>
  );
};

export default Navbar;
