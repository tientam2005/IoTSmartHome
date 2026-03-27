import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, X, BellDot } from 'lucide-react';

export default function Announcements() {
  const { announcements, rooms, addAnnouncement, deleteAnnouncement, showConfirm } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRoom, setTargetRoom] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;
    addAnnouncement({
      title,
      content,
      roomId: targetRoom, 
      date: new Date().toLocaleDateString('vi-VN')
    });
    setTitle(''); setContent(''); setTargetRoom('all');
    setShowForm(false);
  };

  const sortedAnnouncements = [...announcements].reverse();

  const getTargetName = (rId) => {
    if (rId === 'all') return 'Tất cả các phòng';
    const r = rooms.find(room => room.id === rId);
    return r ? `Phòng ${r.number}` : 'Phòng trống';
  };

  if (showForm) {
    return (
      <div className="form-container" style={{ padding: '24px 20px', background: 'var(--surface)', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Tạo thông báo mới</h3>
          <button onClick={() => setShowForm(false)} style={{ ...iconBtnStyle, position: 'absolute', right: 0, top: 0 }}><X size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="label-premium">Đối tượng nhận tin</label>
            <select value={targetRoom} onChange={e => setTargetRoom(e.target.value)} className="input-premium">
              <option value="all">Tất cả các phòng</option>
              {rooms.filter(r => r.status === 'rented').map(r => (
                <option key={r.id} value={r.id}>Phòng {r.number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-premium">Tiêu đề</label>
            <input required placeholder="Nhập tiêu đề thông báo..." value={title} onChange={e => setTitle(e.target.value)} className="input-premium" />
          </div>
          <div>
            <label className="label-premium">Nội dung chi tiết</label>
            <textarea required placeholder="Nhập nội dung cần gửi..." value={content} onChange={e => setContent(e.target.value)} className="input-premium" style={{ minHeight: '150px', resize: 'none' }}/>
          </div>
          
          <div style={{ marginTop: '12px' }}>
            <button type="submit" className="btn-primary" style={{ padding: '18px' }}>Gửi thông báo</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Thông báo</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px' }}>
          <Plus size={18}/> Thông báo mới
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedAnnouncements.map(ann => (
          <div key={ann.id} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BellDot size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Đối tượng: {getTargetName(ann.roomId)}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ann.date}</span>
            </div>
            <h4 style={{ fontSize: '1rem', marginBottom: '4px', color: 'var(--text-main)', lineHeight: '1.4' }}>{ann.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{ann.content}</p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
               <button onClick={() => { 
                  showConfirm({
                    title: 'Xóa thông báo',
                    message: `Gỡ bỏ thông báo "${ann.title}"?`,
                    onConfirm: () => deleteAnnouncement(ann.id)
                  });
                }} style={{ ...iconBtnStyle, color: 'var(--danger)', background: '#fee2e2', borderRadius: '8px', padding: '6px' }}>
                  <Trash2 size={16}/> Gỡ / Thu hồi tin báo
               </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Chưa có thông báo nào được lưu.</p>}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' };
const btnStyle = { background: 'var(--primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', cursor: 'pointer' };
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };
