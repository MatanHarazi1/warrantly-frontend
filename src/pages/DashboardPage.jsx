import Swal from 'sweetalert2';
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
  const [itemToDelete, setItemToDelete] = useState(null);

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

  // חישוב סטטיסטיקות לדאשבורד (שווי כולל וכמות)
  const totalValue = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // שלב 1: פתיחת חלון האישור הפנימי
  const openDeleteModal = (itemId, itemName) => {
    setItemToDelete({ id: itemId, name: itemName });
    setShowModal(true);
  };

  // שלב 2: ביצוע המחיקה האמיתית מול Supabase
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      setShowModal(false);
      setItemToDelete(null);
      fetchDashboardData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה במחיקה',
        text: 'לא הצלחנו למחוק את הפריט, אנא נסה שוב.',
        confirmButtonText: 'אישור',
        confirmButtonColor: '#10b981'
      });
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl' }}>טוען את לוח הבקרה...</div>;
  }

  return (
    <div style={{ padding: '20px', direction: 'rtl', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Warrantly - לוח בקרה</h1>
      <p>שלום, <strong>{user?.email}</strong>! שמחים שחזרת.</p>

      {/* --- ווידג'ט כרטיסיות סיכום וסטטיסטיקה (ה"בשר" החדש) --- */}
      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '200px', padding: '15px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', textAlign: 'right' }}>
          <h5 style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>סך שווי מוצרים מבוטחים</h5>
          <h2 style={{ margin: '10px 0 0 0', color: '#1b5e20' }}>{totalValue.toLocaleString('he-IL')} ₪</h2>
        </div>
        <div style={{ flex: '1', minWidth: '200px', padding: '15px', background: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '8px', textAlign: 'right' }}>
          <h5 style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>תעודות אחריות פעילות</h5>
          <h2 style={{ margin: '10px 0 0 0', color: '#0d47a1' }}>{items.length} מוצרים</h2>
        </div>
      </div>
      
      <h3 style={{ marginTop: '30px', textAlign: 'right' }}>תעודות האחריות שלך:</h3>

      {items.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'right' }}>עדיין לא הוספת תעודות אחריות במערכת.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: '15px' }}>
          {items.map((item) => (
            <div key={item.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{item.name}</h4>
                  {item.category && (
                    <span style={{ fontSize: '11px', background: '#e0e0e0', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', color: '#555' }}>
                      {item.category}
                    </span>
                  )}
                </div>
                
                <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>חברה:</strong> {item.company}</p>
                
                {item.price && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>מחיר רכישה:</strong> {Number(item.price).toLocaleString('he-IL')} ₪</p>
                )}
                
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#e53935', marginBottom: '15px' }}>
                  <strong>תוקף אחריות:</strong> {item.warranty_expiration ? new Date(item.warranty_expiration).toLocaleDateString('he-IL') : 'לא הוגדר'}
                </p>
              </div>

              {/* שני הכפתורים התחתונים */}
              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                <button
                  onClick={() => navigate(`/item/${item.id}`)}
                  style={{
                    flex: 1,
                    padding: '8px',
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
                    padding: '8px 12px',
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            textAlign: 'center',
            direction: 'rtl'
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