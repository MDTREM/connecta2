import { useFirebaseMock } from '../context/FirebaseMockContext';

export default function DeviceFrame({ children, onSwitchView, onOpenAuth }) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {children}
    </div>
  );
}
