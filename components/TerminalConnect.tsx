"use client";

import { useEffect, useState } from "react";

export default function TerminalConnect() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("terminal-shown");
    if (!seen) {
      setShow(true);
      sessionStorage.setItem("terminal-shown", "1");
      setTimeout(() => setShow(false), 1500);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "64px",
        left: "24px",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <span className="terminal-connect">
        $ ssh auditor@boundary ———————— CONNECTED
      </span>
    </div>
  );
}
