const panels = [
  {
    title: 'Memory.', eyebrow: '06 / A LITTLE MORE PRESENT', heading: 'Be here.\nRemember later.',
    description: 'A private memory companion for the conversations that matter.',
    status: 'THE NAVA EXPERIENCE', link: 'https://nabzlab.com/app/nava', linkLabel: 'Explore the workspace',
    cards: [
      { label: 'RECALL', value: 'Find the moment', detail: 'Search phrases across your conversation history.' },
      { label: 'CONTEXT', value: 'Ask your memory', detail: 'Revisit decisions with answers linked to the original audio.' },
      { label: 'CLARITY', value: 'Keep the meaning', detail: 'Turn conversations into summaries and follow-up tasks.' },
      { label: 'TOGETHER', value: 'A shared workspace', detail: 'Bring team conversations, documents and tasks into one place.' },
    ],
  },
  {
    title: 'From voice.', eyebrow: '07 / EVERY WORD, CONSIDERED', heading: 'Capture.\nReview. Carry on.',
    description: 'From a conversation to something you can come back to.',
    status: 'IN DEVELOPMENT · APP PILOT', link: 'https://nabzlab.com/download', linkLabel: 'Discover the app pilot',
    cards: [
      { label: 'LANGUAGE · BUILDING', value: 'فارسی / English', detail: 'Persian, English and automatic language detection.' },
      { label: 'SPEAKERS · BUILDING', value: 'Three voices', detail: 'Review speaker segments and confirm names before saving.' },
      { label: 'REVIEW WORKFLOW', value: 'Back to the source', detail: 'Check timestamped audio. Correct the transcript before it becomes memory.' },
      { label: 'CONNECTION · PROTOTYPE', value: 'NAVA + your app', detail: 'A Bluetooth Low Energy connection is being prototyped for the wearable.' },
    ],
  },
  {
    title: 'Yours.', eyebrow: '08 / MEMORY WITH BOUNDARIES', heading: 'Your words.\nYour control.',
    description: 'Privacy is part of the experience, from capture to recall.',
    status: 'PILOT PRIVACY PRINCIPLES', link: 'https://nabzlab.com/privacy', linkLabel: 'Read the pilot privacy notice',
    cards: [
      { label: 'CAPTURE', value: 'A visible choice', detail: 'Recording begins with a visible user action and purpose-specific consent.' },
      { label: 'CONTROL', value: 'Keep a say', detail: 'Review, correct, export, revoke access or request deletion.' },
      { label: 'BOUNDARIES', value: 'Personal. Shared.', detail: 'Separate personal and team spaces with explicit permissions.' },
      { label: 'TRAINING', value: 'Private by default', detail: 'Raw voice is not used for model training by default.' },
    ],
  },
];

export default function ProductDetails({ chapter }: { chapter: number }) {
  if (chapter < 5) return null;
  if (chapter === 8) return <section className="product-details product-availability" aria-label="Explore NAVA">
    <div className="details-intro"><p className="details-eyebrow">09 / A LITTLE CLOSER</p><h2>Your next<br />thought starts here.</h2><p>Meet the app today.<br />Follow the wearable as it takes shape.</p></div>
    <div className="availability-panel" style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <p className="details-eyebrow">NAVA / BY NABZ</p><h3>Make room<br />for the moment.</h3>
      <p>The NAVA app is in pilot. The wearable is a concept in development and is not yet available to buy.</p>
      <div className="availability-actions"><a className="details-primary" href="https://nabzlab.com/app/nava">Open NAVA <span aria-hidden="true">↗</span></a><a href="https://nabzlab.com/download">Get the app <span aria-hidden="true">↗</span></a></div>
      <div className="availability-links"><a href="https://nabzlab.com/roadmap">Follow the roadmap ↗</a><a href="https://nabzlab.com/business/workspace">NAVA for your team ↗</a></div>
    </div>
  </section>;
  const panel = panels[chapter - 5];
  if (!panel) return null;
  return <section className="product-details" aria-label={panel.title} key={chapter}>
    <div className="details-intro"><p className="details-eyebrow">{panel.eyebrow}</p><h2>{panel.heading.split('\n').map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</h2><p>{panel.description}</p><span className="details-step">0{chapter + 1}<i />09</span></div>
    <div className="details-glass" style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
      <div className="details-panel-heading"><h3>{panel.title}</h3><span className="details-eyebrow">{panel.status}</span></div>
      <dl className="details-grid">{panel.cards.map(card => <div className="details-cell" key={card.label}><dt>{card.label}</dt><dd><strong>{card.value}</strong><p>{card.detail}</p></dd></div>)}</dl>
      <a className="details-source-link" href={panel.link}>{panel.linkLabel}<span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
