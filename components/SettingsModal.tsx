"use client";

import { useState } from "react";
import { Globe, Cpu, X } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";
import { useTheme } from "@/hooks/useTheme";
import { ModelsConfigTab } from "./ModelsConfig";

type SettingsTab = "general" | "models";

interface SettingsModalProps {
  onClose: () => void;
  onModelsChanged?: () => void;
}

export function SettingsModal({ onClose, onModelsChanged }: SettingsModalProps) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: t("settings.general"), icon: <Globe size={15} strokeWidth={1.8} aria-hidden="true" /> },
    { id: "models", label: t("settings.models"), icon: <Cpu size={15} strokeWidth={1.8} aria-hidden="true" /> },
  ];

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const themeIcon =
    theme === "light" ? "🌙" : theme === "dark" ? "👁️" : "☀️";

  const themes: { key: "light" | "dark" | "eye"; label: string }[] = [
    { key: "light", label: t("settings.light") },
    { key: "dark", label: t("settings.dark") },
    { key: "eye", label: t("settings.eyeComfort") },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-surface"
        style={{
          width: "min(720px, calc(100vw - 16px))",
          height: "min(560px, calc(100dvh - 16px))",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            {t("settings.title")}
          </span>
          <button
            onClick={onClose}
            aria-label={t("general.close")}
            style={{
              display: "grid",
              placeItems: "center",
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "2px 6px",
            }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            padding: "0 12px",
            background: "var(--bg-panel)",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.12s, border-color 0.12s",
                  marginBottom: -1,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {activeTab === "general" && (
            <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
              {/* Language */}
              <section style={{ marginBottom: 32 }}>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Globe size={16} strokeWidth={1.8} aria-hidden="true" />
                  {t("settings.language")}
                </h3>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginBottom: 16,
                    lineHeight: 1.5,
                  }}
                >
                  {t("settings.languageDescription")}
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => handleLocaleChange("en")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 20px",
                      background:
                        locale === "en" ? "var(--accent)" : "var(--bg)",
                      border:
                        locale === "en"
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      borderRadius: 8,
                      color: locale === "en" ? "#fff" : "var(--text)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: locale === "en" ? 600 : 400,
                      transition: "all 0.12s",
                    }}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => handleLocaleChange("zh")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 20px",
                      background:
                        locale === "zh" ? "var(--accent)" : "var(--bg)",
                      border:
                        locale === "zh"
                          ? "1px solid var(--accent)"
                          : "1px solid var(--border)",
                      borderRadius: 8,
                      color: locale === "zh" ? "#fff" : "var(--text)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: locale === "zh" ? 600 : 400,
                      transition: "all 0.12s",
                    }}
                  >
                    🇨🇳 中文
                  </button>
                </div>
              </section>

              {/* Theme */}
              <section>
                <h3
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {themeIcon} {t("settings.theme")}
                </h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {themes.map((th) => {
                    const isActive = theme === th.key;
                    return (
                      <button
                        key={th.key}
                        onClick={() => {
                          // Cycle through themes until we hit the target
                          const order: ("light" | "dark" | "eye")[] = [
                            "light",
                            "dark",
                            "eye",
                          ];
                          const currentIndex = order.indexOf(theme);
                          const targetIndex = order.indexOf(th.key);
                          const diff =
                            (targetIndex - currentIndex + 3) % 3;
                          for (let i = 0; i < diff; i++) {
                            toggleTheme({
                              x: window.innerWidth / 2,
                              y: window.innerHeight / 2,
                            });
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 20px",
                          background: isActive
                            ? "var(--accent)"
                            : "var(--bg)",
                          border: isActive
                            ? "1px solid var(--accent)"
                            : "1px solid var(--border)",
                          borderRadius: 8,
                          color: isActive ? "#fff" : "var(--text)",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: isActive ? 600 : 400,
                          transition: "all 0.12s",
                        }}
                      >
                        {th.key === "light" && "☀️"}
                        {th.key === "dark" && "🌙"}
                        {th.key === "eye" && "👁️"}
                        {th.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {activeTab === "models" && (
            <ModelsConfigTab
              onClose={onClose}
              onChanged={onModelsChanged}
            />
          )}
        </div>
      </div>
    </div>
  );
}
