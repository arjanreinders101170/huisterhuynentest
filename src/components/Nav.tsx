"use client";
import { T, type Route } from "@/data/tokens";
import { IcHome, IcKey, IcChat, IcCart, IcInfo } from "./icons";
import { useLanguage } from "@/i18n";

type Props = {
  currentPage: string;
  onNavigate: (r: Route) => void;
};

export function Nav({ currentPage, onNavigate }: Props) {
  const { t } = useLanguage();
  const items = [
    { icon: <IcHome />, label: t.nav.home,    page: "home" as Route },
    { icon: <IcKey />,  label: t.nav.verblijf, page: "verblijf" as Route },
    { icon: <IcChat />, label: "",             page: "chat" as Route },
    { icon: <IcCart />, label: t.nav.extras,  page: "reserveren" as Route },
    { icon: <IcInfo />, label: t.nav.info,    page: "info" as Route },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, background: T.card,
      borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around",
      padding: "8px 0 20px", zIndex: 50,
    }}>
      {items.map(n => {
        const active = currentPage === n.page;
        const isChat = n.page === "chat";
        return (
          <button key={n.page} onClick={() => onNavigate(n.page)} style={{
            background: isChat ? (active ? T.green : "rgba(47,79,62,.06)") : "none",
            border: "none", cursor: "pointer",
            display: "flex", flexDirection: isChat ? "row" : "column",
            alignItems: "center", justifyContent: "center",
            gap: isChat ? 0 : 3, padding: isChat ? 0 : "2px 14px",
            width: isChat ? 48 : "auto", height: isChat ? 48 : "auto",
            borderRadius: isChat ? 14 : 0, position: "relative",
            color: isChat ? (active ? "#fff" : T.green) : (active ? T.text : T.muted),
            marginTop: isChat ? -10 : 0,
            boxShadow: isChat && active ? "0 4px 16px rgba(47,79,62,.25)" : "none",
            fontFamily: T.sans,
          }}>
            {n.icon}
            {!isChat && <span style={{ fontSize: 10, fontWeight: active ? 500 : 300 }}>{n.label}</span>}
            {active && !isChat && <div style={{ position: "absolute", top: -1, width: 14, height: 2, borderRadius: 1, background: T.gold }} />}
          </button>
        );
      })}
    </nav>
  );
}
