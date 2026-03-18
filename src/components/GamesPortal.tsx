import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, Gamepad2, Zap, Trophy, Swords, Puzzle, Car, Ghost, X, Lock } from "lucide-react";
import { useState, useMemo } from "react";
import type { Database } from "@/integrations/supabase/types";

type UserTier = Database["public"]["Enums"]["user_tier"];

const GAMES = [
  { name: "Game Hub", icon: Gamepad2, color: "hsl(270 80% 65%)", category: "Portal", url: "https://learningmathisreallyfun.b-cdn.net/?/", id: "gamehub" },
  { name: "55 Games", icon: Zap, color: "hsl(340 85% 60%)", category: "Portal", url: "https://55gms.com/g", id: "55games" },
  { name: "Cymath", icon: Star, color: "hsl(200 80% 55%)", category: "Study", url: "https://cymath.com", id: "cymath" },
  { name: "Frogiee Edu", icon: Ghost, color: "hsl(140 70% 50%)", category: "Portal", url: "https://frogieeisback-edu.zone.id/", id: "frogiee" },
  { name: "Math Zone", icon: Puzzle, color: "hsl(30 85% 55%)", category: "Portal", url: "https://math.kazw.net/", id: "mathzone" },
  { name: "Shadow Realm", icon: Swords, color: "hsl(0 70% 50%)", category: "Portal", url: "https://shadow-realm.gravityenergygenerator.com/", id: "shadowrealm" },
  { name: "Danish Shoes", icon: Car, color: "hsl(45 80% 55%)", category: "Portal", url: "https://danish-shoes.dalbirsinghbaraili.com.np/", id: "danishshoes" },
  { name: "Browser", icon: Trophy, color: "hsl(220 75% 60%)", category: "Portal", url: "https://browser.lol", id: "browser" },
  { name: "Google Doodles", icon: Puzzle, color: "hsl(120 65% 50%)", category: "Portal", url: "https://www.google.com/doodles", id: "googledoodles" },
  { name: "CalcSolver", icon: Zap, color: "hsl(180 70% 50%)", category: "Study", url: "https://calcsolver.net", id: "calcsolver" },
  { name: "Magma", icon: Swords, color: "hsl(10 75% 55%)", category: "Portal", url: "https://magma.se", id: "magma" },
];

// Tier access: trash < pro < freetrial/hacker (all)
const TRASH_GAMES = ["magma", "calcsolver", "googledoodles"];
const PRO_GAMES = [...TRASH_GAMES, "danishshoes", "cymath"];

function canAccessGame(tier: UserTier, gameId: string): boolean {
  if (tier === "freetrial" || tier === "hacker") return true;
  if (tier === "pro") return PRO_GAMES.includes(gameId);
  if (tier === "trash") return TRASH_GAMES.includes(gameId);
  return false;
}

const CATEGORIES = ["All", "Portal", "Study"];

const GamesPortal = ({ onBack, tier }: { onBack: () => void; tier: UserTier }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeGame, setActiveGame] = useState<typeof GAMES[0] | null>(null);

  const filtered = useMemo(() => {
    return GAMES.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || g.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full"
      style={{ background: "hsl(var(--portal-bg))" }}
    >
      {/* Game Iframe Overlay */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: "hsl(var(--portal-bg))" }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
              <span className="font-display font-bold text-sm" style={{ color: "hsl(var(--portal-text))" }}>
                {activeGame.name}
              </span>
              <button
                onClick={() => setActiveGame(null)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "hsl(var(--portal-muted))" }}
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              src={activeGame.url}
              className="flex-1 w-full border-none"
              allow="fullscreen; autoplay; gamepad"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trash tier promo banner */}
      {tier === "trash" && (
        <div className="w-full py-2.5 px-4 text-center text-sm font-display font-semibold" style={{ background: "hsl(45 90% 50%)", color: "hsl(0 0% 10%)" }}>
          🔥 Convince 1 other person to get 90% off!
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl border-b" style={{ background: "hsl(var(--portal-bg) / 0.85)", borderColor: "hsl(0 0% 100% / 0.06)" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "hsl(0 0% 100% / 0.06)", color: "hsl(var(--portal-muted))" }}
          >
            ← Calculator
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 size={20} style={{ color: "hsl(var(--portal-accent))" }} />
            <span className="font-display font-bold text-lg" style={{ color: "hsl(var(--portal-text))" }}>
              Games
            </span>
          </div>
          <div className="flex-1 max-w-sm ml-auto relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--portal-muted))" }} />
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none placeholder:opacity-40"
              style={{
                background: "hsl(0 0% 100% / 0.06)",
                color: "hsl(var(--portal-text))",
                border: "1px solid hsl(0 0% 100% / 0.06)",
              }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              style={{
                background: activeCategory === cat ? "hsl(var(--portal-accent))" : "hsl(0 0% 100% / 0.05)",
                color: activeCategory === cat ? "hsl(0 0% 100%)" : "hsl(var(--portal-muted))",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Games Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((game, i) => {
            const Icon = game.icon;
            const locked = !canAccessGame(tier, game.id);
            return (
              <motion.button
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="group rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.03] relative"
                style={{
                  background: "hsl(var(--portal-card))",
                  border: "1px solid hsl(0 0% 100% / 0.04)",
                  opacity: locked ? 0.45 : 1,
                  cursor: locked ? "not-allowed" : "pointer",
                }}
                onClick={() => !locked && setActiveGame(game)}
                onMouseEnter={(e) => {
                  if (!locked) {
                    e.currentTarget.style.background = "hsl(var(--portal-card-hover))";
                    e.currentTarget.style.borderColor = `${game.color}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "hsl(var(--portal-card))";
                  e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.04)";
                }}
              >
                {locked && (
                  <div className="absolute top-2 right-2">
                    <Lock size={14} style={{ color: "hsl(var(--portal-muted))" }} />
                  </div>
                )}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${game.color}20` }}
                >
                  <Icon size={22} style={{ color: game.color }} />
                </div>
                <p className="font-medium text-sm truncate" style={{ color: "hsl(var(--portal-text))" }}>
                  {game.name}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "hsl(var(--portal-muted))" }}>
                  {locked ? "🔒 Upgrade tier" : game.category}
                </p>
              </motion.button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: "hsl(var(--portal-muted))" }}>
            <p className="text-lg font-display">No games found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </main>
    </motion.div>
  );
};

export default GamesPortal;
