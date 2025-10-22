'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Facebook, Twitter, Send, Link as LinkIcon, Check } from "lucide-react";

interface ArticleShareBarProps {
  title: string;
  url: string;
  description?: string;
  locale: string;
}

export function ArticleShareBar({ title, url, description, locale }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareText = {
    copy: { uz: "Nusxa olindi!", ru: "Скопировано!" },
    share: { uz: "Ulashing", ru: "Поделиться" },
    facebook: { uz: "Facebook", ru: "Facebook" },
    twitter: { uz: "X (Twitter)", ru: "X (Twitter)" },
    telegram: { uz: "Telegram", ru: "Telegram" },
    copyLink: { uz: "Havolani nusxalash", ru: "Копировать ссылку" }
  };

  const getText = (key: keyof typeof shareText) => 
    shareText[key][locale as 'uz' | 'ru'] || shareText[key].uz;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success(getText('copy'));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-5 border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-sm uppercase font-semibold tracking-wide mb-3 text-neutral-800 dark:text-neutral-200">
        {getText('share')}
      </h3>
      <div className="flex flex-wrap gap-2">
        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          aria-label={getText('facebook')}
        >
          <Facebook className="size-5" />
        </a>

        {/* Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-900 text-white transition-colors"
          aria-label={getText('twitter')}
        >
          <Twitter className="size-5" />
        </a>

        {/* Telegram */}
        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-400 hover:bg-blue-500 text-white transition-colors"
          aria-label={getText('telegram')}
        >
          <Send className="size-5" />
        </a>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            copied ? 'bg-green-500' : 'bg-amber-500 hover:bg-amber-600'
          } text-white transition-colors`}
          aria-label={getText('copyLink')}
        >
          {copied ? <Check className="size-5" /> : <LinkIcon className="size-5" />}
        </button>
      </div>
    </div>
  );
}
