import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Tier = Database["public"]["Enums"]["user_tier"];
type Game = {
  id: string;
  name: string;
  url: string;
  category: string;
  icon: string;
  color: string;
  min_tier: Tier;
};

const TIERS: { value: Tier; label: string }[] = [
  { value: "trash", label: "Trash" },
  { value: "pro", label: "Pro" },
  { value: "freetrial", label: "Free Trial" },
  { value: "hacker", label: "Hacker" },
];

const ICONS = ["Gamepad2", "Zap", "Star", "Ghost", "Puzzle", "Swords", "Car", "Trophy", "Clock", "Globe"];
const CATEGORIES = ["Portal", "Study"];

const inputStyle = {
  background: "hsl(0 0% 100% / 0.08)",
  color: "hsl(var(--portal-text))",
  border: "1px solid hsl(0 0% 100% / 0.1)",
};

const GameManager = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Portal");
  const [newIcon, setNewIcon] = useState("Gamepad2");
  const [newColor, setNewColor] = useState("hsl(270 80% 65%)");
  const [newTier, setNewTier] = useState<Tier>("freetrial");

  const fetchGames = async () => {
    const { data } = await supabase.from("games").select("*").order("created_at");
    if (data) setGames(data as Game[]);
  };

  useEffect(() => { fetchGames(); }, []);

  const addGame = async () => {
    if (!newName.trim() || !newUrl.trim()) return;
    const { error } = await supabase.from("games").insert({
      name: newName.trim(),
      url: newUrl.trim(),
      category: newCategory,
      icon: newIcon,
      color: newColor,
      min_tier: newTier,
    });
    if (error) { alert(error.message); return; }
    setNewName(""); setNewUrl("");
    setNewCategory("Portal"); setNewIcon("Gamepad2");
    setNewColor("hsl(270 80% 65%)"); setNewTier("freetrial");
    await fetchGames();
  };

  const updateGameTier = async (id: string, tier: Tier) => {
    await supabase.from("games").update({ min_tier: tier }).eq("id", id);
    await fetchGames();
  };

  const removeGame = async (id: string) => {
    await supabase.from("games").delete().eq("id", id);
    await fetchGames();
  };

  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-4" style={{ color: "hsl(var(--portal-text))" }}>
        Manage Games
      </h2>

      {/* Add game form */}
      <div className="rounded-xl p-4 mb-6" style={{ background: "hsl(var(--portal-card))", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Game name..."
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL..."
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            {CATEGORIES.map(c => <option key={c} value={c} style={{ background: "#1a1a2e", color: "#fff" }}>{c}</option>)}
          </select>
          <select value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            {ICONS.map(i => <option key={i} value={i} style={{ background: "#1a1a2e", color: "#fff" }}>{i}</option>)}
          </select>
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Color (hsl...)"
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={inputStyle}
          />
          <select value={newTier} onChange={(e) => setNewTier(e.target.value as Tier)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
            {TIERS.map(t => <option key={t.value} value={t.value} style={{ background: "#1a1a2e", color: "#fff" }}>{t.label}</option>)}
          </select>
        </div>
        <button
          onClick={addGame}
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
          style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
        >
          <Plus size={16} /> Add Game
        </button>
      </div>

      {/* Games list */}
      <div className="space-y-2">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: "hsl(var(--portal-card))", border: "1px solid hsl(0 0% 100% / 0.06)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm" style={{ color: "hsl(var(--portal-text))" }}>{game.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "hsl(0 0% 100% / 0.08)", color: "hsl(var(--portal-muted))" }}>
                  {game.category}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs truncate max-w-[200px]" style={{ color: "hsl(var(--portal-muted))" }}>{game.url}</span>
                <select
                  value={game.min_tier}
                  onChange={(e) => updateGameTier(game.id, e.target.value as Tier)}
                  className="text-xs px-2 py-1 rounded-lg outline-none"
                  style={inputStyle}
                >
                  {TIERS.map(t => <option key={t.value} value={t.value} style={{ background: "#1a1a2e", color: "#fff" }}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => removeGame(game.id)}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              title="Remove"
              style={{ color: "hsl(0 70% 55%)" }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameManager;
