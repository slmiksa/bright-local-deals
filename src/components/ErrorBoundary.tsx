import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen flex items-center justify-center bg-background p-6"
        >
          <div className="text-center space-y-4 max-w-sm">
            <div className="text-5xl">⚠️</div>
            <h1 className="text-xl font-bold text-foreground">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-sm text-muted-foreground">
              قد يكون السبب مشكلة في الاتصال بالإنترنت أو خطأ مؤقت
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold active:scale-95 transition-transform"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-bold active:scale-95 transition-transform"
              >
                تحديث الصفحة
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
