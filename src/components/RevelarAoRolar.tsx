"use client";

import { useEffect, useRef, useState } from "react";

export function RevelarAoRolar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    function marcarVisivel() {
      setVisivel(true);
    }

    const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzMovimento) {
      marcarVisivel();
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          marcarVisivel();
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visivel ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
