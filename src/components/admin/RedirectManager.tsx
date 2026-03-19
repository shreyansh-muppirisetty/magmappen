import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

const RedirectManager = () => {
  const [enabled, setEnabled] = useState(false);
  const [url, setUrl] = useState("https://magmamath.lovable.app");
  const [message, setMessage] = useState("Website has changed names for today. If you want to play you have to go to:");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        for (const row of data) {
          if (row.key === "redirect_enabled") setEnabled(row.value === "true");
          if (row.key === "redirect_url") setUrl(row.value);
          if (row.key === "redirect_message") setMessage(row.value);
        }
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    await supabase.from("site_settings").update({ value }).eq("key", key);
  };

  const toggleEnabled = async () => {
    const next = !enabled;
    setEnabled(next);
    await updateSetting("redirect_enabled", String(next));
  };

  const saveUrl = async () => {
    await updateSetting("redirect_url", url);
  };

  const saveMessage = async () => {
    await updateSetting("redirect_message", message);
  };

  if (loading) return null;

  return (
    <div>
      <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2" style={{ color: "hsl(var(--portal-text))" }}>
        <AlertTriangle size={20} style={{ color: enabled ? "hsl(45 90% 50%)" : "hsl(var(--portal-muted))" }} />
        Redirect Mode
      </h2>

      <div
        className="rounded-xl p-4"
        style={{ background: "hsl(var(--portal-card))", border: "1px solid hsl(0 0% 100% / 0.06)" }}
      >
        {/* Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium" style={{ color: "hsl(var(--portal-text))" }}>
            Show redirect message after calculator code
          </span>
          <button
            onClick={toggleEnabled}
            className="w-12 h-7 rounded-full relative transition-colors"
            style={{ background: enabled ? "hsl(var(--portal-accent))" : "hsl(0 0% 100% / 0.15)" }}
          >
            <div
              className="w-5 h-5 rounded-full absolute top-1 transition-all"
              style={{
                background: "hsl(0 0% 100%)",
                left: enabled ? "26px" : "4px",
              }}
            />
          </button>
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="text-xs mb-1 block" style={{ color: "hsl(var(--portal-muted))" }}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={saveMessage}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{
              background: "hsl(0 0% 100% / 0.08)",
              color: "hsl(var(--portal-text))",
              border: "1px solid hsl(0 0% 100% / 0.1)",
            }}
          />
        </div>

        {/* URL */}
        <div>
          <label className="text-xs mb-1 block" style={{ color: "hsl(var(--portal-muted))" }}>Redirect URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={saveUrl}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              background: "hsl(0 0% 100% / 0.08)",
              color: "hsl(var(--portal-text))",
              border: "1px solid hsl(0 0% 100% / 0.1)",
            }}
          />
        </div>

        {enabled && (
          <div className="mt-3 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(45 90% 50% / 0.1)", color: "hsl(45 90% 50%)" }}>
            ⚠️ Redirect is ACTIVE — users will see the message instead of entering the portal.
          </div>
        )}
      </div>
    </div>
  );
};

export default RedirectManager;
