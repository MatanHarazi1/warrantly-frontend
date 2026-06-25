import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

export default function ProfilePage({ onProfileUpdate }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      // 1. שליפת פרטי המשתמש הנוכחי מה-Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email);

        // 2. שליפת השם המלא מטבלת פרופילים
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFullName(profile.full_name || '');
        }

        // 3. שליפת כמות הפריטים הכוללת של המשתמש לצורך סטטיסטיקה
        const { count } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true });
        
        setTotalItems(count || 0);
      }
      setLoading(false);
    };

    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();

    // עדכון השם המלא בטבלת profiles
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    setUpdating(false);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'עדכון נכשל',
        text: error.message
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'הפרופיל עודכן בהצלחה!',
        showConfirmButton: false,
        timer: 1500
      });
      // מפעיל מחדש את פונקציית שליפת השם בקובץ האב (App.jsx) כדי שה-Navbar יתעדכן בלייב
      if (onProfileUpdate) onProfileUpdate();
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>טוען פרופיל...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '30px auto', padding: '25px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', direction: 'rtl', textAlign: 'right' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>הפרופיל האישי שלי</h2>
      
      {/* כרטיס סטטיסטיקה קטן */}
      <div style={{ background: '#f0f4f8', padding: '15px', borderRadius: '6px', marginBottom: '25px', border: '1px solid #dcdcdc' }}>
        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#555' }}>כתובת אימייל: <strong>{email}</strong></p>
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>סך הכל תעודות אחריות שמורות: <strong style={{ color: '#4CAF50', fontSize: '16px' }}>{totalItems}</strong></p>
      </div>

      <form onSubmit={handleUpdateProfile}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>שם מלא:</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
            placeholder="הכנס את שמך המלא"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {updating ? 'מעדכן פרופיל...' : 'שמור שינויים'}
        </button>
      </form>
    </div>
  );
}