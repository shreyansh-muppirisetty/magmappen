import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send, MessageCircle, Camera } from "lucide-react";
import { motion } from "framer-motion";

type ChatMessage = {
  id: string;
  username: string;
  message: string;
  created_at: string;
};

const AVATARS = [
  "😀", "😎", "🤖", "👾", "🐱", "🐶", "🦊", "🐸",
  "🔥", "⚡", "💀", "👻", "🎮", "🧠", "🦄", "🐧",
];

const GlobalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState(() => sessionStorage.getItem("chatUsername") || "");
  const [avatar, setAvatar] = useState(() => sessionStorage.getItem("chatAvatar") || "");
  const [hasSetName, setHasSetName] = useState(() => !!sessionStorage.getItem("chatUsername"));
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarMap = useRef<Record<string, string>>({});

  const isUrl = (str: string) => str.startsWith("http");

  const fetchMessages = async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: true });

    if (data) {
      const parsed = (data as ChatMessage[]).map((msg) => {
        const match = msg.message.match(/^\[(.+?)\] /);
        if (match) {
          avatarMap.current[msg.username] = match[1];
          return { ...msg, message: msg.message.replace(/^\[.+?\] /, "") };
        }
        return msg;
      });
      setMessages(parsed);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("global-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;
          const match = msg.message.match(/^\[(.+?)\] /);
          if (match) {
            avatarMap.current[msg.username] = match[1];
            setMessages((prev) => [...prev, { ...msg, message: msg.message.replace(/^\[.+?\] /, "") }]);
          } else {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || !username) return;

    setNewMessage("");
    await supabase.from("chat_messages").insert({
      username,
      message: `[${avatar}] ${trimmed}`,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("chat-avatars").upload(path, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("chat-avatars").getPublicUrl(path);
      setAvatar(urlData.publicUrl);
    }
    setUploading(false);
  };

  const handleSetName = () => {
    const trimmed = username.trim();
    if (!trimmed || !avatar) return;
    sessionStorage.setItem("chatUsername", trimmed);
    sessionStorage.setItem("chatAvatar", avatar);
    setHasSetName(true);
  };

  const renderAvatar = (src: string, size = "w-7 h-7 text-sm") => {
    if (isUrl(src)) {
      return (
        <div className={`${size} rounded-full shrink-0 overflow-hidden`} style={{ background: "hsl(var(--portal-card))" }}>
          <img src={src} alt="avatar" className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`${size} rounded-full flex items-center justify-center shrink-0`} style={{ background: "hsl(var(--portal-card))" }}>
        {src}
      </div>
    );
  };

  if (!hasSetName) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "hsl(var(--portal-bg))" }}
      >
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: "hsl(var(--portal-accent) / 0.15)" }}>
            <MessageCircle size={28} style={{ color: "hsl(var(--portal-accent))" }} />
          </div>
          <h2 className="font-display font-bold text-lg" style={{ color: "hsl(var(--portal-text))" }}>
            Pick a username & avatar
          </h2>
          <p className="text-xs" style={{ color: "hsl(var(--portal-muted))" }}>
            Chat resets daily. Be nice.
          </p>

          {/* Avatar preview */}
          {avatar && (
            <div className="flex justify-center">
              {renderAvatar(avatar, "w-16 h-16 text-3xl")}
            </div>
          )}

          {/* Upload custom image */}
          <div className="flex justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: "hsl(var(--portal-card))",
                color: "hsl(var(--portal-text))",
                border: "1px solid hsl(0 0% 100% / 0.08)",
              }}
            >
              <Camera size={14} />
              {uploading ? "Uploading..." : "Upload custom photo"}
            </button>
          </div>

          <p className="text-[10px]" style={{ color: "hsl(var(--portal-muted))" }}>or pick an emoji</p>

          {/* Emoji avatar picker */}
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                style={{
                  background: avatar === a ? "hsl(var(--portal-accent))" : "hsl(var(--portal-card))",
                  border: avatar === a ? "2px solid hsl(var(--portal-accent))" : "1px solid hsl(0 0% 100% / 0.08)",
                  transform: avatar === a ? "scale(1.15)" : "scale(1)",
                }}
              >
                {a}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Your name..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            onKeyDown={(e) => e.key === "Enter" && handleSetName()}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{
              background: "hsl(var(--portal-card))",
              color: "hsl(var(--portal-text))",
              border: "1px solid hsl(0 0% 100% / 0.08)",
            }}
          />
          <button
            onClick={handleSetName}
            disabled={!avatar || !username.trim()}
            className="w-full py-3 rounded-xl font-display font-semibold text-sm transition-transform hover:scale-[1.02] disabled:opacity-50"
            style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
          >
            Join Chat
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "hsl(var(--portal-bg))" }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
        <MessageCircle size={18} style={{ color: "hsl(var(--portal-accent))" }} />
        <span className="font-display font-bold text-sm" style={{ color: "hsl(var(--portal-text))" }}>
          Global Chat
        </span>
        <span className="text-[11px] ml-auto" style={{ color: "hsl(var(--portal-muted))" }}>
          Resets daily · {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center py-16" style={{ color: "hsl(var(--portal-muted))" }}>
            <p className="text-sm">No messages yet today. Say hi! 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.username === username;
          const msgAvatar = isMe ? avatar : (avatarMap.current[msg.username] || "👤");
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {renderAvatar(msgAvatar)}
              <div
                className="max-w-[70%] px-3 py-2 rounded-xl"
                style={{
                  background: isMe ? "hsl(var(--portal-accent))" : "hsl(var(--portal-card))",
                  color: isMe ? "hsl(0 0% 100%)" : "hsl(var(--portal-text))",
                }}
              >
                {!isMe && (
                  <p className="text-[10px] font-semibold mb-0.5" style={{ color: "hsl(var(--portal-accent))" }}>
                    {msg.username}
                  </p>
                )}
                <p className="text-sm break-words">{msg.message}</p>
                <p className="text-[9px] mt-0.5 opacity-50">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: "hsl(0 0% 100% / 0.08)" }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          maxLength={500}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: "hsl(var(--portal-card))",
            color: "hsl(var(--portal-text))",
            border: "1px solid hsl(0 0% 100% / 0.08)",
          }}
        />
        <button
          onClick={handleSend}
          className="px-4 rounded-xl transition-transform hover:scale-105"
          style={{ background: "hsl(var(--portal-accent))", color: "hsl(0 0% 100%)" }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default GlobalChat;
