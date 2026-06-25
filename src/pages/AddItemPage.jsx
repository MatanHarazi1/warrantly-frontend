import Swal from 'sweetalert2';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { createWorker } from 'tesseract.js'; // ייבוא מנוע ה-OCR

export default function AddItemPage() {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [warrantyExpiration, setWarrantyExpiration] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  
  // States חדשים לניהול קבצים וסריקה
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // ישמור הצעות למילוי אוטומטי מהקבלה

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. פונקציית סריקת OCR חכמה מהקבלה
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setScanning(true);
    setScanResult(null);

    try {
      // יצירת עובד לסריקה (תומך בעברית ואנגלית משולב)
      const worker = await createWorker('heb+eng');
      const { data: { text } } = await worker.recognize(selectedFile);
      await worker.terminate();

      console.log("טקסט שנסרק מהקבלה:", text);

      // לוגיקה בסיסית לחילוץ נתונים חכם מהטקסט שנסרק
      const suggestions = {};
      
      // חיפוש מותגים/חברות נפוצות בתוך הטקסט
      const brands = ['סמסונג', 'SAMSUNG', 'אפל', 'APPLE', 'שופרסל', 'אייבורי', 'IVORY', 'KSP', 'אלקטרה', 'תדיראן', 'LG', 'סוני', 'SONY'];
      const foundBrand = brands.find(brand => text.toUpperCase().includes(brand.toUpperCase()));
      if (foundBrand) suggestions.company = foundBrand;

      // ניסיון לחלץ סכום כספי (מחפש מספרים שקרובים למילים כמו "סה"כ", "סך הכל", "לתשלום")
      const priceRegex = /(?:סה"כ|סך\s+הכל|לתשלום|TOTAL)[^\d]*(\d+(?:\.\d{1,2})?)/i;
      const priceMatch = text.match(priceRegex);
      if (priceMatch && priceMatch[1]) {
        suggestions.price = priceMatch[1];
      }

      // אם מצאנו הצעות כלשהן, נשמור אותן בסטייט
      if (Object.keys(suggestions).length > 0) {
        setScanResult(suggestions);
        Swal.fire({
          icon: 'info',
          title: 'הקבלה נסרקה בהצלחה!',
          text: 'מצאנו נתונים שיכולים למלא לך את הטופס אוטומטית.',
          confirmButtonText: 'מעולה',
          confirmButtonColor: '#10b981'
        });
      }

    } catch (err) {
      console.error("שגיאה בסריקת ה-OCR:", err);
    } finally {
      setScanning(false);
    }
  };

  // פונקציה שמיישמת את ההצעות שנסרקו לתוך שדות הטופס
  const applyScanSuggestions = () => {
    if (!scanResult) return;
    if (scanResult.company) setCompany(scanResult.company);
    if (scanResult.price) setPrice(scanResult.price);
    setScanResult(null); // ניקוי הצעות לאחר יישום
  };

  // 2. פונקציית העלאת הקובץ הפיזי ל-Supabase Storage לתוך ה-Bucket
  const uploadReceiptFile = async (userId) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`; // יצירת נתיב ייחודי לכל משתמש
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('warranty-files') // ודא שפתחת Bucket בשם הזה והגדרת אותו כ-Public
      .upload(filePath, file);

    if (error) throw error;

    // שליפת הכתובת הציבורית של הקובץ שהועלה
    const { data: { publicUrl } } = supabase.storage
      .from('warranty-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // שליפת המשתמש המחובר כרגע
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

      // העלאת הקובץ במידה וקיים וקבלת הכתובת שלו
      let uploadedFileUrl = null;
      if (file) {
        uploadedFileUrl = await uploadReceiptFile(user.id);
      }

      // הכנסת הנתונים המלאים לטבלה (כולל הקישור לקובץ)
      const { error } = await supabase.from('items').insert([
        {
          name: name,
          company: company,
          warranty_expiration: warrantyExpiration,
          user_id: user.id,
          category: category || null,
          price: price ? parseFloat(price) : null,
          serial_number: serialNumber || null,
          file_url: uploadedFileUrl // שומר את הלינק לקבלה בטבלה (ודא שיש עמודה כזו בטבלה)
        }
      ]);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'המוצר נוסף בהצלחה!',
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בשמירה',
        text: error.message || 'לא הצלחנו להוסיף את המכשיר לבסיס הנתונים.',
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
        
        {/* העלאת תמונה / קבלה מלווה ב-OCR חכם */}
        <div style={{ marginBottom: '20px', padding: '15px', border: '2px dashed #4CAF50', borderRadius: '6px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2e7d32' }}>העלאת צילום קבלה / תעודה (סורק חכם):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'block', margin: '10px auto' }}
          />
          {scanning && <p style={{ color: '#ff9800', margin: '5px 0', fontSize: '13px', fontWeight: 'bold' }}>⚡ המנוע החכם סורק ומחלץ נתונים מהקבלה, אנא המתן...</p>}
          
          {scanResult && (
            <button
              type="button"
              onClick={applyScanSuggestions}
              style={{ marginTop: '10px', padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              🪄 מילוי אוטומטי מהסריקה ({scanResult.company || ''} {scanResult.price ? `${scanResult.price} ₪` : ''})
            </button>
          )}
        </div>

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
          disabled={loading || scanning}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (loading || scanning) ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'שומר פריט ומעלה קובץ...' : 'שמור פריט'}
        </button>
      </form>
    </div>
  );
}