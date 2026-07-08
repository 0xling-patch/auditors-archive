"use client";

import { useEffect, useState } from "react";

export default function PageHalo() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 每次 session 只觸發一次
    const seen = sessionStorage.getItem("halo-shown");
    if (!seen) {
      setShow(true);
      sessionStorage.setItem("halo-shown", "1");
      setTimeout(() => setShow(false), 1300);
    }
  }, []);

  if (!show) return null;

  return <div className="page-halo" aria-hidden="true" />;
}
