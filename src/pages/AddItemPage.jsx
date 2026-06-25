import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AddItemPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [warrantyExpiration, setWarrantyExpiration] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. שליפת המשתמש המחובר כרגע כדי לקבל את ה-id שלו
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
       Swal.fire({
  icon: 'warning',
  title: 'שדות חובה',
  text: 'אנא מלא את כל שדות החובה.',
  confirmButtonText: 'הבנתי',
  confirmButtonColor: '#10b981'
});;
        navigate('/login');
        return;
      }

      // 2. הכנסת הנתונים לטבלת items ב-Supabase
      const { error } = await supabase.from('items').insert([
        {
          name: name,
          company: company,
          warranty_expiration: warrantyExpiration,
          user_id: user.id // מקשר את הפריט למשתמש הנוכחי
        }
      ]);

      if (error) {
        throw error;
      }

      Swal.fire({
  icon: 'success',
  title: 'המוצר נוסף בהצלחה!',
  showConfirmButton: false,
  timer: 1500
});
      navigate('/'); // מחזיר את המשתמש ללוח הבקרה
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'שגיאה בשמירה',
  text: 'לא הצלחנו להוסיף את המכשיר לבסיס הנתונים.',
  confirmButtonText: 'אישור',
  confirmButtonColor: '#10b981'
});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>הוספת תעודת אחריות חדשה</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>שם המוצר:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="למשל: מכונת כביסה"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>חברה / חנות:</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="למשל: סמסונג"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>תאריך פקיעת אחריות:</label>
          <input
            type="date"
            value={warrantyExpiration}
            onChange={(e) => setWarrantyExpiration(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'שומר פריט...' : 'שמור פריט'}
        </button>
      </form>
    </div>
  );
}