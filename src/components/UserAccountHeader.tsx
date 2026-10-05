"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogIn, LogOut, Trophy, Zap, CheckCircle2, Sparkles, X, Award } from "lucide-react";

interface UserStats {
  totalXp: number;
  level: number;
  completedCount: number;
}

interface UserProgressData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    xp: number;
    level: number;
  } | null;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    badgeIcon: string;
    unlockedAt: string;
  }>;
  stats: UserStats;
}

export function UserAccountHeader() {
  const { data: session, status } = useSession();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [progressData, setProgressData] = useState<UserProgressData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/progress")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProgressData(data);
          }
        })
        .catch((err) => console.error("Failed to fetch user progress:", err));
    }
  }, [session]);

  const userXp = progressData?.stats.totalXp ?? (session?.user as any)?.xp ?? 0;
  const userLevel = progressData?.stats.level ?? (session?.user as any)?.level ?? 1;
  const completedCount = progressData?.stats.completedCount ?? 0;
  const achievements = progressData?.achievements ?? [];

  return (
    <div className="flex items-center gap-3">
      {status === "authenticated" && session.user ? (
        <div className="flex items-center gap-3">
          {/* XP & Level Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-inner">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Zap className="w-3.5 h-3.5 fill-amber-400/20" />
              <span>{userXp} XP</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lvl {userLevel}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-indigo-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedCount} Lessons</span>
            </div>
          </div>

          {/* User Profile Trigger Button */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-xs text-slate-200 font-medium group"
          >
            {session.user.image && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-6 h-6 rounded-full border border-indigo-500/50 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px] border border-indigo-500/40">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="max-w-[100px] truncate">{session.user.name || "User Account"}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In / Register</span>
        </button>
      )}

      {/* Login Modal (Google & GitHub Auth) using React Portal */}
      {mounted &&
        showLoginModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Welcome to TraceLab</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sign in to save your algorithm progress, earn XP, and unlock achievements.
                </p>
              </div>

              <div className="space-y-3">
                {/* Google Login Button */}
                <button
                  onClick={() => signIn("google")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-medium text-sm transition-all shadow-sm group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* GitHub Login Button */}
                <button
                  onClick={() => signIn("github")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-100 font-medium text-sm transition-all shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-500">
                  PostgreSQL & Prisma backing schema — storing Users, Lessons, Progress & Achievements.
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* User Profile & Progress Modal using React Portal */}
      {mounted &&
        showProfileModal &&
        session?.user &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                {session.user.image && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-14 h-14 rounded-full border-2 border-indigo-500 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-xl border-2 border-indigo-500 shadow-md">
                    {session.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{session.user.name}</h3>
                  <p className="text-xs text-slate-400">{session.user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold uppercase tracking-wider border border-indigo-500/30">
                      PostgreSQL Synced
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Dashboard */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                  <Zap className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-100">{userXp}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Total XP</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                  <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-100">Lvl {userLevel}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Developer Level</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <div className="text-lg font-bold text-slate-100">{completedCount}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Completed Lessons</div>
                </div>
              </div>

              {/* Achievements List */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Unlocked Achievements</span>
                </h4>

                {achievements.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {achievements.map((ach) => (
                      <div
                        key={ach.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70"
                      >
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{ach.title}</div>
                          <div className="text-[11px] text-slate-400">{ach.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/60 text-center text-xs text-slate-400">
                    Complete algorithm lessons to earn your first achievements!
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  signOut();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium text-xs transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
