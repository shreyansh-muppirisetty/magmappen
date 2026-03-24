import { useState, useEffect, useRef } from "react";
import { EyeOff, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CloakOption = {
  label: string;
  title: string;
  favicon: string;
};

const CLOAK_OPTIONS: CloakOption[] = [
  {
    label: "Google",
    title: "Google",
    favicon: "https://www.google.com/favicon.ico",
  },
  {
    label: "Magma.se",
    title: "Magma – Business Communication",
    favicon: "https://magma.se/favicon.ico",
  },
  {
    label: "Dictionary.com",
    title: "Dictionary.com | Meanings & Definitions of English Words",
    favicon: "https://www.dictionary.com/favicon.ico",
  },
  {
    label: "Word Online",
    title: "Document - Microsoft Word Online",
    favicon: "https://res.cdn.office.net/assets/mail/file-icon/ico/docx_16x1.ico",
  },
  {
    label: "Teams",
    title: "Microsoft Teams",
    favicon: "https://statics.teams.cdn.office.net/hashedassets-new/favicon/favicon-b7d58b1.ico",
  },
  {
    label: "Google Search",
    title: "homework help - Google Search",
    favicon: "https://www.google.com/favicon.ico",
  },
  {
    label: "PowerPoint",
    title: "Presentation - Microsoft PowerPoint Online",
    favicon: "https://res.cdn.office.net/assets/mail/file-icon/ico/pptx_16x1.ico",
  },
];

const ORIGINAL_TITLE = document.title;
const ORIGINAL_FAVICON = (document.querySelector("link[rel*='icon']") as HTMLLinkElement)?.href || "/favicon.ico";

const TabCloaker = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const applyCloak = (option: CloakOption) => {
    document.title = option.title;
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = option.favicon;
    setActive(option.label);
    setOpen(false);
  };

  const removeCloak = () => {
    document.title = ORIGINAL_TITLE;
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) link.href = ORIGINAL_FAVICON;
    setActive(null);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: active ? "hsl(var(--portal-accent) / 0.2)" : "hsl(0 0% 100% / 0.06)",
          color: active ? "hsl(var(--portal-accent))" : "hsl(var(--portal-muted))",
        }}
      >
        <EyeOff size={14} />
        <span className="hidden sm:inline">{active || "Cloak"}</span>
        <ChevronDown size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 rounded-xl py-1.5 z-50 overflow-hidden"
            style={{
              background: "hsl(var(--portal-card))",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 8px 32px hsl(0 0% 0% / 0.4)",
            }}
          >
            {CLOAK_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => applyCloak(opt)}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 transition-colors"
                style={{
                  color: active === opt.label ? "hsl(var(--portal-accent))" : "hsl(var(--portal-text))",
                  background: active === opt.label ? "hsl(var(--portal-accent) / 0.1)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (active !== opt.label) e.currentTarget.style.background = "hsl(0 0% 100% / 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = active === opt.label ? "hsl(var(--portal-accent) / 0.1)" : "transparent";
                }}
              >
                <img src={opt.favicon} alt="" className="w-4 h-4 rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                {opt.label}
              </button>
            ))}

            {active && (
              <>
                <div className="mx-2 my-1 border-t" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }} />
                <button
                  onClick={removeCloak}
                  className="w-full text-left px-3 py-2 text-xs transition-colors"
                  style={{ color: "hsl(0 70% 55%)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "hsl(0 70% 55% / 0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Remove Cloak
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TabCloaker;
