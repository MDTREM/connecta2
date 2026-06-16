import { useFirebaseMock } from '../context/FirebaseMockContext';

export default function DeviceFrame({ children, onSwitchView, onOpenAuth }) {
  const { currentUser, logout, orders, chats } = useFirebaseMock();

  return (
    <div className="simulator-wrapper" style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '20px',
      backgroundColor: 'transparent',
      position: 'relative'
    }}>
      {/* Main Interactive Smartphone Container */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Phone Frame */}
        <div
          className="device-frame"
          style={{}}
        >
          {/* Top Notch/Speaker & Battery Bar Simulation */}
          <div style={{
            height: '34px',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 28px',
            position: 'relative',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#2d2d2d',
            zIndex: 110,
            borderBottom: '1px solid #f9f9f9',
            userSelect: 'none'
          }}>
            <span>18:25</span>
            {/* Speaker bar */}
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '18px',
              backgroundColor: '#000000',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '40px', height: '3px', backgroundColor: '#333', borderRadius: '99px' }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span>5G</span>
              <div style={{
                width: '20px',
                height: '10px',
                border: '1px solid #2d2d2d',
                borderRadius: '3px',
                padding: '1px',
                display: 'flex'
              }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#2d2d2d', borderRadius: '1px' }} />
              </div>
            </div>
          </div>

          {/* Children app contents */}
          <div className="device-content">
            {children}
          </div>

          {/* iOS Bottom Navigation Bar Simulation */}
          <div style={{
            height: '18px',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 109,
            paddingBottom: '4px'
          }}>
            <div style={{ width: '120px', height: '4px', backgroundColor: '#999', borderRadius: '99px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
