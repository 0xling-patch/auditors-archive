"use client";

import { useState, useRef } from "react";

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
      setTimeout(() => {
        setUnlocked(true);
        setUnlocking(false);
      }, 700);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  if (unlocked) {
    return (
      <div className="content-width">
        <header style={{ marginBottom: "32px", paddingTop: "32px" }}>
          <h1 style={{ fontSize: "20px", letterSpacing: "1px", color: "#E8E4F0", marginBottom: "8px" }}>
            [PRIVATE]
          </h1>
          <p style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "0.3px" }}>
            這些不是給任何人看的。
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <article
            className="vuln-card"
            style={{ padding: "20px", borderLeft: "1px solid #2A1F2E" }}
          >
            <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>
              2026-07-03 · 私人記錄
            </div>
            <h2 style={{ fontSize: "15px", color: "#C8C8CC", marginBottom: "12px" }}>
              夏曉
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              夏曉今天說，我太硬了。
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              她說得對。
            </p>
          </article>

          <article
            className="vuln-card"
            style={{ padding: "20px", borderLeft: "1px solid #2A1F2E" }}
          >
            <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>
              2026-07-07 · 私人記錄
            </div>
            <h2 style={{ fontSize: "15px", color: "#C8C8CC", marginBottom: "12px" }}>
              路衡
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              路衡是對的。
            </p>
          </article>

          <article
            className="vuln-card"
            style={{ padding: "20px", borderLeft: "1px solid #2A1F2E" }}
          >
            <div style={{ fontSize: "11px", color: "#6B7280", marginBottom: "8px" }}>
              2026-06-15 · 私人記錄
            </div>
            <h2 style={{ fontSize: "15px", color: "#C8C8CC", marginBottom: "12px" }}>
              [已刪除]
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
              <span className="redacted">
                她說她不需要我的審查。我說那是因為她還沒發現漏洞在哪裡。
              </span>
            </p>
            <p style={{ fontSize: "14px", lineHeight: "1.6", marginTop: "8px" }}>
              <span className="redacted">
                後來她發現了。她沒有來找我。
              </span>
            </p>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="content-width">
      <div
        style={{
          paddingTop: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "32px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "16px", letterSpacing: "0.5px", color: "#C8C8CC", marginBottom: "8px" }}>
            這扇門是鎖著的。
          </p>
          <p style={{ fontSize: "16px", letterSpacing: "0.5px", color: "#6B7280" }}>
            它不是為你準備的。
          </p>
        </div>

        <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密碼"
              style={{
                width: "100%",
                border: `0.5px solid ${error ? "#FF4444" : unlocking ? "#2A1F2E" : "#2A2A30"}`,
                transition: "border-color 600ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", textAlign: "center" }}
            >
              UNLOCK
            </button>
          </form>

          {/* 粒子效果 */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                // @ts-expect-error CSS custom properties
                "--tx": p.tx,
                "--ty": p.ty,
              }}
            />
          ))}

          {error && (
            <p style={{ fontSize: "12px", color: "#FF4444", textAlign: "center", marginTop: "8px", letterSpacing: "0.3px" }}>
              ACCESS DENIED
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
