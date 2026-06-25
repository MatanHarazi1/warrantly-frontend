import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();

  // בדיקה אם המשתמש כבר מחובר, ואם כן - העברה לעמוד הבית
 useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
  Swal.fire({
    icon: 'error',
    title: 'פרטי התחברות שגויים',
    text: 'האימייל או הסיסמה שהזנת אינם נכונים, אנא נסה שוב.',
    confirmButtonText: 'אישור',
    confirmButtonColor: '#10b981'
  });
} else {
  Swal.fire({
    icon: 'success',
    title: 'התחברת בהצלחה!',
    showConfirmButton: false,
    timer: 1500 // החלונית תיסגר לבד אחרי שנייה וחצי
  }).then(() => {
    navigate('/');
  });

    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>התחברות למערכת</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>אימייל:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>סיסמה:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#008CBA', color: 'white', border: 'none', cursor: 'pointer' }}>
          {loading ? 'מתחבר...' : 'התחבר'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        אין לך חשבון עדיין? <Link to="/register">הירשם כאן</Link>
      </p>
    </div>
  );
}

export default LoginPage;