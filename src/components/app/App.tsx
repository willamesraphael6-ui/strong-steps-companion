import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { Splash } from "./Splash";
import { Quiz } from "./Quiz";
import { Setup } from "./Setup";
import { NotifPrompt } from "./NotifPrompt";
import { HomeScreen } from "./HomeScreen";
import { Academy } from "./Academy";
import { Languages } from "./Languages";
import { ProfileScreen } from "./ProfileScreen";
import { Tutor } from "./Tutor";
import { Nav, type Tab } from "./Nav";
import { Toast, ToastProvider } from "./Toast";

type Stage = "splash" | "quiz" | "setup" | "notif" | "app";

export function App() {
  const { profile, loading, create, update, reset } = useProfile();
  const [stage, setStage] = useState<Stage>("splash");
  const [tab, setTab] = useState<Tab>("home");
  const [quizAnswers, setQuizAnswers] = useState<{
    goal?: string;
    level?: string;
  }>({});

  useEffect(() => {
    if (loading) return;
    if (profile) setStage("app");
  }, [loading, profile]);

  return (
    <ToastProvider>
      <div className="mx-auto max-w-[480px] min-h-screen relative overflow-hidden bg-ink">
        <AnimatePresence mode="wait">
          {stage === "splash" && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Splash
                onStart={() => setStage("quiz")}
                onSkip={() =>
                  profile ? setStage("app") : setStage("setup")
                }
              />
            </motion.div>
          )}
          {stage === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Quiz
                onDone={(a) => {
                  setQuizAnswers(a);
                  setStage("setup");
                }}
              />
            </motion.div>
          )}
          {stage === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Setup
                onDone={async (v) => {
                  await create({
                    name: v.name,
                    avatar_url: v.avatar_url,
                    fitness_goal: quizAnswers.goal,
                    fitness_level: quizAnswers.level,
                  });
                  setStage("notif");
                }}
              />
            </motion.div>
          )}
          {stage === "notif" && (
            <motion.div
              key="notif"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <NotifPrompt
                onDone={async (enabled) => {
                  await update({ notifications_enabled: enabled });
                  setStage("app");
                }}
              />
            </motion.div>
          )}
          {stage === "app" && profile && (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col pb-[92px]"
            >
              {tab === "home" && <HomeScreen profile={profile} onOpenTutor={() => setTab("tutor")} />}
              {tab === "academy" && <Academy profile={profile} onUpdate={update} />}
              {tab === "tutor" && (
                <div className="min-h-[calc(100vh-92px)] flex flex-col">
                  <Tutor profile={profile} />
                </div>
              )}
              {tab === "lang" && <Languages profile={profile} />}
              {tab === "profile" && (
                <ProfileScreen
                  profile={profile}
                  onReset={() => {
                    reset();
                    setStage("splash");
                  }}
                  onUpdate={update}
                />
              )}
              <Nav tab={tab} setTab={setTab} />
            </motion.div>
          )}
        </AnimatePresence>
        <Toast />
      </div>
    </ToastProvider>
  );
}