import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AddItemPage from './pages/AddItemPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div>
        {/* תפריט ניווט זמני לצורכי בדיקה והגשה */}
        <nav style={{ 
          background: 'var(--surface-white)', 
          padding: '15px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '20px'
        }}>
          <Link to="/" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>לוח בקרה</Link>
          <Link to="/add-item" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>+ הוספת קבלה</Link>
          <Link to="/item/1" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>פרטי פריט (דוגמה)</Link>
        </nav>

        {/* הגדרת הראוטינג של המערכת */}
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-item" element={<AddItemPage />} />
            <Route path="/item/:id" element={<ItemDetailsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;