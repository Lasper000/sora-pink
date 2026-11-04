import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Reset URL to home if stuck on broken route
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFF0F5 0%, #F0F9FF 100%)',
            padding: '1.5rem',
            fontFamily: "'Prompt', 'Plus Jakarta Sans', sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '2rem 1.75rem',
              textAlign: 'center',
              boxShadow: '0 20px 45px rgba(255, 141, 168, 0.25)',
              border: '1.5px solid rgba(255, 209, 220, 0.8)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFE4E8 0%, #FFD1DC 100%)',
                color: '#E11D48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 8px 20px rgba(225, 29, 72, 0.2)',
              }}
            >
              <AlertTriangle size={32} />
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1F2937',
                marginBottom: '0.5rem',
              }}
            >
              {this.props.fallbackTitle || 'ขออภัย เกิดข้อผิดพลาดในการแสดงผล'}
            </h2>

            <p
              style={{
                fontSize: '0.88rem',
                color: '#6B7280',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              ระบบกำลังปกป้องความปลอดภัยของข้อมูลคุณ กรุณากดปุ่มด้านล่างเพื่อกลับสู่หน้าหลักหรือโหลดหน้าใหม่อีกครั้ง
            </p>

            {this.state.error && (
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#94A3B8',
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  overflowX: 'auto',
                  border: '1px solid #E2E8F0',
                  maxHeight: '100px',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #FF6B8B 0%, #E11D48 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(225, 29, 72, 0.3)',
                }}
              >
                <Home size={16} /> กลับหน้าหลัก
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '9999px',
                  background: '#FFFFFF',
                  color: '#4B5563',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  border: '1.5px solid #E5E7EB',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={15} /> รีเฟรช
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
