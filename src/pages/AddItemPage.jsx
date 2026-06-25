import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AddItemPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [warrantyExpiration, setWarrantyExpiration] = useState('');
  // ה-States החדשים שנוספו:
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

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
        });
        navigate('/login');
        return;
      }

      // 2. הכנסת הנתונים לטבלת items ב-Supabase (כולל השדות החדשים)
      const { error } = await supabase.from('items').insert([
        {
          name: name,
          company: company,
          warranty_expiration: warrantyExpiration,
          user_id: user.id, // מקשר את הפריט למשתמש הנוכחי
          category: category || null,
          price: price ? parseFloat(price) : null,
          serial_number: serialNumber || null
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
    <div style={{ maxWidth: '500px', margin: '30px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', direction: 'rtl' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>הוספת תעודת אחריות חדשה</h2>
      <form onSubmit={handleSubmit}>
        
        {/* שם המוצר */}
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>שם המוצר:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="למשל: מכונת כביסה"
          />
        </div>

        {/* חברה / חנות */}
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>חברה / חנות:</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="למשל: סמסונג"
          />
        </div>

        {/* קטגוריה */}
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>קטגוריה:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">בחר קטגוריה (אופציונלי)</option>
            <option value="מוצרי חשמל">מוצרי חשמל</option>
            <option value="אלקטרוניקה ומחשבים">אלקטרוניקה ומחשבים</option>
            <option value="סמארטפונים">סמארטפונים</option>
            <option value="ריהוט">ריהוט</option>
            <option value="רכב">רכב</option>
            <option value="אחר">אחר</option>
          </select>
        </div>

        {/* מחיר רכישה */}
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מחיר רכישה (בש"ח):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="any"
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="למשל: 2500"
          />
        </div>

        {/* מספר סידורי / דגם */}
        <div style={{ marginBottom: '15px', textAlign: 'right' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>מספר סידורי / דגם:</label>
          <input
            type="text"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="למשל: S/N: 12345678"
          />
        </div>

        {/* תאריך פקיעה */}
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>תאריך פקיעת אחריות:</label>
          <input
            type="date"
            value={warrantyExpiration}
            onChange={(e) => setWarrantyExpiration(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* כפתור שמירה */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'שומר פריט...' : 'שמור פריט'}
        </button>
      </form>
    </div>
  );
}