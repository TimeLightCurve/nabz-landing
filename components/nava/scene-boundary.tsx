'use client';
import { Component, type ReactNode } from 'react';
export default class SceneBoundary extends Component<{ children: ReactNode; onRetry: () => void; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() {
    if (this.state.failed) return <div className="scene-message" role="status">
      <span className="eyebrow">NAVA / PRODUCT EXPERIENCE</span><p>The 3D experience couldn’t load.</p>
      <button className="text-button" onClick={() => { this.props.onRetry(); this.setState({ failed: false }); }}>Try again <span>↗</span></button>
    </div>;
    return this.props.children;
  }
}
