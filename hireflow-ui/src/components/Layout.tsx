import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#f8fafc',
          }}
        >
          <div style={{ padding: '28px', maxWidth: 1400 }}>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
