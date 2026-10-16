import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Page crashed:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="max-w-md mx-auto mt-16 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xl font-extrabold">Something went wrong</h2>
        <p className="text-sm text-slate-600">This page couldn't be displayed. Please try again.</p>
        <a href="/dashboard" className="inline-block px-5 py-2.5 rounded-lg bg-blue-600 text-white">
          Reload dashboard
        </a>
      </div>
    );
  }
}