import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({ isAuthenticated }) {
  const navigate = useNavigate();

  return (
    <div style={{ 
      direction: 'rtl', 
      textAlign: 'center', 
      maxWidth: '800px', 
      margin: '60px auto', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* כותרת ראשית ותת כותרת */}
      <h1 style={{ fontSize: '3.5rem', color: '#4CAF50', marginBottom: '10px' }}>Warrantly</h1>
      <h3 style={{ fontSize: '1.5rem', color: '#555', fontWeight: 'normal', marginBottom: '40px' }}>
        המקום הבטוח והחכם לניהול תעודות האחריות והקבלות שלך
      </h3>

      {/* הסבר קצר על הפיצ'רים */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px', 
        marginBottom: '50px' 
      }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📸</div>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>סורק קבלות חכם (OCR)</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>מעלים צילום של הקבלה והמערכת שולפת וממלאה את פרטי המוצר אוטומטית.</p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>גרפים וסטטיסטיקות</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>פילוח קטגוריות חכם ומעקב שוטף אחרי השווי הכולל של המוצרים המבוטחים שלך.</p>
        </div>

        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏰</div>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>התראות ומשימות</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>מעקב אחרי ימי תוקף האחריות שנותרו וניהול משימות וטיפולים לכל מכשיר.</p>
        </div>
      </div>

      {/* כפתורי הנעה לפעולה */}
      <div>
        {isAuthenticated ? (
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ 
              padding: '14px 40px', 
              fontSize: '1.2rem', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '25px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(76, 175, 80, 0.3)'
            }}
          >
            להמשך אל לוח הבקרה שלך ➔
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{ padding: '12px 30px', fontSize: '1.1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              התחבר למערכת
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{ padding: '12px 30px', fontSize: '1.1rem', backgroundColor: 'transparent', color: '#4CAF50', border: '2px solid #4CAF50', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              הרשמה בחינם
            </button>
          </div>
        )}
      </div>
    </div>
  );
}