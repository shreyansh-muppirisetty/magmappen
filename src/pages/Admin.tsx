import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, ShieldBan, ShieldCheck, Plus, CalendarIcon, AlertTriangle, MessageCircle } from "lucide-react";
import GameManager from "@/components/admin/GameManager";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import RedirectManager from "@/components/admin/RedirectManager";
import PanicLinkManager from "@/components/admin/PanicLinkManager";

type Tier = "freetrial" | "trash" | "pro" | "hacker";
const TIERS: { value: Tier; label: string }[] = [
  { value: "freetrial", label: "Free Trial" },
  { value: "trash", label: "Trash" },
  { value: "pro", label: "Pro" },
  { value: "hacker", label: "Hacker" },
];

type User = { id: string; user_id: string; blocked: boolean; created_at: string; expires_at: string | null; tier: Tier; password: string };

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newId, setNewId] = useState("");
  const [newExpiry, setNewExpiry] = useState<Date | undefined>();
  const [newTier, setNewTier] = useState<Tier>("freetrial");
  const [newPassword, setNewPassword] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);

  const ADMIN_PASS = "5534";

  const fetchUsers = async () => {
    const { data } = await supabase.from("allowed_users").select("*").order("created_at");
    if (data) setUsers(data as User[]);
  };

  useEffect(() => {
    if (authed) fetchUsers();
  }, [authed]);

  const addUser = async () => {
    if (!newId.trim()) return;
    const { error } = await supabase.from("allowed_users").insert({
      user_id: newId.trim(),
      expires_at: newExpiry ? newExpiry.toISOString() : null,
      tier: newTier,
      password: newPassword,
    });
    if (error) {
      alert(error.message);
      return;
    }
    setNewId("");
    setNewExpiry(undefined);
    setNewTier("freetrial");
    setNewPassword("");
    await fetchUsers();
  };

  const updateExpiry = async (userId: string, date: Date | undefined) => {
    await supabase
      .from("allowed_users")
      .update({ expires_at: date ? date.toISOString() : null })
      .eq("id", userId);
    setEditingExpiry(null);
    await fetchUsers();
  };

  const updateTier = async (userId: string, tier: Tier) => {
    await supabase
      .from("allowed_users")
      .update({ tier })
      .eq("id", userId);
    await fetchUsers();
  };

  const toggleBlock = async (user: User) => {
    await supabase
      .from("allowed_users")
      .update({ blocked: !user.blocked })
      .eq("id", user.id);
    fetchUsers();
  };

  const removeUser = async (id: string) => {
    await supabase.from("allowed_users").delete().eq("id", id);
    fetchUsers();
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "hsl(var(--portal-bg))" }}>
        <div className="w-[320px] text-center">
          <h1 className="font-display font-bold text-xl mb-4" style={{ color: "hsl(var(--portal-text))" }}>
            Admin Access
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password === ADMIN_PASS && setAuthed(true)}
            placeholder="Admin password..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
            style={{
              background: "hsl(0 0% 100% / 0.08)",
              color: "hsl(var(--portal-text))",
              border: "1px solid hsl(0 0% 100% / 0.1)",
            }}
          />
          <button
            onClick={() => password === ADMIN_PASS && setAuthed(true)}
            className="w-full py-3 rounded-xl font-display font-semibold text-sm"
            style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "hsl(var(--portal-bg))" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "hsl(var(--portal-text))" }}>
          Admin Panel
        </h1>

        {/* Clear Chat */}
        <div className="mb-10 p-4 rounded-xl" style={{ background: "hsl(var(--portal-card))", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} style={{ color: "hsl(var(--portal-accent))" }} />
              <span className="font-display font-bold text-sm" style={{ color: "hsl(var(--portal-text))" }}>Global Chat</span>
            </div>
            <button
              onClick={async () => {
                if (!confirm("Clear all chat messages?")) return;
                await supabase.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                alert("Chat cleared!");
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-transform hover:scale-[1.02]"
              style={{ background: "hsl(0 70% 50%)", color: "hsl(0 0% 100%)" }}
            >
              <Trash2 size={14} /> Clear All Messages
            </button>
          </div>
        </div>

        {/* Redirect Manager */}
        <div className="mb-10">
          <RedirectManager />
        </div>

        {/* Game Manager */}
        <div className="mb-10">
          <GameManager />
        </div>

        <h2 className="font-display font-bold text-xl mb-4" style={{ color: "hsl(var(--portal-text))" }}>
          Manage Users
        </h2>

        {/* Add user */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="New user ID..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "hsl(0 0% 100% / 0.08)",
                color: "hsl(var(--portal-text))",
                border: "1px solid hsl(0 0% 100% / 0.1)",
              }}
            />
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "hsl(0 0% 100% / 0.08)",
                color: "hsl(var(--portal-text))",
                border: "1px solid hsl(0 0% 100% / 0.1)",
              }}
            />
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm"
                  style={{
                    background: "hsl(0 0% 100% / 0.08)",
                    color: newExpiry ? "hsl(var(--portal-text))" : "hsl(var(--portal-muted))",
                    border: "1px solid hsl(0 0% 100% / 0.1)",
                  }}
                >
                  <CalendarIcon size={16} />
                  {newExpiry ? format(newExpiry, "MMM d, yyyy") : "Expiry"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={newExpiry}
                  onSelect={setNewExpiry}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <select
              value={newTier}
              onChange={(e) => setNewTier(e.target.value as Tier)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                background: "hsl(0 0% 100% / 0.08)",
                color: "hsl(var(--portal-text))",
                border: "1px solid hsl(0 0% 100% / 0.1)",
              }}
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value} style={{ background: "#1a1a2e", color: "#fff" }}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              onClick={addUser}
              className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium"
              style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
          {newExpiry && (
            <button
              onClick={() => setNewExpiry(undefined)}
              className="text-xs self-start ml-1"
              style={{ color: "hsl(var(--portal-muted))" }}
            >
              ✕ Clear expiry (no expiration)
            </button>
          )}
        </div>

        {/* Users list */}
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: "hsl(var(--portal-card))",
                border: "1px solid hsl(0 0% 100% / 0.06)",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm" style={{ color: "hsl(var(--portal-text))" }}>
                    {user.user_id}
                  </span>
                   <span
                     className="text-xs px-2 py-0.5 rounded-full"
                     style={{
                       background: user.tier === "hacker" ? "hsl(280 70% 50% / 0.2)" : user.tier === "pro" ? "hsl(200 70% 50% / 0.2)" : user.tier === "trash" ? "hsl(0 0% 50% / 0.2)" : "hsl(120 50% 50% / 0.2)",
                       color: user.tier === "hacker" ? "hsl(280 70% 65%)" : user.tier === "pro" ? "hsl(200 70% 65%)" : user.tier === "trash" ? "hsl(0 0% 60%)" : "hsl(120 50% 60%)",
                     }}
                   >
                     {TIERS.find(t => t.value === user.tier)?.label || user.tier}
                   </span>
                    {user.blocked && (
                     <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "hsl(0 70% 50% / 0.2)", color: "hsl(0 70% 60%)" }}>
                       Blocked
                     </span>
                   )}
                   {isExpired(user.expires_at) && !user.blocked && (
                     <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "hsl(40 80% 50% / 0.2)", color: "hsl(40 80% 55%)" }}>
                       Expired
                     </span>
                   )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs" style={{ color: "hsl(var(--portal-muted))" }}>
                    🔑 {user.password || "(no password)"}
                  </span>
                  <select
                    value={user.tier}
                    onChange={(e) => updateTier(user.id, e.target.value as Tier)}
                    className="text-xs px-2 py-1 rounded-lg outline-none"
                    style={{
                      background: "hsl(0 0% 100% / 0.08)",
                      color: "hsl(var(--portal-muted))",
                      border: "1px solid hsl(0 0% 100% / 0.1)",
                    }}
                  >
                    {TIERS.map((t) => (
                      <option key={t.value} value={t.value} style={{ background: "#1a1a2e", color: "#fff" }}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <Popover open={editingExpiry === user.id} onOpenChange={(open) => setEditingExpiry(open ? user.id : null)}>
                    <PopoverTrigger asChild>
                      <button
                        className="text-xs flex items-center gap-1 hover:underline"
                        style={{ color: "hsl(var(--portal-muted))" }}
                      >
                        <CalendarIcon size={12} />
                        {user.expires_at
                          ? `Expires: ${format(new Date(user.expires_at), "MMM d, yyyy")}`
                          : "No expiry"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={user.expires_at ? new Date(user.expires_at) : undefined}
                        onSelect={(date) => updateExpiry(user.id, date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      {user.expires_at && (
                        <button
                          onClick={() => updateExpiry(user.id, undefined)}
                          className="w-full text-xs py-2 border-t"
                          style={{ color: "hsl(var(--portal-muted))", borderColor: "hsl(0 0% 50% / 0.2)" }}
                        >
                          Remove expiry
                        </button>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleBlock(user)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  title={user.blocked ? "Unblock" : "Block"}
                  style={{ color: user.blocked ? "hsl(120 60% 50%)" : "hsl(40 80% 55%)" }}
                >
                  {user.blocked ? <ShieldCheck size={18} /> : <ShieldBan size={18} />}
                </button>
                <button
                  onClick={() => removeUser(user.id)}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  title="Remove"
                  style={{ color: "hsl(0 70% 55%)" }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
