import Experience from '@/components/nava/experience';

const chapters = [
  { tag: '01 / INTELLIGENCE, WITHIN REACH', title: <>Your thoughts.<br />Within reach.</>, description: <>Be in the moment.<br />Let NAVA keep the thought.</>, detail: 'THE WEARABLE AI NOTE TAKER', note: 'Worn on your wrist. Ready when you are.' },
  { tag: '02 / DESIGNED TO LET GO', title: <>A little freedom.<br />A natural connection.</>, description: <>A considered magnetic fit.<br />An effortless change of pace.</>, detail: 'DETACH. DISCOVER. RECONNECT.', note: 'The device lifts away. The cradle stays.' },
  { tag: '03 / HARDWARE, CONSIDERED', title: <>Every detail.<br />Considered.</>, description: <>A thought captured.<br />A connection made effortless.</>, detail: 'EXPLORE THE DETAILS', note: 'Made to move. Designed to stay with you.' },
  { tag: '04 / MAGNETIC BY NATURE', title: <>Everything<br />falls into place.</>, description: <>A quiet connection.<br />Designed to feel second nature.</>, detail: 'A PRECISE MAGNETIC CONNECTION', note: 'Align. Connect. Carry on.' },
  { tag: '05 / ALWAYS WITH YOU', title: <>Keep the moment.<br />Carry the thought.</>, description: <>Your AI note taker.<br />Wherever the day takes you.</>, detail: 'NAVA. A LITTLE CLOSER.', note: 'On your wrist. Around your neck. With you.' },
];
export default function Home() {
  return <Experience>{chapters.map((chapter, i) => <section className={`chapter chapter-${i}`} key={chapter.tag} aria-label={chapter.tag}>
    <div className="chapter-heading">{i === 0 ? <h1>{chapter.title}</h1> : <h2>{chapter.title}</h2>}</div>
    <div className="chapter-description"><p>{chapter.description}</p></div>
  </section>)}</Experience>;
}
