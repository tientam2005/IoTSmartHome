import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, X, Package, Check, AlertTriangle } from 'lucide-react';

export default function Assets() {
  const { assets, rooms, addAsset, deleteAsset, updateAsset, showConfirm } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [condition, setCondition] = useState('good');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!name || !roomId) return;
    
    showConfirm({
      title: 'Bàn giao tài sản',
      message: `Xác nhận thêm ${name} vào phòng ${getRoomNumber(roomId)}?`,
      onConfirm: () => {
        addAsset({ name, roomId, condition });
        setName(''); setRoomId(''); setCondition('good');
        setShowForm(false);
      }
    });
  };

  const getRoomNumber = (id) => rooms.find(r => r.id === id)?.number || '---';

  if (showForm) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setShowForm(false)}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Bàn bàn giao tài sản mới</span>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '40px', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Tên tài sản / Thiết bị</label>
              <input 
                required 
                placeholder="VD: Điều hòa Panasonic 1HP, Giường gỗ..." 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '1rem' }} 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Gán cho phòng</label>
                <select 
                  required 
                  value={roomId} 
                  onChange={e => setRoomId(e.target.value)} 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Tình trạng</label>
                <select 
                  value={condition} 
                  onChange={e => setCondition(e.target.value)} 
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '0.9rem' }}
                >
                  <option value="good">Mới / Tốt</option>
                  <option value="damaged">Hơi cũ / Cần lưu ý</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', maxWidth: '300px', height: '52px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: '800', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}
              >
                Xác nhận bàn giao
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Tài sản & Thiết bị</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px' }}>
          <Plus size={18}/> Bàn giao mới
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rooms.map(room => {
          const roomAssets = assets.filter(a => a.roomId === room.id);
          if (roomAssets.length === 0) return null;
          
          return (
            <div key={room.id} style={{ background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Danh mục Phòng {room.number}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {roomAssets.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       <div style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px' }}><Package size={16} color="var(--text-muted)" /></div>
                       <span style={{ fontWeight: '500' }}>{a.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ 
                         fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', fontWeight: 'bold',
                         background: a.condition === 'good' ? '#ecfdf5' : '#fff7ed',
                         color: a.condition === 'good' ? '#059669' : '#ea580c',
                         display: 'flex', alignItems: 'center', gap: '4px'
                       }}>
                         {a.condition === 'good' ? <Check size={12}/> : <AlertTriangle size={12}/>}
                         {a.condition === 'good' ? 'Tốt' : 'Xuống cấp'}
                       </span>
                       <button onClick={() => { 
                         showConfirm({
                           title: 'Gỡ bỏ tài sản',
                           message: `Bạn có chắc muốn xóa ${a.name} khỏi phòng?`,
                           onConfirm: () => deleteAsset(a.id)
                         });
                       }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                         <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {assets.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '40px 0' }}>Chưa có danh mục tài sản nào được thiết lập.</p>}
      </div>
    </div>
  );
}
