'use client';

import { Link } from "@/i18n/routing";


interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-neutral-300 dark:text-neutral-600">/</span>
            )}
            {item.href ? (
              <Link
                href={item.href as any}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-[250px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}