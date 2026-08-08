"use client";

import { useState, useEffect } from "react";
import { motion, easeInOut } from "framer-motion";
import { ChevronRight } from "react-feather";
import { getLoggedInUser, googleLogin, googleLogout } from "@/services/google";
import { Button } from "@/components/button";

type AuthDialogProps = {
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AuthDialog({
  isAuthDialogOpen,
  setIsAuthDialogOpen,
}: AuthDialogProps) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const [user, setUser] = useState<{
    name: string;
    email: string;
    picture: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getLoggedInUser();
        if (currentUser) setUser(currentUser);
      } catch (err) {
        console.error("Failed to fetch logged-in user:", err);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await googleLogin();
    } catch (err) {
      console.error("Login failed:", err);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await googleLogout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  let width =
    windowWidth >= 1440 ? "18rem" : windowWidth >= 1024 ? "16rem" : "14rem";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.3, ease: easeInOut }}
      className="fixed top-16 right-6 z-50 rounded-2xl bg-[#18181b] border border-neutral-800 shadow-xl flex flex-col p-4"
      style={{ width }}
    >
      <div className="flex justify-between items-center w-full mb-1">
        <img
          src="../../public/taskbar.png"
          alt="Logo"
          className="h-4 w-4 transition-transform duration-200 hover:scale-110"
        />
        <button
          onClick={() => setIsAuthDialogOpen(false)}
          className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>

      {user ? (
        <div className="flex flex-col h-full justify-between gap-4 pb-2">
          <div className="flex items-center gap-3.5">
            <img
              src={user.picture}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover border border-neutral-700"
            />
            <div className="flex flex-col text-left">
              <p className="text-white font-medium text-sm leading-tight">
                {user.name}
              </p>
              <p className="text-neutral-400 text-xs mt-0.5 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex w-full justify-start mt-auto">
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              log out
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center pb-2">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full text-white/90 font-light transition rounded-xl cursor-pointer hover:scale-[1.02] bg-transparent hover:bg-neutral-800"
            >
              {loading ? (
                "signing in..."
              ) : (
                <>
                  sign in with{" "}
                  <strong className="font-semibold ml-1">Google</strong>
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
