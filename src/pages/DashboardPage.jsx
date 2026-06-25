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

  // 1. חישוב סטטיסטיקות פיננסיות
  const totalValue = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // פונקציית עזר לחישוב צבע כרטיסייה על פי ימי תוקף האחריות (פיצ'ר 1)
  const getWarrantyStatus = (expirationDate) => {
    if (!expirationDate) return { border: '#ddd', bg: '#f9f9f9', text: 'לא הוגדר תוקף', badgeBg: '#eee', badgeText: '#555' };
    
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      // פג תוקף או פג ב-30 ימים הקרובים - אדום
      return {
        border: '#ffcdd2',
        bg: '#ffebee',
        text: diffDays < 0 ? 'האחריות פגה!' : `מסתיימת בעוד ${diffDays} ימים`,
        badgeBg: '#d32f2f',
        badgeText: '#fff'
      };
    } else if (diffDays <= 180) {
      // מסתיימת בחצי שנה הקרובה - צהוב
      return {
        border: '#fff9c4',
        bg: '#fffde7',
        text: `מסתיימת בעוד ${Math.round(diffDays / 30)} חודשים`,
        badgeBg: '#fbc02d',
        badgeText: '#333'
      };
    } else {
      // טווח ארוך - ירוק
      return {
        border: '#c8e6c9',
        bg: '#e8f5e9',
        text: 'בתוקף לטווח ארוך',
        badgeBg: '#388e3c',
        badgeText: '#fff'
      };
    }
  };

  // 2. חישוב והכנת נתונים לגרף העוגה (פיצ'ר 2)
  const getCategoryData = () => {
    const counts = {};
    items.forEach(item => {
      const cat = item.category || 'ללא קטגוריה';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const colors = ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#e91e63', '#00bcd4', '#795548'];
    return Object.keys(counts).map((cat, index) => ({
      name: cat,
      count: counts[cat],
      percentage: Math.round((counts[cat] / items.length) * 100),
      color: colors[index % colors.length]
    }));
  };

  const categoryData = items.length > 0 ? getCategoryData() : [];

  // בניית מחרוזת הציור לגרף העוגה מבוסס ה-CSS
  let accumulatedPercentage = 0;
  const gradientParts = categoryData.map(cat => {
    const start = accumulatedPercentage;
    accumulatedPercentage += cat.percentage;
    return `${cat.color} ${start}% ${accumulatedPercentage}%`;
  });
  const pieChartStyle = {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: `conic-gradient(${gradientParts.join(', ')})`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  };

  const openDeleteModal = (itemId, itemName) => {
    setItemToDelete({ id: itemId, name: itemName });
    setShowModal(true);
  };

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
      <p>שלום, <strong>{user?.user_metadata?.full_name || user?.email}</strong>! שמחים שחזרת.</p>

      {/* אזור הסטטיסטיקות והגרף */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
        
        {/* כרטיסיות סיכום */}
        <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ padding: '15px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', textAlign: 'right' }}>
            <h5 style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>סך שווי מוצרים מבוטחים</h5>
            <h2 style={{ margin: '10px 0 0 0', color: '#1b5e20' }}>{totalValue.toLocaleString('he-IL')} ₪</h2>
          </div>
          <div style={{ padding: '15px', background: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '8px', textAlign: 'right' }}>
            <h5 style={{ margin: 0, color: '#1565c0', fontSize: '14px' }}>תעודות אחריות פעילות</h5>
            <h2 style={{ margin: '10px 0 0 0', color: '#0d47a1' }}>{items.length} מוצרים</h2>
          </div>
        </div>

        {/* גרף עוגה של התפלגות קטגוריות - מותנה בזה שיש מוצרים (פיצ'ר 2) */}
        {items.length > 0 && (
          <div style={{ flex: '1.5', minWidth: '320px', padding: '15px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>פילוח לפי קטגוריות</h4>
              {/* מקרא קטגוריות */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryData.map(cat => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: cat.color, display: 'inline-block' }}></span>
                    <span><strong>{cat.name}</strong>: {cat.count} יח' ({cat.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
            {/* עיגול הגרף */}
            <div style={{ margin: '0 auto' }}>
              <div style={pieChartStyle}></div>
            </div>
          </div>
        )}
      </div>
      
      <h3 style={{ marginTop: '30px', textAlign: 'right' }}>תעודות האחריות שלך:</h3>

      {items.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'right' }}>עדיין לא הוספת תעודות אחריות במערכת.</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: '15px' }}>
          {items.map((item) => {
            const status = getWarrantyStatus(item.warranty_expiration);
            return (
              <div key={item.id} style={{ padding: '15px', border: `2px solid ${status.border}`, borderRadius: '8px', backgroundColor: status.bg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', transition: 'all 0.2s ease' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{item.name}</h4>
                    {item.category && (
                      <span style={{ fontSize: '11px', background: '#e0e0e0', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', color: '#555', whiteSpace: 'nowrap' }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  
                  <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>חברה:</strong> {item.company}</p>
                  
                  {item.price && (
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>מחיר רכישה:</strong> {Number(item.price).toLocaleString('he-IL')} ₪</p>
                  )}
                  
                  {/* סטטוס אחריות דינמי בצבעים (פיצ'ר 1) */}
                  <div style={{ marginTop: '10px', marginBottom: '15px', padding: '6px', borderRadius: '4px', background: status.badgeBg, color: status.badgeText, display: 'inline-block', fontSize: '12px', fontWeight: 'bold' }}>
                    {status.text} {item.warranty_expiration && `(${new Date(item.warranty_expiration).toLocaleDateString('he-IL')})`}
                  </div>
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
            );
          })}
        </div>
      )}

      {/* --- חלונית אישור מחיקה מעוצבת (Modal) --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center', direction: 'rtl' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>אישור מחיקה</h3>
            <p style={{ marginBottom: '25px', color: '#666' }}>
              האם אתה בטוח שברצונך למחוק את <strong>{itemToDelete?.name}</strong>? פעולה זו בלתי הפיכה.
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={handleConfirmDelete} style={{ padding: '8px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>כן, מחק</button>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 20px', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}