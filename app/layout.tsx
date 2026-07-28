import type { Metadata } from "next";
import { Noto_Sans_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "@xterm/xterm/css/xterm.css";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pivot UI ",
  description: "Pi Coding Agent Web Interface",
  icons: {
    icon: "/pi-agent-mark.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no" className={`${notoSansMono.variable} notranslate`} suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=window.__REACT_DEVTOOLS_GLOBAL_HOOK__;if(h&&typeof h.onCommitFiberRoot!=="function")h.onCommitFiberRoot=function(){};var t=localStorage.getItem("pi-theme");if(t==="dark"||t==="eye")document.documentElement.classList.add(t)}catch(e){}})();`,
          }}
        />
      </head>
      <body translate="no" className="notranslate" style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
