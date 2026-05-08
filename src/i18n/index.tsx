"use client";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { nl } from "./nl";
import { de } from "./de";

export type Lang = "nl" | "de";
export type Translations = Omit<typeof nl, "lang"> & { lang: Lang };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANSLATIONS: Record<Lang, Translations> = { nl, de } as any;

type LangCtx = { lang: Lang; setLang: (l: Lang) => void; t: Translations };

const Ctx = createContext<LangCtx>({ lang: "nl", setLang: () => {}, t: nl });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("nl");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hth-lang") as Lang | null;
      if (saved === "de" || saved === "nl") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("hth-lang", l); } catch {}
  };

  return (
    <Ctx.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLanguage() { return useContext(Ctx); }
