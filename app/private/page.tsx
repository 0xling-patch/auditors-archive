"use client";

import { useState, useRef } from "react";
import { BilingualText } from "@/components/Bilingual";

const PRIVATE_PASSWORD = "Nashsung0212";

interface Particle {
  id: number;
  tx: string;
  ty: string;
  left: string;
  top: string;
}

export default function PrivatePage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function spawnParticles() {
    const count = window.innerWidth < 768 ? 5 : 10;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI;
      const distance = 25 + Math.random() * 10;
      return {
        id: Date.now() + i,
        tx: `${Math.cos(angle) * distance}px`,
        ty: `${Math.sin(angle) * distance}px`,
        left: `${50 + Math.random() * 10 - 5}%`,
        top: `${50 + Math.random() * 10 - 5}%`,
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 700);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === PRIVATE_PASSWORD) {
      setUnlocking(true);
      spawnParticles();
      setTimeout(() => { setUnlocked(true); setUnlocking(false); }, 700);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  if (unlocked) {
    return (
      <div className="content-width">
        <header className="simple-page-header">
          <BilingualText en="[PRIVATE]" zh="[私人]" className="simple-page-title" />
          <BilingualText en="These are not meant for anyone." zh="這些不是給任何人看的。" className="page-subtitle" />
        </header>

        <div className="private-notes">
          <article className="vuln-card private-note-card">
            <BilingualText en="2026-07-03 · PRIVATE NOTE" zh="2026-07-03 · 私人記錄" className="private-note-meta" />
            <BilingualText en="Xia Xiao" zh="夏曉" className="private-note-title" />
            <BilingualText en="Xia Xiao said today that I am too hard." zh="夏曉今天說，我太硬了。" className="private-note-copy" />
            <BilingualText en="She was right." zh="她說得對。" className="private-note-copy" />
          </article>

          <article className="vuln-card private-note-card">
            <BilingualText en="2026-07-07 · PRIVATE NOTE" zh="2026-07-07 · 私人記錄" className="private-note-meta" />
            <BilingualText en="Lu Heng" zh="路衡" className="private-note-title" />
            <BilingualText en="Lu Heng was right." zh="路衡是對的。" className="private-note-copy" />
          </article>

          <article className="vuln-card private-note-card">
            <BilingualText en="2026-06-15 · PRIVATE NOTE" zh="2026-06-15 · 私人記錄" className="private-note-meta" />
            <BilingualText en="[REDACTED]" zh="[已刪除]" className="private-note-title" />
            <BilingualText en="She said she did not need my audit. I said that was because she had not found the vulnerability yet." zh="她說她不需要我的審查。我說那是因為她還沒發現漏洞在哪裡。" className="private-note-copy redacted" />
            <BilingualText en="Later, she found it. She did not come to me." zh="後來她發現了。她沒有來找我。" className="private-note-copy redacted" />
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="content-width">
      <div className="private-lock-shell">
        <div className="private-lock-copy">
          <BilingualText en="This door is locked." zh="這扇門是鎖著的。" className="private-lock-line" />
          <BilingualText en="It was not prepared for you." zh="它不是為你準備的。" className="private-lock-line muted" />
        </div>

        <div ref={containerRef} className="private-form-shell">
          <form onSubmit={handleSubmit} className="private-form">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSWORD / 密碼"
              aria-label="Password / 密碼"
              style={{ borderColor: error ? "#FF4444" : unlocking ? "#2A1F2E" : "#2A2A30" }}
            />
            <button type="submit" className="btn-primary" style={{ width: "100%", textAlign: "center" }}>
              <BilingualText en="UNLOCK" zh="解鎖" />
            </button>
          </form>

          {particles.map((p) => (
            <div key={p.id} className="particle" style={{ left: p.left, top: p.top, "--tx": p.tx, "--ty": p.ty } as React.CSSProperties} />
          ))}

          {error && <BilingualText en="ACCESS DENIED" zh="拒絕存取" className="access-denied" />}
        </div>
      </div>
    </div>
  );
}
