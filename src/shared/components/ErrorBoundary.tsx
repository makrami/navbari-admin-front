import { Component } from "react";
import type { ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] grid place-items-center text-center p-8">
          <div>
            <h1 className="text-2xl font-semibold mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-600">Please refresh the page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
