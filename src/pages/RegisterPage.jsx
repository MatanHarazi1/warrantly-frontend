import Swal from 'sweetalert2'; 
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // שדה חדש לשם המלא
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
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. יצירת המשתמש ב-Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        // 2. הכנסת השם המלא לטבלת profiles החדשה
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, full_name: fullName }]);

        if (profileError) throw profileError;
      }

      Swal.fire({
  icon: 'success',
  title: 'הרשמה בוצעה בהצלחה!',
text: 'כעת ניתן להתחבר למערכת עם הפרטים שלך',
  text: 'כעת ניתן להתחבר למערכת עם הפרטים שלך.',
  confirmButtonText: 'מעולה, לעמוד ההתחברות',
  confirmButtonColor: '#10b981'
}).then(() => {
  navigate('/login');
});
    } catch (error) {
  let errorMessage = error.message;

  // 1. בדיקה אם המשתמש כבר קיים במערכת
  if (error.message.includes('unique constraint') || error.message.includes('already exists')) {
    errorMessage = 'משתמש עם פרטים אלו כבר רשום במערכת.';
  } 
  // 2. בדיקה אם יש בעיה של מפתח זר (ההרשמה ל-Auth נכשלה קודם)
  else if (error.message.includes('violates foreign key constraint')) {
    errorMessage = 'ההרשמה נכשלה. אנא ודא שהסיסמה מכילה לפחות 6 תווים והאימייל תקין.';
  }

  Swal.fire({
    icon: 'error',
    title: 'אופס... שגיאה בהרשמה',
    text: errorMessage,
    confirmButtonText: 'נסה שוב',
    confirmButtonColor: '#10b981'
  });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>הרשמה למערכת</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>שם מלא:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="ישראל ישראלי"
          />
        </div>
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
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'רושם משתמש...' : 'הירשם'}
        </button>
      </form>
    </div>
  );
}