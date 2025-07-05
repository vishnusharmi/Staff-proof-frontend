import React from "react";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./components/ṛoutes/AllRoutes";
import { UserProvider } from "./components/context/UseContext";
import { NotificationProvider } from "./components/NotificationSystem";

function App() {
  // Debug function to clear localStorage
  const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <UserProvider>
      <NotificationProvider>
        <BrowserRouter>
        {/* Debug button - remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={clearAuth}
            style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              zIndex: 9999,
              padding: '5px 10px',
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Auth (Debug)
          </button>
        )}
        
        {/* Test message to verify React is loading */}
        <div style={{
          position: 'fixed',
          top: '50px',
          right: '10px',
          zIndex: 9999,
          padding: '5px 10px',
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          React App Loaded ✅
        </div>
        
        <AllRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
