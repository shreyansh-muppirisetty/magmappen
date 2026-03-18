import { useState, useEffect } from "react";

const PROXY_URL = `https://xubzjqrvclirkjztgjdw.supabase.co/functions/v1/proxy`;

interface ProxiedIframeProps {
  url: string;
  className?: string;
  allow?: string;
  sandbox?: string;
}

const ProxiedIframe = ({ url, className, allow, sandbox }: ProxiedIframeProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHtml(null);
    setError(false);

    fetch(`${PROXY_URL}?url=${encodeURIComponent(url)}`)
      .then((res) => res.text())
      .then((text) => {
        if (!cancelled) setHtml(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => { cancelled = true; };
  }, [url]);

  if (error) {
    // Fallback to direct iframe
    return <iframe src={url} className={className} allow={allow} sandbox={sandbox} />;
  }

  if (html === null) {
    return (
      <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#000" }}>
        <div style={{ color: "#666", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className={className}
      allow={allow}
      sandbox={sandbox}
    />
  );
};

export default ProxiedIframe;
