import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CalSolver from "@/components/CalSolver";
import GamesPortal from "@/components/GamesPortal";
import UserGate from "@/components/UserGate";

type View = "magma" | "calculator" | "usergate" | "games";

const Index = () => {
  const [view, setView] = useState<View>("magma");
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <AnimatePresence mode="wait">
      {view === "magma" && (
        <motion.div
          key="magma"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative min-h-svh w-full"
        >
          <iframe
            src="https://magma.se"
            className="w-full h-svh border-none"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
          <button
            onClick={handleSecretTap}
            className="fixed bottom-0 right-0 w-16 h-16 z-50"
            aria-hidden="true"
            style={{ opacity: 0 }}
          />
        </motion.div>
      )}

      {view === "calculator" && (
        <motion.div
          key="calc"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="min-h-svh w-full flex items-center justify-center p-4"
          style={{ background: "hsl(var(--calc-bg))" }}
        >
          <div className="w-[400px] max-w-full">
            <h1 className="text-center font-display font-bold text-xl mb-1" style={{ color: "hsl(var(--calc-display))" }}>
              Calculator
            </h1>
            <p className="text-center text-xs mb-5" style={{ color: "hsl(var(--muted-foreground))" }}>
              Simple & Clean
            </p>
            <CalSolver onUnlock={() => setView("usergate")} />
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
        >
          <UserGate onPass={() => setView("games")} />
        </motion.div>
      )}

      {view === "games" && (
        <motion.div
          key="games"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <GamesPortal onBack={() => setView("magma")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
