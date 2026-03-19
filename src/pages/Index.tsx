import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CalSolver from "@/components/CalSolver";
import GamesPortal from "@/components/GamesPortal";
import UserGate from "@/components/UserGate";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type View = "magma" | "calculator" | "usergate" | "games" | "redirect";
type UserTier = Database["public"]["Enums"]["user_tier"];

const Index = () => {
  const [view, setView] = useState<View>("magma");
  const [userTier, setUserTier] = useState<UserTier>(() => {
    return (sessionStorage.getItem("userTier") as UserTier) || "freetrial";
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("isAuthenticated") === "true";
  });
  const [redirectMessage, setRedirectMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topRightTapCount = useRef(0);
  const topRightTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRightTapCount = useRef(0);
  const bottomRightTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSecretTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1500);

    if (tapCount.current >= 4) {
      tapCount.current = 0;
      setView("calculator");
    }
  };

  const handleTopRightTap = () => {
    topRightTapCount.current += 1;
    if (topRightTapTimer.current) clearTimeout(topRightTapTimer.current);
    topRightTapTimer.current = setTimeout(() => {
      topRightTapCount.current = 0;
    }, 800);

    if (topRightTapCount.current >= 2) {
      topRightTapCount.current = 0;
      setView("magma");
    }
  };

  const handleBottomRightSkip = () => {
    bottomRightTapCount.current += 1;
    if (bottomRightTapTimer.current) clearTimeout(bottomRightTapTimer.current);
    bottomRightTapTimer.current = setTimeout(() => {
      bottomRightTapCount.current = 0;
    }, 800);

    if (bottomRightTapCount.current >= 2) {
      bottomRightTapCount.current = 0;
      setView("games");
    }
  };

  const handleCalcUnlock = async () => {
    // Check if redirect mode is active
    const { data } = await supabase.from("site_settings").select("*");
    if (data) {
      const settings: Record<string, string> = {};
      for (const row of data) settings[row.key] = row.value;
      if (settings["redirect_enabled"] === "true") {
        setRedirectMessage(settings["redirect_message"] || "Website has moved.");
        setRedirectUrl(settings["redirect_url"] || "");
        setView("redirect");
        return;
      }
    }
    setView("usergate");
  };

  return (
    <div className="relative min-h-svh w-full">
      {/* Magma iframe — always mounted to preserve state */}
      <div
        className="fixed inset-0 w-full h-full"
        style={{ 
          zIndex: view === "magma" ? 1 : -1,
          visibility: view === "magma" ? "visible" : "hidden",
        }}
      >
        <iframe
          src="https://magma.se"
          className="w-full h-full border-none"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
        <button
          onClick={handleSecretTap}
          className="fixed bottom-0 right-0 w-16 h-16 z-50"
          aria-hidden="true"
          style={{ opacity: 0 }}
        />
        <button
          onClick={handleBottomRightSkip}
          className="fixed bottom-0 right-16 w-16 h-16 z-50"
          aria-hidden="true"
          style={{ opacity: 0 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {view === "calculator" && (
          <motion.div
            key="calc"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative min-h-svh w-full flex items-center justify-center p-4 z-10"
            style={{ background: "hsl(var(--calc-bg))" }}
          >
            <button onClick={handleTopRightTap} className="fixed top-0 right-0 w-16 h-16 z-50" aria-hidden="true" style={{ opacity: 0 }} />
            <div className="w-[400px] max-w-full">
              <h1 className="text-center font-display font-bold text-xl mb-1" style={{ color: "hsl(var(--calc-display))" }}>
                Calculator
              </h1>
              <p className="text-center text-xs mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>
                Simple & Clean
              </p>
              <CalSolver onUnlock={handleCalcUnlock} />
            </div>
          </motion.div>
        )}

        {view === "redirect" && (
          <motion.div
            key="redirect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative min-h-svh w-full flex items-center justify-center p-6 z-10"
            style={{ background: "hsl(var(--portal-bg))" }}
          >
            <button onClick={handleTopRightTap} className="fixed top-0 right-0 w-16 h-16 z-50" aria-hidden="true" style={{ opacity: 0 }} />
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "hsl(45 90% 50% / 0.15)" }}>
                <span className="text-3xl">🚧</span>
              </div>
              <h1 className="font-display font-bold text-xl mb-3" style={{ color: "hsl(var(--portal-text))" }}>
                Heads up!
              </h1>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "hsl(var(--portal-muted))" }}>
                {redirectMessage}
              </p>
              {redirectUrl && (
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-xl font-display font-semibold text-sm transition-transform hover:scale-105"
                  style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
                >
                  {redirectUrl.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </motion.div>
        )}

        {view === "usergate" && (
          <motion.div
            key="usergate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <button onClick={handleTopRightTap} className="fixed top-0 right-0 w-16 h-16 z-50" aria-hidden="true" style={{ opacity: 0 }} />
            <UserGate onPass={(tier) => { setUserTier(tier); setView("games"); }} />
          </motion.div>
        )}

        {view === "games" && (
          <motion.div
            key="games"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <button onClick={handleTopRightTap} className="fixed top-0 right-0 w-16 h-16 z-50" aria-hidden="true" style={{ opacity: 0 }} />
            <GamesPortal onBack={() => setView("magma")} tier={userTier} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
