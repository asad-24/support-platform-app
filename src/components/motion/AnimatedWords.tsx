"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function AnimatedWords({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [visible, setVisible] = useState(false);
  const words = useMemo(() => text.split(" "), [text]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <h1 ref={ref} className={`${className} flex flex-wrap justify-center gap-x-3`}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`inline-block transition-all duration-700 ease-out ${
            visible
              ? "translate-y-0 opacity-100 blur-0"
              : "-translate-y-5 opacity-0 blur-md"
          }`}
          style={{ transitionDelay: `${index * 90}ms` }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}
