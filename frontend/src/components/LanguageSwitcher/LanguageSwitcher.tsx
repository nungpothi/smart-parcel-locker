import clsx from 'clsx'
import Button from '@/components/Button'
import { useTranslation } from '@/i18n'

type LanguageSwitcherProps = {
  variant?: 'public' | 'admin'
  className?: string
}

const LanguageSwitcher = ({
  variant = 'public',
  className,
}: LanguageSwitcherProps) => {
  const { language, setLanguage, languages, t } = useTranslation()

  const isPublic = variant === 'public'

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-pill border border-border/70 bg-surface shadow-panel',
        isPublic ? 'p-1 gap-2' : 'p-1 gap-1',
        className,
      )}
      aria-label={t('common.language.label')}
    >
      {languages.map((lang) => (
        <Button
          key={lang}
          type="button"
          size={isPublic ? 'md' : 'md'}
          variant={language === lang ? 'primary' : 'outline'}
          className={clsx(
            'min-w-[68px]',
            isPublic ? 'px-4 py-2 text-base' : 'px-3 py-2 text-sm',
          )}
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
        >
          {lang === 'th' ? t('common.language.th') : t('common.language.en')}
        </Button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
