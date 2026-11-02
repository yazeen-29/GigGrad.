import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.error("GigGrad render error", error);
  }
  render() {
    if (this.state.failed)
      return (
        <div role="alert" className="max-w-lg mx-auto px-5 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Something interrupted this page.
          </h1>
          <p className="text-sm text-slate-500 my-4">
            Reload GigGrad to get back to your workspace.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-700 text-white rounded-xl px-5 py-3 text-sm font-bold"
          >
            Reload app
          </button>
        </div>
      );
    return this.props.children;
  }
}
