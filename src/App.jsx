import Swal from 'sweetalert2';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage'; // ייבוא עמוד הנחיתה

function App() {
  const [profileName, setProfileName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setIsAuthenticated(true);
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

  useEffect(() => {
    getProfile();

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
      <div style={{ direction: 'rtl' }}>
        <nav style={{
          background: '#ffffff',
          padding: '15px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* הלינקים ב-Navbar */}
          <Link to="/" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>דף הבית</Link>
          
          {isAuthenticated ? (
            <>
              {/* סעיף 3: הלינק מוביל כעת ל-dashboard/ ולא ל-/ */}
              <Link to="/dashboard" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>לוח בקרה</Link>
              <Link to="/add-item" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>הוספת פריט</Link>
              <Link to="/profile" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>הפרופיל שלי</Link>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>התחברות</Link>
              <Link to="/register" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>הרשמה</Link>
            </>
          )}
          
          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
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
          {/* סעיף 4: הגדרת הראוטים המעודכנת */}
          <Routes>
            <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} />} />
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/add-item" element={isAuthenticated ? <AddItemPage /> : <Navigate to="/login" />} />
            <Route path="/item/:id" element={isAuthenticated ? <ItemDetailsPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage onProfileUpdate={getProfile} /> : <Navigate to="/login" />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;