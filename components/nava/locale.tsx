'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { persian } from '@/lib/nava/persian';
type Language = 'en' | 'fa';
const LocaleContext = createContext({ locale: 'en' as Language, toggle: () => {}, t: (text: string) => text, number: (n: number) => String(n).padStart(2, '0') });
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Language>('en');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nava-language');
      // Restore only after hydration so server/client markup is identical.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'fa') setLocale('fa');
    } catch { /* Storage can be disabled; switching still works. */ }
  }, []);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr'; }, [locale]);
  const toggle = () => { const next = locale === 'en' ? 'fa' : 'en'; setLocale(next); try { localStorage.setItem('nava-language', next); } catch {} };
  const t = (text: string) => locale === 'fa' ? (persian[text] ?? text) : text;
  const number = (n: number) => { const value = String(n).padStart(2, '0'); return locale === 'fa' ? value.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]) : value; };
  return <LocaleContext.Provider value={{ locale, toggle, t, number }}>{children}</LocaleContext.Provider>;
}
export const useLocale = () => useContext(LocaleContext);
