import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, Gamepad2, Zap, Trophy, Swords, Puzzle, Car, Ghost, X } from "lucide-react";
import { useState, useMemo } from "react";

const GAMES = [
  { name: "Game Hub", icon: Gamepad2, color: "hsl(270 80% 65%)", category: "Portal", url: "https://learningmathisreallyfun.b-cdn.net/?/" },
  { name: "55 Games", icon: Zap, color: "hsl(340 85% 60%)", category: "Portal", url: "https://55gms.com/g" },
  { name: "OnWorks", icon: Star, color: "hsl(200 80% 55%)", category: "Portal", url: "https://onworks.net" },
];

const CATEGORIES = ["All", "Portal"];

const GamesPortal = ({ onBack }: { onBack: () => void }) => {
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
                onClick={() => setActiveGame(game)}
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
