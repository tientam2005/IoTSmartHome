import React, { useState } from 'react';
import { useAppStore, PROVINCES } from '../store';
import { Plus, Search, Edit2, Trash2, X, Eye, MoreVertical, User } from 'lucide-react';

export default function Tenants() {
  const { tenants, rooms, addTenant, updateTenant, deleteTenant, showConfirm } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [viewingTenant, setViewingTenant] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [cccd, setCccd] = useState('');
  const [phone, setPhone] = useState('');
  const [hometown, setHometown] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('123456'); // Default password

  const filteredTenants = tenants.filter((t) => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return t.name.toLowerCase().includes(lowerTerm) || 
           t.phone.includes(lowerTerm) || 
           t.cccd.includes(lowerTerm) ||
           t.hometown.toLowerCase().includes(lowerTerm);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const tenantData = { name, cccd, phone, hometown, roomId, password };
    if (editingTenant) {
      showConfirm({
        title: 'Cập nhật khách thuê',
        message: `Lưu thay đổi cho khách ${name}?`,
        onConfirm: () => {
          updateTenant(editingTenant.id, tenantData);
          resetForm();
        }
      });
    } else {
      showConfirm({
        title: 'Thêm khách thuê',
        message: `Xác nhận tạo hồ sơ cho khách ${name}?`,
        onConfirm: () => {
          addTenant(tenantData);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setName(tenant.name);
    setCccd(tenant.cccd);
    setPhone(tenant.phone);
    setHometown(tenant.hometown);
    setRoomId(tenant.roomId);
    setShowForm(true);
    setViewingTenant(null);
  };

  const handleView = (tenant) => {
    setViewingTenant(tenant);
    setShowForm(false);
  };

  const resetForm = () => {
    setEditingTenant(null);
    setName(''); setCccd(''); setPhone(''); setHometown(''); setRoomId('');
    setShowForm(false);
    setViewingTenant(null);
  };

  const getRoomNumber = (rId) => rooms.find(r => r.id === rId)?.number || 'Trống';

  if (viewingTenant) {
    return (
      <div className="form-container" style={{ padding: '24px 16px', background: 'var(--surface)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Hồ sơ Khách Thuê</h3>
          <button onClick={resetForm} style={iconBtnStyle}><X size={24}/></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Họ và tên:</span>
            <span style={{...detailValueStyle, color: 'var(--primary)', fontWeight: 'bold'}}>{viewingTenant.name}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>CCCD:</span>
            <span style={detailValueStyle}>{viewingTenant.cccd}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>SĐT Liên hệ:</span>
            <span style={detailValueStyle}>{viewingTenant.phone}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Quê quán:</span>
            <span style={detailValueStyle}>{viewingTenant.hometown}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Đang ở phòng:</span>
            <span style={{...detailValueStyle, fontWeight: 'bold', fontSize: '1.1rem'}}>Phòng {getRoomNumber(viewingTenant.roomId)}</span>
          </div>
          {viewingTenant.roomId && (
            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>Diện tích:</span>
              <span style={detailValueStyle}>{rooms.find(r => r.id === viewingTenant.roomId)?.area} m²</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button onClick={resetForm} style={{...btnStyle, flex: 1, padding: '16px', borderRadius: '16px', justifyContent: 'center', background: '#f1f5f9', color: 'var(--text-main)'}}>Đóng hồ sơ</button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={resetForm}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{editingTenant ? 'Cập nhật hồ sơ' : 'Thêm khách thuê'}</span>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Họ và tên</label>
              <input required placeholder="VD: Nguyễn Văn A" value={name} onChange={e => setName(e.target.value)} style={inputStyle}/>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>CCCD / CMND</label>
                <input required placeholder="Nhập 12 số" value={cccd} onChange={e => setCccd(e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Số điện thoại</label>
                <input required type="tel" placeholder="Nhập SĐT" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle}/>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Quê quán thường trú</label>
              <select required value={hometown} onChange={e=>setHometown(e.target.value)} style={inputStyle}>
                <option value="">-- Chọn Tỉnh / Thành phố --</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Phòng xếp vào</label>
              <select value={roomId} onChange={e => setRoomId(e.target.value)} style={inputStyle}>
                <option value="">-- Để trống nếu chưa nhận phòng --</option>
                {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
              </select>
            </div>

            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid var(--border)' }}>
               <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: 'var(--primary)', fontWeight: '800' }}>Thông tin tài khoản</h4>
               <label style={{...labelStyle, color: 'var(--text-muted)' }}>Mật khẩu đăng nhập mặc định</label>
               <input disabled value={password} style={{...inputStyle, background: '#f1f5f9', color: '#94a3b8', border: 'none'}} />
               <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mật khẩu này sẽ được dùng để khách truy cập Cổng khách thuê.</p>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
               <button 
                 onClick={handleSubmit} 
                 className="btn-primary" 
                 style={{ width: '100%', maxWidth: '300px', height: '52px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: '800', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}
               >
                 {editingTenant ? 'Lưu cập nhật' : 'Xác nhận Thêm mới'}
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setActiveMenuId(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Khách thuê</h2>
        <button onClick={() => setShowForm(true)} style={btnStyle}><Plus size={16}/> Thêm mới</button>
      </div>
      
      <div style={{ position: 'relative', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
        <input 
          placeholder="Tìm theo tên, SĐT, quê quán..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '44px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTenants.map(tenant => (
          <div key={tenant.id} style={{ background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'visible', border: '1px solid var(--border)' }}>
            {/* Header of Tenant Card */}
            <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>{tenant.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      SĐT: {tenant.phone}
                    </div>
                  </div>
               </div>
               
               {/* More Menu Trigger */}
               <div style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === tenant.id ? null : tenant.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenuId === tenant.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{ position: 'absolute', right: 0, top: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border)', zIndex: 50, minWidth: '150px', overflow: 'hidden', animation: 'modalSlideUp 0.15s ease' }}
                    >
                       <button onClick={() => { handleEdit(tenant); setActiveMenuId(null); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left' }}>
                          <Edit2 size={16} /> Chỉnh sửa hồ sơ
                       </button>
                       <button 
                         onClick={() => { 
                           setActiveMenuId(null);
                           showConfirm({
                             title: 'Xóa khách thuê',
                             message: `Xóa thông tin của ${tenant.name} khỏi hệ thống?`,
                             onConfirm: () => deleteTenant(tenant.id)
                           });
                         }} 
                         style={{ width: '100%', padding: '12px 16px', border: 'none', background: '#fee2e2', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left' }}
                       >
                          <Trash2 size={16} /> Xóa khách
                       </button>
                    </div>
                  )}
               </div>
            </div>

            <div style={{ padding: '8px 16px 16px' }}>
               <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', display: 'inline-block' }}>
                  Chỗ ở: <strong style={{color: 'var(--primary)'}}>Phòng {getRoomNumber(tenant.roomId)}</strong>
               </div>
            </div>
            
            <button 
              onClick={() => handleView(tenant)} 
              style={{ width: '100%', padding: '12px', border: 'none', borderTop: '1px solid var(--border)', background: '#f8fafc', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Eye size={18}/> Xem hồ sơ khách thuê
            </button>
          </div>
        ))}
        {filteredTenants.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>Không tìm thấy danh tính phù hợp.</p>}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' };
const labelStyle = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block', fontWeight: '500' };
const btnStyle = { background: 'var(--primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', cursor: 'pointer' };
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };

const detailRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' };
const detailLabelStyle = { color: 'var(--text-muted)', fontSize: '0.95rem' };
const detailValueStyle = { color: 'var(--text-main)', fontSize: '1rem', fontWeight: '500' };
