import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // סטייט לניהול ה-Modal המעוצב שלנו
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // ישמור את ה-id והשם של הפריט שבחרנו למחוק

  const fetchDashboardData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setUser(user);

    const { data: itemsData, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && itemsData) {
      setItems(itemsData);
    } else if (error) {
      console.error('Error fetching items:', error.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  // שלב 1: פתיחת חלון האישור הפנימי
  const openDeleteModal = (itemId, itemName) => {
    setItemToDelete({ id: itemId, name: itemName });
    setShowModal(true);
  };

  // שלב 2: ביצוע המחיקה האמיתית מול Supabase לאחר אישור בתוך ה-Modal
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      // סגירת ה-Modal ואיפוס
      setShowModal(false);
      setItemToDelete(null);
      
      // רענון הרשימה על המסך
      fetchDashboardData();
    } catch (error) {
      alert('שגיאה במחיקת הפריט: ' + error.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>טוען את לוח הבקרה...</div>;
  }

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      <h1>Warrantly - לוח בקרה</h1>
      <p>שלום, <strong>{user?.email}</strong>! שמחים שחזרת.</p>
      
      <h3 style={{ marginTop: '30px' }}>תעודות האחריות שלך:</h3>

      {items.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>עדיין לא הוספת תעודות אחריות במערכת.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', marginTop: '15px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{item.name}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>חברה:</strong> {item.company}</p>
                
                {/* שים לב: כאן משתמשים ב-item.created_at או שדה תוקף קיים כדי שלא יקרוס, שנה ל-expiration_date אם יש לך */}
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#e53935', marginBottom: '15px' }}>
                  <strong>נוצר ב:</strong> {new Date(item.created_at).toLocaleDateString('he-IL')}
                </p>
              </div>

              {/* שני הכפתורים יחד - בדיוק לפי הדרישות החדשות */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button
                  onClick={() => navigate(`/item/${item.id}`)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  פרטים ומשימות
                </button>
                
                <button
                  onClick={() => openDeleteModal(item.id, item.name)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  מחק
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- חלונית אישור מחיקה מעוצבת (Modal) --- */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // רקע חצי שקוף שמחשיך את האתר מאחורה
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>אישור מחיקה</h3>
            <p style={{ marginBottom: '25px', color: '#666' }}>
              האם אתה בטוח שברצונך למחוק את <strong>{itemToDelete?.name}</strong>? פעולה זו בלתי הפיכה.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                כן, מחק
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}