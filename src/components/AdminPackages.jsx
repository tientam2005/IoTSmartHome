import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Edit2, Trash2, X, PackageOpen } from 'lucide-react';

export default function AdminPackages() {
  const { packages, permissions, addPackage, updatePackage, deletePackage } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [maxRooms, setMaxRooms] = useState('');
  const [selectedPerms, setSelectedPerms] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { name, price: parseInt(price), maxRooms: parseInt(maxRooms), permissionIds: selectedPerms };
    if (editingPackage) updatePackage(editingPackage.id, data);
    else addPackage(data);
    resetForm();
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setName(pkg.name); setPrice(pkg.price); setMaxRooms(pkg.maxRooms); 
    setSelectedPerms(pkg.permissionIds || []);
    setShowForm(true);
  };

  const handleTogglePerm = (permId) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const resetForm = () => {
    setEditingPackage(null);
    setName(''); setPrice(''); setMaxRooms(''); setSelectedPerms([]);
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={resetForm}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{editingPackage ? 'Cấu hình Gói cước' : 'Tạo gói SaaS mới'}</span>
          </div>
          <button onClick={handleSubmit} className="btn-primary" style={{ width: 'auto', height: '38px', padding: '0 16px', borderRadius: '10px' }}>Lưu Gói</button>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '100px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Tên gói dịch vụ</label>
                <input required placeholder="VD: Gói Khởi Nghiệp" value={name} onChange={e => setName(e.target.value)} style={inputStyle}/>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ textAlign: 'left' }}>
                   <label style={labelStyle}>Giá cước (VNĐ/tháng)</label>
                   <input required type="number" placeholder="500000" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle}/>
                </div>
                <div style={{ textAlign: 'left' }}>
                   <label style={labelStyle}>Giới hạn số phòng</label>
                   <input required type="number" placeholder="50" value={maxRooms} onChange={e => setMaxRooms(e.target.value)} style={inputStyle}/>
                </div>
             </div>
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '16px' }}>Tính năng & Đặc quyền đi kèm</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
             {permissions.map(perm => (
               <div key={perm.id} onClick={() => handleTogglePerm(perm.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '16px', border: selectedPerms.includes(perm.id) ? '2px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                     <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: '2px solid var(--primary)', background: selectedPerms.includes(perm.id) ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedPerms.includes(perm.id) && <Plus size={16} color="white" style={{ transform: 'rotate(45deg)' }} />}
                     </div>
                     <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{perm.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phân hệ: {perm.category}</div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px', color: 'var(--text-main)' }}>Gói cước SaaS</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: 'auto', height: '42px', padding: '0 16px', borderRadius: '12px', fontSize: '0.9rem' }}>
           <Plus size={18}/> <span style={{fontWeight: '700'}}>Gói mới</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {packages.map(p => (
          <div key={p.id} className="card-premium" style={{ border: '1px solid var(--border)', padding: '24px', position: 'relative' }}>
            {/* Header: Name & Price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
               <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <PackageOpen size={28} />
                  </div>
                  <div>
                     <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>{p.name}</h4>
                     <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đang kinh doanh</div>
                  </div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>{p.price.toLocaleString()}đ</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>/tháng</div>
               </div>
            </div>
            
            {/* Features list */}
            <div style={{ marginBottom: '20px' }}>
               <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>Quyền lợi tiêu biểu</div>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {p.permissionIds?.map((permId, i) => {
                          const perm = permissions.find(p => p.id === permId);
                          return (
                            <div key={i} style={{ fontSize: '0.8rem', padding: '4px 10px', background: '#f1f5f9', borderRadius: '8px', color: 'var(--text-main)', fontWeight: '600' }}>
                               ✓ {perm ? perm.label : permId}
                            </div>
                          );
                        })}
                     </div>
            </div>

            {/* Stats & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', margin: '0 -24px -24px -24px', padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
               <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hạn mức: <strong style={{color: 'var(--text-main)'}}>{p.maxRooms} phòng</strong></div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lượt đăng ký: <strong style={{color: 'var(--text-main)'}}>{p.name === 'Enterprise' ? '52' : (p.name === 'Pro' ? '128' : '2,041')}</strong></div>
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(p)} style={{ ...iconBtnStyle, background: 'white', border: '1px solid var(--border)', color: 'var(--primary)', width: '36px', height: '36px' }}><Edit2 size={16}/></button>
                  <button onClick={() => deletePackage(p.id)} style={{ ...iconBtnStyle, background: '#fff1f2', border: '1px solid #fee2e2', color: '#e11d48', width: '36px', height: '36px' }}><Trash2 size={16}/></button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', background: 'white' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' };
const btnStyle = { background: 'var(--primary)', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', cursor: 'pointer' };
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };
