import Swal from 'sweetalert2';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [profileName, setProfileName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsAuthenticated(true);
        // שליפת השם המלא מטבלת profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setProfileName(data.full_name);
        }
      } else {
        setIsAuthenticated(false);
        setProfileName('');
      }
      setLoading(false);
    };

    getProfile();

    // מאזין לשינויי התחברות/התנתקות ומעדכן את המצב בלייב
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfileName(data.full_name);
          });
      } else {
        setIsAuthenticated(false);
        setProfileName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'אופס...',
        text: 'שגיאה בהתנתקות מהמערכת',
        confirmButtonText: 'אישור',
        confirmButtonColor: '#10b981'
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'התנתקת בהצלחה',
        text: 'להתראות!',
        showConfirmButton: false,
        timer: 1500
      });
      // ניקוי המצב המקומי ומעבר מסודר ללא רענון אלים
      setProfileName('');
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', fontWeight: 'bold' }}>
        טוען מערכת...
      </div>
    );
  }

  return (
    <Router>
      <div>
        <nav style={{
          background: '#ffffff',
          padding: '15px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* לינקים שמופיעים רק אם המשתמש מחובר */}
          {isAuthenticated ? (
            <>
              <Link to="/" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>לוח בקרה</Link>
              <Link to="/add-item" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>הוספת פריט</Link>
            </>
          ) : (
            <>
              {/* לינקים שמופיעים רק אם המשתמש מנותק */}
              <Link to="/login" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>התחברות</Link>
              <Link to="/register" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>הרשמה</Link>
            </>
          )}
          
          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* הצגת השם והכפתור רק אם מחוברים */}
            {isAuthenticated && (
              <>
                {profileName && <span style={{ fontWeight: 'bold', color: '#555' }}>שלום, {profileName}</span>}
                <button 
                  onClick={handleLogout}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  התנתק
                </button>
              </>
            )}
          </div>
        </nav>

        <main style={{ padding: '20px' }}>
          <Routes>
            {/* הגנה על הראוטים: אם לא מחובר, זורק אוטומטית ל-Login */}
            <Route path="/" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/add-item" element={isAuthenticated ? <AddItemPage /> : <Navigate to="/login" />} />
            <Route path="/item/:id" element={isAuthenticated ? <ItemDetailsPage /> : <Navigate to="/login" />} />
            
            {/* אם מחובר ומנסה ללכת ללוגין/הרשמה, זורק אותו לדאשבורד */}
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;