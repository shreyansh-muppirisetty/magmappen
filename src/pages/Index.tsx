import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CalSolver from "@/components/CalSolver";
import GamesPortal from "@/components/GamesPortal";

const Index = () => {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!unlocked ? (
        <motion.div
          key="calc"
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
            <CalSolver onUnlock={() => setUnlocked(true)} />
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="games"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <GamesPortal onBack={() => setUnlocked(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
