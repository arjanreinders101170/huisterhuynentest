"use client";
import { useEffect, useState } from "react";
import { IconHeart } from "./Icons";

/* Favorieten leven in de mock-up in localStorage. In het echte platform
   hangen ze aan het gastaccount, zodat ze meeverhuizen naar de app en de
   e-mails — en zodat we zien welke woningen worden bewaard. */
const KEY = "ww-favorieten";

export function FavoriteButton({ id, name }: { id: string; name: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try {
      setOn(JSON.parse(localStorage.getItem(KEY) ?? "[]").includes(id));
    } catch { /* privémodus: favorieten werken dan gewoon niet */ }
  }, [id]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOn((prev) => {
      const next = !prev;
      try {
        const list: string[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
        localStorage.setItem(KEY, JSON.stringify(next ? [...new Set([...list, id])] : list.filter((x) => x !== id)));
      } catch { /* zie boven */ }
      return next;
    });
  };

  return (
    <button
      className="ww-card__fav" onClick={toggle} aria-pressed={on}
      aria-label={on ? `${name} uit favorieten halen` : `${name} bewaren`}
    >
      <IconHeart filled={on} />
    </button>
  );
}
