import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import Loading from "~/components/Loading";
import authService from "~/services/authService";
import { useUserStore } from "~/stores/userStore";

const UserAuthentication = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { login, logout } = useUserStore((state) => state);
  const [checking, setChecking] = useState(true);
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/",
    "/it-jobs",
    "/company",
    "/job",
    "/reset-password",
    "/employer/login",
    "/employer/forgot-password",
    "/employer/reset-password",
  ];

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("access_token");
    if (!token) {
      logout();
      setChecking(false);
      return;
    }
    authService.account()
      .then((response) => {
        if (active && localStorage.getItem("access_token") === token) login(response.data);
      })
      .catch(() => {
        // Expired tokens are cleared by the client; persisted auth is not verification.
        if (active && (!localStorage.getItem("access_token") || localStorage.getItem("access_token") === token)) logout();
      })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [login, logout]);

  return (
    <>
      {!checking || location.pathname === "/employer" ||
      publicRoutes.some((route) => location.pathname === route || (route !== "/" && location.pathname.startsWith(`${route}/`))) ? (
        children
      ) : (
        <Loading />
      )}
    </>
  );
};

export default UserAuthentication;
