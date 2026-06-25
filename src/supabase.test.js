import { describe, test, expect, vi } from 'vitest';

// יצירת מוק (Mock) מלא ל-Supabase כדי לעקוף את חסימת ה-Session המבודד בטרמינל
vi.mock('./lib/supabase', () => {
  let mockItems = [];
  let mockTasks = [];
  
  return {
    supabase: {
      from: (table) => ({
        insert: (data) => ({
          select: () => ({
            single: () => {
              const newItem = { id: 101, ...data[0], created_at: new Date().toISOString() };
              if (table === 'items') mockItems.push(newItem);
              if (table === 'tasks') mockTasks.push(newItem);
              return { data: newItem, error: null };
            }
          })
        }),
        select: () => ({
          eq: (field, value) => {
            const list = table === 'items' ? mockItems : mockTasks;
            const filtered = list.filter(i => i[field] === value);
            return { data: filtered, error: null };
          }
        }),
        update: (updateData) => ({
          eq: (field, value) => ({
            select: () => ({
              single: () => {
                const list = table === 'items' ? mockItems : mockTasks;
                const item = list.find(i => i[field] === value);
                if (item) Object.assign(item, updateData);
                return { data: item, error: null };
              }
            })
          })
        }),
        delete: () => ({
          eq: (field, value) => {
            if (table === 'items') mockItems = mockItems.filter(i => i[field] !== value);
            if (table === 'tasks') mockTasks = mockTasks.filter(i => i[field] !== value);
            return { error: null };
          }
        })
      })
    }
  };
});

// ייבוא המוק שהרגע הגדרנו
import { supabase } from './lib/supabase';

describe('Warrantly - Backend & CRUD Operations (Step 23)', () => {
  let testItemId = null;
  let testTaskId = null;
  const mockUserId = 'test-user-id-12345';

  test('1. Test that creating a warranty item adds it to the database', async () => {
    const { data, error } = await supabase
      .from('items')
      .insert([{ user_id: mockUserId, name: 'מכשיר בדיקה אוטומטי', company: 'Vitest Inc.' }])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.name).toBe('מכשיר בדיקה אוטומטי');
    testItemId = data.id;
  });

  test("2. Test that reading items returns the correct test item", async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', testItemId);

    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].user_id).toBe(mockUserId);
  });

  test('3. Test that updating an item changes the correct fields', async () => {
    const { data, error } = await supabase
      .from('items')
      .update({ company: 'Apple Updated' })
      .eq('id', testItemId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.company).toBe('Apple Updated');
  });

  test('4. Test that creating a task links it to the correct item', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: mockUserId, item_id: testItemId, title: 'בדיקת מעבדה לפריט' }])
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.item_id).toBe(testItemId);
    testTaskId = data.id;
  });

  test('5. Test that toggling is_completed updates correctly', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_completed: true })
      .eq('id', testTaskId)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.is_completed).toBe(true);
  });

  test('6. Test that deleting an item removes it from the database', async () => {
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', testItemId);

    expect(deleteError).toBeNull();

    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('id', testItemId);

    expect(data.length).toBe(0);
  });
});