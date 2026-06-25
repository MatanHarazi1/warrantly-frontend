import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ItemDetailsPage() {
  const { id: itemId } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // שליפת פרטי המוצר והמשימות המשויכות אליו (Read - Step 18)
  const fetchItemAndTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // 1. שליפת פרטי המוצר הספציפי מטבלת items
    const { data: itemData } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemData) {
      setItem(itemData);
      
      // 2. שליפת המשימות של המוצר הזה מטבלת tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (tasksData) setTasks(tasksData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItemAndTasks();
  }, [itemId]);

  // הוספת משימה חדשה למוצר (Create - Step 18)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('tasks')
      .insert([
        { 
          user_id: user.id, 
          item_id: itemId, 
          title: newTaskTitle 
        }
      ]);

    if (!error) {
      setNewTaskTitle('');
      fetchItemAndTasks(); // רענון מהיר על המסך
    } else {
      alert('שגיאה בהוספת משימה: ' + error.message);
    }
  };

  // עדכון סטטוס משימה בוצע/לא בוצע (Update - Step 18)
  const handleToggleTask = async (taskId, currentStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', taskId);

    if (!error) {
      fetchItemAndTasks();
    }
  };

  // מחיקת משימה מהרשימה (Delete - Step 18)
  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm('האם למחוק משימה זו?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      fetchItemAndTasks();
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>טוען נתונים...</div>;
  if (!item) return <div style={{ padding: '20px' }}>המוצר לא נמצא.</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          marginBottom: '20px', 
          padding: '6px 12px', 
          cursor: 'pointer', 
          backgroundColor: '#e0e0e0', 
          border: 'none', 
          borderRadius: '4px',
          fontWeight: 'bold'
        }}
      >
        ➔ חזרה ללוח הבקרה
      </button>
      
      {/* תצוגת פרטי הפריט */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9', marginBottom: '30px' }}>
        <h2>{item.name}</h2>
        <p><strong>חברה מיוצרת:</strong> {item.company}</p>
        <p><strong>תאריך הוספה:</strong> {new Date(item.created_at).toLocaleDateString('he-IL')}</p>
      </div>

      {/* --- ניהול משימות וטיפולים (Step 18 - CRUD) --- */}
      <h3>משימות וטיפולים למכשיר זה:</h3>
      
      <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="לדוגמה: להחליף פילטר, לחדש אחריות, לפנות למעבדה..."
          required
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>הוסף</button>
      </form>

      {tasks.length === 0 ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>אין עדיין משימות פתוחות למכשיר זה.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map((task) => (
            <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee', backgroundColor: task.is_completed ? '#e8f5e9' : 'transparent', borderRadius: '4px', marginBottom: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  checked={task.is_completed} 
                  onChange={() => handleToggleTask(task.id, task.is_completed)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ textDecoration: task.is_completed ? 'line-through' : 'none', color: task.is_completed ? '#888' : '#333' }}>
                  {task.title}
                </span>
              </div>
              <button onClick={() => handleDeleteTask(task.id)} style={{ backgroundColor: 'transparent', color: '#f44336', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>מחק</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}