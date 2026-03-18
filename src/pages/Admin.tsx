import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, ShieldBan, ShieldCheck, Plus } from "lucide-react";

type User = { id: string; user_id: string; blocked: boolean; created_at: string };

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newId, setNewId] = useState("");
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);

  const ADMIN_PASS = "admin7749";

  const fetchUsers = async () => {
    const { data } = await supabase.from("allowed_users").select("*").order("created_at");
    if (data) setUsers(data as User[]);
  };

  useEffect(() => {
    if (authed) fetchUsers();
  }, [authed]);

  const addUser = async () => {
    if (!newId.trim()) return;
    await supabase.from("allowed_users").insert({ user_id: newId.trim() });
    setNewId("");
    fetchUsers();
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

  return (
    <div className="min-h-screen p-6" style={{ background: "hsl(var(--portal-bg))" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display font-bold text-2xl mb-6" style={{ color: "hsl(var(--portal-text))" }}>
          Manage Users
        </h1>

        {/* Add user */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addUser()}
            placeholder="New user ID..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "hsl(0 0% 100% / 0.08)",
              color: "hsl(var(--portal-text))",
              border: "1px solid hsl(0 0% 100% / 0.1)",
            }}
          />
          <button
            onClick={addUser}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium"
            style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
          >
            <Plus size={16} /> Add
          </button>
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
              <div>
                <span className="font-medium text-sm" style={{ color: "hsl(var(--portal-text))" }}>
                  {user.user_id}
                </span>
                {user.blocked && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: "hsl(0 70% 50% / 0.2)", color: "hsl(0 70% 60%)" }}>
                    Blocked
                  </span>
                )}
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
