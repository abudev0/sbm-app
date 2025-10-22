'use client';

import { Link } from "@/i18n/routing";


interface TagsRowProps {
  tags: string[];
  size?: 'sm' | 'md';
}

export function TagsRow({ tags, size = 'md' }: TagsRowProps) {
  const sizeClasses = {
    sm: "text-xs py-1 px-2",
    md: "text-sm py-1.5 px-3"
  };

  if (!tags.length) return null;
  
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <Link
          key={index}
          href={`/tags/${tag}` as any}
          className={`${sizeClasses[size]} bg-amber-50 hover:bg-amber-100 text-amber-800 
            rounded-md font-medium transition-colors dark:bg-amber-900/30 
            dark:hover:bg-amber-900/50 dark:text-amber-400`}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}