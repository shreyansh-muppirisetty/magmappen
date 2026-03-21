import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, AlertTriangle } from "lucide-react";

const inputStyle = {
  background: "hsl(0 0% 100% / 0.08)",
  color: "hsl(var(--portal-text))",
  border: "1px solid hsl(0 0% 100% / 0.1)",
};

type PanicLink = { key: string; label: string; url: string };

const PanicLinkManager = () => {
  const [links, setLinks] = useState<PanicLink[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const fetchLinks = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("*")
      .like("key", "panic_link_%");
    if (data) {
      setLinks(
        data.map((row) => {
          const parts = row.value.split("|");
          return { key: row.key, label: parts[0] || "", url: parts[1] || parts[0] };
        })
      );
    }
  };

  useEffect(() => { fetchLinks(); }, []);

  const addLink = async () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    const key = `panic_link_${Date.now()}`;
    await supabase.from("site_settings").insert({ key, value: `${newLabel.trim()}|${url}` });
    setNewLabel("");
    setNewUrl("");
    await fetchLinks();
  };

  const removeLink = async (key: string) => {
    await supabase.from("site_settings").delete().eq("key", key);
    await fetchLinks();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} style={{ color: "hsl(0 70% 60%)" }} />
        <h2 className="font-display font-bold text-xl" style={{ color: "hsl(var(--portal-text))" }}>
          Panic Mode Links
        </h2>
      </div>
      <p className="text-xs mb-4" style={{ color: "hsl(var(--portal-muted))" }}>
        Default links shown in the panic button dropdown. Users can also add their own custom URLs.
      </p>

      {/* Add link form */}
      <div className="rounded-xl p-4 mb-4" style={{ background: "hsl(var(--portal-card))", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Google)" className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
          />
          <input
            type="text" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL (e.g. https://google.com)" className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}
          />
        </div>
        <button onClick={addLink} className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
          style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}>
          <Plus size={16} /> Add Panic Link
        </button>
      </div>

      {/* Links list */}
      <div className="space-y-2">
        {links.map((link) => (
          <div key={link.key} className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: "hsl(var(--portal-card))", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
            <div>
              <span className="font-medium text-sm" style={{ color: "hsl(var(--portal-text))" }}>{link.label}</span>
              <span className="text-xs ml-3 truncate" style={{ color: "hsl(var(--portal-muted))" }}>{link.url}</span>
            </div>
            <button onClick={() => removeLink(link.key)} className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: "hsl(0 70% 55%)" }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "hsl(var(--portal-muted))" }}>
            No custom links. Default links (Google, Classroom, Khan Academy) will be shown.
          </p>
        )}
      </div>
    </div>
  );
};

export default PanicLinkManager;
