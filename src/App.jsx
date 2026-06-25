import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
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
        setProfileName('');
      }
    };

    getProfile();

    // מאזין לשינויי התחברות/התנתקות ומעדכן את השם בהתאם בלייב
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfileName(data.full_name);
          });
      } else {
        setProfileName('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('שגיאה בהתנתקות: ' + error.message);
    } else {
      alert('התנתקת בהצלחה!');
      window.location.href = '/login';
    }
  };

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
          <Link to="/" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>לוח בקרה</Link>
          <Link to="/add-item" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>הוספת פריט</Link>
          <Link to="/login" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>התחברות</Link>
          <Link to="/register" style={{ color: '#4CAF50', fontWeight: 'bold', textDecoration: 'none' }}>הרשמה</Link>
          
          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* הצגת השם המלא ב-Navbar (Step 19) */}
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
          </div>
        </nav>

        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-item" element={<AddItemPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;