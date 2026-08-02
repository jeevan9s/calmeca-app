"use client";

import { useState, useEffect } from "react";
import { motion, easeInOut } from "framer-motion";
import { ChevronRight } from "react-feather";

type AuthDialogProps = {
  isAuthDialogOpen: boolean;
  setIsAuthDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AuthDialog({ isAuthDialogOpen, setIsAuthDialogOpen }: AuthDialogProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [user, setUser] = useState<{ name: string; email: string; picture: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await (window as any).electronAPI.getLoggedInUser();
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
      const res = await (window as any).electronAPI.startGoogleLogin();
      setUser(res.user);
      setIsAuthDialogOpen(false);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await (window as any).electronAPI.googleLogout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  let width = windowWidth >= 1440 ? "25rem" : windowWidth >= 1024 ? "21.5rem" : "16rem";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -12 }}
      transition={{ duration: 0.3, ease: easeInOut }}
      className="fixed top-16 right-4 z-50 rounded-2xl bg-[#18181b] shadow-lg flex flex-col items-center p-4"
      style={{ width }}
    >
      <div className="flex justify-end w-full">
        <button
          onClick={() => setIsAuthDialogOpen(false)}
          className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center transition"
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-3 mt-2">
          <img src={user.picture} alt="profile" className="w-12 h-12 rounded-full" />
          <p className="text-white font-medium">{user.name}</p>
          <p className="text-neutral-400 text-sm">{user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 px-5 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full font-semibold transition-colors"
          >
            log out
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="mt-4 px-5 py-2 bg-white/90 rounded-full text-black/90 font-semibold transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "signing in..." : "sign in with Google"}
        </button>
      )}
    </motion.div>
  );
}
