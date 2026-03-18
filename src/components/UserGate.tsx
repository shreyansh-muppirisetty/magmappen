import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const UserGate = ({ onPass }: { onPass: () => void }) => {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase
      .from("allowed_users")
      .select("user_id, blocked, expires_at")
      .eq("user_id", userId.trim())
      .maybeSingle();

    if (dbError) {
      setError("Connection error. Try again.");
    } else if (!data) {
      setError("Access denied. You are not authorized.");
    } else if (data.blocked) {
      setError("Your account has been blocked.");
    } else if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setError("Your account has expired. Please renew your subscription.");
    } else {
      onPass();
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-svh w-full flex items-center justify-center p-4"
      style={{ background: "hsl(var(--portal-bg))" }}
    >
      <div className="w-[360px] max-w-full text-center">
        <h1
          className="font-display font-bold text-2xl mb-2"
          style={{ color: "hsl(var(--portal-text))" }}
        >
          Enter User ID
        </h1>
        <p className="text-sm mb-6" style={{ color: "hsl(var(--portal-muted))" }}>
          Enter your authorized user ID to continue
        </p>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Your user ID..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mb-3"
          style={{
            background: "hsl(0 0% 100% / 0.08)",
            color: "hsl(var(--portal-text))",
            border: "1px solid hsl(0 0% 100% / 0.1)",
          }}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm mb-3"
            style={{ color: "hsl(0 70% 60%)" }}
          >
            {error}
          </motion.p>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-display font-semibold text-sm transition-opacity"
          style={{
            background: "hsl(var(--portal-accent))",
            color: "hsl(0 0% 100%)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Checking..." : "Continue"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserGate;
