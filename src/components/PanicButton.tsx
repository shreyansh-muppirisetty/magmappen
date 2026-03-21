import { useState, useRef, useEffect } from "react";
import { AlertTriangle, ChevronDown, ExternalLink, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_LINKS = [
  { label: "Google", url: "https://www.google.com" },
  { label: "Google Classroom", url: "https://classroom.google.com" },
  { label: "Khan Academy", url: "https://www.khanacademy.org" },
];

const PanicButton = () => {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState(DEFAULT_LINKS);
  const [customUrl, setCustomUrl] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load admin default + user custom links
  useEffect(() => {
    const loadLinks = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .like("key", "panic_link_%");
      
      if (data && data.length > 0) {
        const adminLinks = data.map((row) => {
          const parts = row.value.split("|");
          return { label: parts[0] || parts[1], url: parts[1] || parts[0] };
        });
        setLinks(adminLinks);
      }
    };
    loadLinks();

    // Load user custom links from sessionStorage
    const saved = sessionStorage.getItem("panicCustomLinks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLinks((prev) => [...prev, ...parsed]);
        }
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAddingCustom(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const triggerPanic = (url: string) => {
    window.open(url, "_blank");
    setOpen(false);
  };

  const addCustomLink = () => {
    if (!customUrl.trim()) return;
    let url = customUrl.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    const label = url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];
    const newLink = { label, url };

    // Save to sessionStorage
    const saved = sessionStorage.getItem("panicCustomLinks");
    const existing = saved ? JSON.parse(saved) : [];
    existing.push(newLink);
    sessionStorage.setItem("panicCustomLinks", JSON.stringify(existing));

    setLinks((prev) => [...prev, newLink]);
    setCustomUrl("");
    setAddingCustom(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: "hsl(0 70% 50% / 0.15)",
          color: "hsl(0 70% 65%)",
        }}
      >
        <AlertTriangle size={14} />
        <span className="hidden sm:inline">Panic</span>
        <ChevronDown size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl py-1.5 z-50 overflow-hidden"
            style={{
              background: "hsl(var(--portal-card))",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 8px 32px hsl(0 0% 0% / 0.4)",
            }}
          >
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider" style={{ color: "hsl(var(--portal-muted))" }}>
              Open in new tab
            </div>
            {links.map((link, i) => (
              <button
                key={i}
                onClick={() => triggerPanic(link.url)}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors"
                style={{ color: "hsl(var(--portal-text))" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(0 0% 100% / 0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <ExternalLink size={12} style={{ color: "hsl(var(--portal-muted))" }} />
                {link.label}
              </button>
            ))}

            <div className="mx-2 my-1 border-t" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }} />

            {addingCustom ? (
              <div className="px-3 py-2 flex gap-1.5">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomLink()}
                  placeholder="https://..."
                  autoFocus
                  className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{
                    background: "hsl(0 0% 100% / 0.08)",
                    color: "hsl(var(--portal-text))",
                    border: "1px solid hsl(0 0% 100% / 0.1)",
                  }}
                />
                <button
                  onClick={addCustomLink}
                  className="px-2 py-1.5 rounded-lg text-xs"
                  style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingCustom(true)}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors"
                style={{ color: "hsl(var(--portal-accent))" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(var(--portal-accent) / 0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <Plus size={12} />
                Add custom URL
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PanicButton;
