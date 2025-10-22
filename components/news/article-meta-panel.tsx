export interface ArticleMetaPanelProps {
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  words: number;
  locale: string;
  postedAtText: string;
}

export function ArticleMetaPanel({ 
  publishedAt, 
  updatedAt, 
  readingMinutes, 
  words, 
  locale 
}: ArticleMetaPanelProps) {
  const labels = {
    about: { uz: "Maqola haqida", ru: "О статье" },
    published: { uz: "Nashr qilingan", ru: "Опубликовано" },
    updated: { uz: "Yangilangan", ru: "Обновлено" },
    minutes: { uz: "daqiqa", ru: "минут" },
  };

  const getText = (key: keyof typeof labels) => 
    labels[key][locale as 'uz' | 'ru'] || labels[key].uz;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-5 border border-neutral-200 dark:border-neutral-700">
      <h3 className="text-sm uppercase font-semibold tracking-wide mb-4 text-neutral-800 dark:text-neutral-200">
        {getText('about')}
      </h3>
      <div className="space-y-3 text-sm">
        {publishedAt && (
          <div className="flex items-start gap-2">
            <span className="i-lucide-calendar size-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
            <div>
              <div className="font-medium text-neutral-700 dark:text-neutral-300">
                {getText('published')}
              </div>
              <div className="text-neutral-500 dark:text-neutral-400" suppressHydrationWarning>
                {publishedAt}
              </div>
            </div>
          </div>
        )}
        
        {updatedAt && (
          <div className="flex items-start gap-2">
            <span className="i-lucide-refresh-cw size-4 text-neutral-500 dark:text-neutral-400 mt-0.5" />
            <div>
              <div className="font-medium text-neutral-700 dark:text-neutral-300">
                {getText('updated')}
              </div>
              <div className="text-neutral-500 dark:text-neutral-400" suppressHydrationWarning>
                {updatedAt}
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}