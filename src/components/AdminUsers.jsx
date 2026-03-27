import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Edit2, Trash2, X, ShieldAlert, Users, Lock, Unlock } from 'lucide-react';

export default function AdminUsers() {
  const { users, packages, addUser, updateUser, deleteUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('landlord');
  const [status, setStatus] = useState('active');
  const [packageId, setPackageId] = useState('');

  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { name, phone, role, status, packageId };
    if (editingUser) updateUser(editingUser.id, data);
    else addUser(data);
    resetForm();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setName(user.name); setPhone(user.phone); setRole(user.role); setStatus(user.status); setPackageId(user.packageId || '');
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setName(''); setPhone(''); setRole('landlord'); setStatus('active'); setPackageId('');
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={resetForm}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{editingUser ? 'Sửa Đối tác' : 'Thêm Đối tác Mới'}</span>
          </div>
          <button onClick={handleSubmit} className="btn-primary" style={{ width: 'auto', height: '38px', padding: '0 16px', borderRadius: '10px' }}>Lưu thông tin</button>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '100px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Họ và tên</label>
                <input required placeholder="VD: Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} style={inputStyle}/>
             </div>
             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Số điện thoại liên hệ</label>
                <input required type="tel" placeholder="090..." value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle}/>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ textAlign: 'left' }}>
                   <label style={labelStyle}>Trạng thái</label>
                   <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                     <option value="active">Hoạt động</option>
                     <option value="inactive">Đã khoá</option>
                   </select>
                </div>
                <div style={{ textAlign: 'left' }}>
                   <label style={labelStyle}>Gói dịch vụ</label>
                   <select value={packageId} onChange={e => setPackageId(e.target.value)} style={inputStyle}>
                     <option value="">Vãng lai</option>
                     {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
             </div>

             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Phân quyền hệ thống</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={inputStyle}>
                  <option value="landlord">Chủ khu trọ (Landlord)</option>
                  <option value="manager">Quản lý thuê / Nhân viên</option>
                </select>
             </div>
          </div>
          
          <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
             <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <strong>Lưu ý:</strong> Tài khoản mới sẽ sử dụng mật khẩu mặc định là số điện thoại đã đăng ký. Đối tác có thể đổi mật khẩu sau khi đăng nhập lần đầu.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Đối tác Hệ thống</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: 'auto', height: '42px', padding: '0 16px', borderRadius: '12px' }}>
           <Plus size={18}/> <span style={{fontWeight: '700'}}>Đối tác mới</span>
        </button>
      </div>
      
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          placeholder="Tìm tên chủ trọ, SĐT..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ ...inputStyle, paddingLeft: '48px', borderRadius: '16px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} 
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredUsers.map(u => {
          const pkg = packages.find(p => p.id === u.packageId);
          const isLandlord = u.role === 'landlord';
          return (
            <div key={u.id} className="card-premium" style={{ padding: '20px', background: 'white', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: u.status === 'active' ? '#f0fdf4' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.status === 'active' ? '#22c55e' : '#ef4444' }}>
                     {isLandlord ? <Users size={24}/> : <ShieldAlert size={24}/>}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>{u.name}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.phone} • <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{pkg ? pkg.name : 'Vãng lai'}</span></p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.7rem', fontWeight: '800', color: u.status === 'active' ? '#22c55e' : '#ef4444', background: u.status === 'active' ? '#dcfce7' : '#fecaca', padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                      {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                   </div>
                </div>
              </div>
              
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Quyền: <strong style={{color: 'var(--text-main)'}}>{u.role === 'landlord' ? 'Chủ khu trọ' : 'Quản trị viên'}</strong>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => updateUser(u.id, { status: u.status === 'active' ? 'inactive' : 'active' })} 
                      style={{ ...iconBtnStyle, background: u.status === 'active' ? '#fffbeb' : '#ecfdf5', color: u.status === 'active' ? '#d97706' : '#059669', title: u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa' }}
                    >
                      {u.status === 'active' ? <Lock size={16}/> : <Unlock size={16}/>}
                    </button>
                    <button onClick={() => handleEdit(u)} style={{ ...iconBtnStyle, background: '#f8fafc', color: 'var(--primary)' }} title="Sửa"><Edit2 size={16}/></button>
                    <button onClick={() => deleteUser(u.id)} style={{ ...iconBtnStyle, background: '#fff1f2', color: '#e11d48' }} title="Xóa"><Trash2 size={16}/></button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', background: 'white' };
const labelStyle = { fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' };
const btnStyle = { background: 'var(--primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', cursor: 'pointer' };
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };
