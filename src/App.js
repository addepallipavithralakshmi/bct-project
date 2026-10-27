import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import './global.css';

// Lazy-load pages for better performance
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const ExploreEvents   = lazy(() => import('./pages/ExploreEvents'));
const BookTicket      = lazy(() => import('./pages/BookTicket'));
const MyTickets       = lazy(() => import('./pages/MyTickets'));
const VerifyTicket    = lazy(() => import('./pages/VerifyTicket'));
const ManageEvents    = lazy(() => import('./pages/ManageEvents'));
const ManageVenues    = lazy(() => import('./pages/ManageVenues'));
const ResaleMarketplace = lazy(() => import('./pages/ResaleMarketplace'));
const Settings        = lazy(() => import('./pages/Settings'));

// Loading fallback shown while a page is loading
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    flexDirection: 'column',
    gap: '12px',
    color: 'var(--color-text-secondary)',
    fontFamily: 'var(--font-primary)',
  }}>
    <div style={{
      width: 36,
      height: 36,
      border: '3px solid var(--color-border)',
      borderTopColor: 'var(--color-primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ fontSize: 'var(--font-size-sm)' }}>Loading…</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Error boundary for catching render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          maxWidth: 600,
          margin: '40px auto',
          background: 'var(--color-error-light)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-error)',
          fontFamily: 'var(--font-primary)',
        }}>
          <h2 style={{ color: 'var(--color-error)', marginTop: 0 }}>⚠️ Page Error</h2>
          <p style={{ color: 'var(--color-text)' }}>
            This page encountered an error. This may be caused by a missing wallet connection
            or an unavailable RPC endpoint.
          </p>
          <details style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <summary>Technical details</summary>
            <pre style={{ overflow: 'auto', marginTop: 8 }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: 'var(--color-error)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          {/* All main app routes use the AppLayout shell */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="events" element={
              <Suspense fallback={<PageLoader />}>
                <ExploreEvents />
              </Suspense>
            } />
            <Route path="book/:eventId" element={
              <Suspense fallback={<PageLoader />}>
                <BookTicket />
              </Suspense>
            } />
            <Route path="my-tickets" element={
              <Suspense fallback={<PageLoader />}>
                <MyTickets />
              </Suspense>
            } />
            <Route path="verify" element={
              <Suspense fallback={<PageLoader />}>
                <VerifyTicket />
              </Suspense>
            } />
            <Route path="manage-events" element={
              <Suspense fallback={<PageLoader />}>
                <ManageEvents />
              </Suspense>
            } />
            <Route path="manage-venues" element={
              <Suspense fallback={<PageLoader />}>
                <ManageVenues />
              </Suspense>
            } />
            <Route path="resale" element={
              <Suspense fallback={<PageLoader />}>
                <ResaleMarketplace />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            } />

            {/* Legacy route redirects — preserve old page URLs */}
            <Route path="dv"           element={<Navigate to="/manage-venues" replace />} />
            <Route path="ev"           element={<Navigate to="/manage-events" replace />} />
            <Route path="qrcode"       element={<Navigate to="/my-tickets" replace />} />
            <Route path="qr"           element={<Navigate to="/verify" replace />} />
            <Route path="resell"       element={<Navigate to="/resale" replace />} />
            <Route path="user-login"   element={<Navigate to="/" replace />} />
            <Route path="user-reg"     element={<Navigate to="/" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
