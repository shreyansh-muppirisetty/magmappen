import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Clock, Gamepad2, Zap, Trophy, Swords, Puzzle, Car, Ghost, Globe, X, Lock } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type UserTier = Database["public"]["Enums"]["user_tier"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_MAP: Record<string, any> = {
  Gamepad2, Zap, Star, Ghost, Puzzle, Swords, Car, Trophy, Clock,
};

type Game = {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string;
  color: string;
  min_tier: UserTier;
};

const TIER_RANK: Record<UserTier, number> = { trash: 0, pro: 1, freetrial: 2, hacker: 3 };

function canAccessGame(userTier: UserTier, gameMinTier: UserTier): boolean {
  if (userTier === "hacker" || userTier === "freetrial") return true;
  return TIER_RANK[userTier] >= TIER_RANK[gameMinTier];
}

const CATEGORIES = ["All", "Portal", "Study"];

const GamesPortal = ({ onBack, tier }: { onBack: () => void; tier: UserTier }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      const { data } = await supabase.from("games").select("*").order("created_at");
      if (data) setGames(data as Game[]);
    };
    fetchGames();
  }, []);

  const filtered = useMemo(() => {
    return games.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || g.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory, games]);

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

      {/* Trash/Pro tier promo banner */}
      {(tier === "trash" || tier === "pro") && (
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
            const Icon = ICON_MAP[game.icon] || Gamepad2;
            const locked = !canAccessGame(tier, game.min_tier);
            return (
              <motion.button
                key={game.id}
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
