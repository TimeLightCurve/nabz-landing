'use client';
import { useLocale } from '@/components/nava/locale';
﻿import Experience from '@/components/nava/experience';

export default function Home() {
  const { t } = useLocale();
  const chapters = [
  { tag: '01 / INTELLIGENCE, WITHIN REACH', title: <>{t('Your thoughts.')}<br />{t('Within reach.')}</>, description: <>{t('Be in the moment.')}<br />{t('Let NAVA keep the thought.')}</>, detail: 'THE WEARABLE AI NOTE TAKER', note: 'Worn on your wrist. Ready when you are.' },
  { tag: '02 / DESIGNED TO LET GO', title: <>{t('A little freedom.')}<br />{t('A natural connection.')}</>, description: <>{t('A considered magnetic fit.')}<br />{t('An effortless change of pace.')}</>, detail: 'DETACH. DISCOVER. RECONNECT.', note: 'The device lifts away. The cradle stays.' },
  { tag: '03 / HARDWARE, CONSIDERED', title: <>{t('Every detail.')}<br />{t('Considered.')}</>, description: <>{t('A thought captured.')}<br />{t('A connection made effortless.')}</>, detail: 'EXPLORE THE DETAILS', note: 'Made to move. Designed to stay with you.' },
  { tag: '04 / MAGNETIC BY NATURE', title: <>{t('Everything')}<br />{t('falls into place.')}</>, description: <>{t('A quiet connection.')}<br />{t('Designed to feel second nature.')}</>, detail: 'A PRECISE MAGNETIC CONNECTION', note: 'Align. Connect. Carry on.' },
  { tag: '05 / ALWAYS WITH YOU', title: <>{t('Keep the moment.')}<br />{t('Carry the thought.')}</>, description: <>{t('Your AI note taker.')}<br />{t('Wherever the day takes you.')}</>, detail: 'NAVA. A LITTLE CLOSER.', note: 'On your wrist. Around your neck. With you.' },
];
  return <Experience>{chapters.map((chapter, i) => <section className={`chapter chapter-${i}`} key={chapter.tag} aria-label={t(["Home", "Connection", "Craft", "Necklace", "Everyday"][i])}>
    <div className="chapter-heading">{i === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}</div>
    <div className="chapter-description"><p>{chapter.description}</p></div>
  </section>)}</Experience>;
}
