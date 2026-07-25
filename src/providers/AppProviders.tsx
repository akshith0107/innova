import React, { Component, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { ToastContainer } from "../components/ui/Toast";
import { useUIStore } from "../stores/ui.store";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button";

// React Query Client Singleton
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 mins
      refetchOnWindowFocus: false,
      retry: 2
    }
  }
});

// Class-based Error Boundary with elegant fallback UI
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[PRAMAAN ErrorBoundary]", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-32 bg-surface border border-status-danger/30 text-primary flex flex-col items-center text-center my-4 glass-card">
          <div className="w-12 h-12 rounded-2xl bg-status-danger/20 text-status-danger flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-primary">Something went wrong</h3>
          <p className="text-xs text-primary-muted mt-1 mb-4 max-w-xs">
            {this.state.error?.message || "An unexpected error occurred inside PRAMAAN engine."}
          </p>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reset Application
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global Toast Host Provider Wrapper
const GlobalToastHost: React.FC = () => {
  const { toasts, dismissToast } = useUIStore();
  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
};

export interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig transition={{ type: "spring", stiffness: 400, damping: 30 }}>
          {children}
          <GlobalToastHost />
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
