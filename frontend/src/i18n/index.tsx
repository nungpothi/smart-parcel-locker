import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  SUPPORTED_LANGUAGES,
  translations,
  type Language,
} from './translations'

type TranslateParams = Record<string, string | number>

type I18nContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: TranslateParams) => string
  languages: Language[]
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)
const STORAGE_KEY = 'smart-parcel-locker:language'

const getNestedValue = (
  tree: Record<string, any> | undefined,
  path: string,
): string | undefined => {
  if (!tree) return undefined
  return path.split('.').reduce<any>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return acc[part]
    }
    return undefined
  }, tree)
}

const formatTemplate = (template: string, params?: TranslateParams) => {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : '',
  )
}

const translate = (language: Language, key: string, params?: TranslateParams) => {
  const value =
    getNestedValue(translations[language], key) ??
    getNestedValue(translations[FALLBACK_LANGUAGE], key)
  if (typeof value === 'string') {
    return formatTemplate(value, params)
  }
  return key
}

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      setLanguageState(stored as Language)
    }
  }, [])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback(
    (key: string, params?: TranslateParams) => translate(language, key, params),
    [language],
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
    }),
    [language, setLanguage, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useTranslation = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
