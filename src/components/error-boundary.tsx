import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("[Tesla Port Finder] Uncaught error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="dark flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center text-foreground">
        <AlertTriangle className="size-12 text-destructive" />
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">問題が発生しました</h1>
          <p className="text-sm text-muted-foreground">
            ページの再読み込みをお試しください。問題が続く場合はしばらく時間をおいてから再度お試しください。
          </p>
        </div>
        <pre className="max-w-xl overflow-auto rounded-md border border-border bg-card p-3 text-left text-xs text-muted-foreground">
          {this.state.error.message}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
        >
          <RefreshCw className="size-4" />
          再読み込み
        </button>
      </div>
    );
  }
}
