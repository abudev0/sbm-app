"use client";
import React from "react";

type Props = {
  locale: "uz" | "ru";
  title: string;
  pageUrl: string;
  description?: string;
};

export function FooterShareActions({ locale, title, pageUrl }: Props) {
  const tCopy = locale === "ru" ? "Скопировано!" : "Nusxalandi!";
  const tCopyLabel = locale === "ru" ? "Копировать ссылку" : "Havolani nusxalash";
  const [copied, setCopied] = React.useState(false);

  const shareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const tmp = document.createElement("textarea");
      tmp.value = pageUrl;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex space-x-2 mt-2">
      <button
        onClick={shareTelegram}
        className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400"
        aria-label="Share on Telegram"
        type="button"
      >
        {/* Telegram icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.62-.21-1.12-.32-1.08-.68.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 1.38-.57 3-.26 2.5 1.03z"/>
        </svg>
      </button>

      <button
        onClick={copyLink}
        className="p-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-400"
        aria-label={tCopyLabel}
        type="button"
      >
        {copied ? (
          <span className="text-xs font-semibold px-1">{tCopy}</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
