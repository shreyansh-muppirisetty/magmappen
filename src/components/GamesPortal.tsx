import { motion } from "framer-motion";
import { Search, Star, Clock, Gamepad2, Zap, Trophy, Swords, Puzzle, Car, Ghost } from "lucide-react";
import { useState, useMemo } from "react";

const GAMES = [
  { name: "Slope", icon: Zap, color: "hsl(270 80% 65%)", category: "Action" },
  { name: "1v1.LOL", icon: Swords, color: "hsl(340 85% 60%)", category: "Shooter" },
  { name: "Retro Bowl", icon: Trophy, color: "hsl(30 90% 55%)", category: "Sports" },
  { name: "Run 3", icon: Zap, color: "hsl(170 80% 50%)", category: "Action" },
  { name: "Subway Surfers", icon: Car, color: "hsl(45 90% 55%)", category: "Endless" },
  { name: "Cookie Clicker", icon: Star, color: "hsl(30 80% 50%)", category: "Idle" },
  { name: "Pac-Man", icon: Ghost, color: "hsl(55 90% 55%)", category: "Arcade" },
  { name: "2048", icon: Puzzle, color: "hsl(20 85% 55%)", category: "Puzzle" },
  { name: "Tetris", icon: Puzzle, color: "hsl(200 80% 55%)", category: "Puzzle" },
  { name: "Minecraft Classic", icon: Gamepad2, color: "hsl(120 60% 45%)", category: "Sandbox" },
  { name: "Among Us", icon: Ghost, color: "hsl(0 70% 55%)", category: "Social" },
  { name: "Snake", icon: Zap, color: "hsl(140 75% 45%)", category: "Arcade" },
  { name: "Flappy Bird", icon: Zap, color: "hsl(50 90% 55%)", category: "Arcade" },
  { name: "Drift Hunters", icon: Car, color: "hsl(210 80% 55%)", category: "Racing" },
  { name: "Basketball Stars", icon: Trophy, color: "hsl(25 90% 55%)", category: "Sports" },
  { name: "Crossy Road", icon: Gamepad2, color: "hsl(150 70% 50%)", category: "Arcade" },
  { name: "Paper.io", icon: Puzzle, color: "hsl(270 70% 60%)", category: "IO" },
  { name: "Smash Karts", icon: Car, color: "hsl(350 80% 55%)", category: "Racing" },
  { name: "Tunnel Rush", icon: Zap, color: "hsl(290 80% 60%)", category: "Action" },
  { name: "Moto X3M", icon: Car, color: "hsl(10 85% 55%)", category: "Racing" },
  { name: "Geometry Dash", icon: Zap, color: "hsl(200 90% 60%)", category: "Action" },
  { name: "Bloons TD", icon: Swords, color: "hsl(40 85% 55%)", category: "Strategy" },
  { name: "Shell Shockers", icon: Swords, color: "hsl(50 80% 50%)", category: "Shooter" },
  { name: "Wordle", icon: Puzzle, color: "hsl(120 50% 45%)", category: "Puzzle" },
];

const CATEGORIES = ["All", "Action", "Arcade", "Puzzle", "Racing", "Shooter", "Sports", "Strategy", "IO", "Idle", "Sandbox", "Social", "Endless"];

const GamesPortal = ({ onBack }: { onBack: () => void }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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
            return (
              <motion.button
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="group rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.03]"
                style={{
                  background: "hsl(var(--portal-card))",
                  border: "1px solid hsl(0 0% 100% / 0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "hsl(var(--portal-card-hover))";
                  e.currentTarget.style.borderColor = `${game.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "hsl(var(--portal-card))";
                  e.currentTarget.style.borderColor = "hsl(0 0% 100% / 0.04)";
                }}
              >
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
                  {game.category}
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
