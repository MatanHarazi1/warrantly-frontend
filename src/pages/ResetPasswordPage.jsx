import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      Swal.fire({ icon: 'error', title: 'שגיאה', text: 'הסיסמה חייבת להכיל לפחות 6 תווים.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setLoading(false);
    if (error) {
      Swal.fire({ icon: 'error', title: 'אופס...', text: error.message });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'הסיסמה עודכנה בהצלחה!',
        text: 'כעת תוכל להתחבר עם הסיסמה החדשה.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/login');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>עדכון סיסמה חדשה</h2>
      <form onSubmit={handleResetPassword}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>סיסמה חדשה:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'מעדכן...' : 'שמור סיסמה חדשה'}
        </button>
      </form>
    </div>
  );
}