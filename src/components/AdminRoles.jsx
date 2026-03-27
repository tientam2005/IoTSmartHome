import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Users, Settings, X, ChevronRight, Plus, Trash2 } from 'lucide-react';

export default function AdminRoles() {
  const { roles, permissions, addRole, updateRole, deleteRole } = useAppStore();
  const [editingRole, setEditingRole] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  
  // Form state
  const [roleName, setRoleName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState([]);

  const handleOpenConfig = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPerms(role.permissionIds || []);
    setShowConfig(true);
  };

  const handleTogglePerm = (permId) => {
    setSelectedPerms(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSave = () => {
    const data = { name: roleName, permissionIds: selectedPerms };
    if (editingRole.id === 'new') {
      addRole(data);
    } else {
      updateRole(editingRole.id, data);
    }
    setShowConfig(false);
  };

  if (showConfig) {
    const categories = Array.from(new Set(permissions.map(p => p.category)));
    
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setShowConfig(false)}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Cấu hình Vai trò</span>
          </div>
          <button onClick={handleSave} className="btn-primary" style={{ width: 'auto', height: '38px', padding: '0 16px', borderRadius: '10px' }}>Lưu cấu hình</button>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '100px' }}>
          <div style={{ marginBottom: '28px' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Tên vai trò gợi nhớ</label>
             <input value={roleName} onChange={e=>setRoleName(e.target.value)} placeholder="Ví dụ: Nhân viên kỹ thuật" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid var(--primary)', fontSize: '1.1rem', fontWeight: '700', outline: 'none' }} />
          </div>

          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '16px' }}>Phân bổ Quyền hạn (Permissions)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {categories.map(cat => (
              <div key={cat}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Phân hệ: {cat}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {permissions.filter(p => p.category === cat).map(perm => (
                     <div key={perm.id} onClick={() => handleTogglePerm(perm.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '16px', border: selectedPerms.includes(perm.id) ? '2px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                           <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid' + (selectedPerms.includes(perm.id) ? ' var(--primary)' : ' var(--border)'), background: selectedPerms.includes(perm.id) ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {selectedPerms.includes(perm.id) && <Plus size={14} color="white" style={{ transform: 'rotate(45deg)' }} />}
                           </div>
                           <span style={{ fontSize: '0.95rem', fontWeight: '600', color: selectedPerms.includes(perm.id) ? 'var(--text-main)' : 'var(--text-muted)' }}>{perm.label}</span>
                        </div>
                        <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: selectedPerms.includes(perm.id) ? 'var(--primary)' : '#e2e8f0', position: 'relative', transition: 'all 0.3s' }}>
                           <div style={{ width: '18px', height: '18px', borderRadius: '9px', background: 'white', position: 'absolute', top: '2px', left: selectedPerms.includes(perm.id) ? '20px' : '2px', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
          
          {editingRole.id !== 'new' && (
             <button onClick={() => { deleteRole(editingRole.id); setShowConfig(false); }} style={{ marginTop: '40px', width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #fee2e2', background: '#fff1f2', color: '#e11d48', fontWeight: '700', cursor: 'pointer' }}>
               <Trash2 size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Xóa vai trò này
             </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Phân Quyền</h2>
        <button onClick={() => handleOpenConfig({ id: 'new', name: '', permissionIds: [] })} className="btn-primary" style={{ width: 'auto', height: '42px', padding: '0 16px', borderRadius: '12px' }}>
           <Plus size={18}/> <span style={{fontWeight: '700'}}>Tạo Vai trò</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {roles.map(role => (
          <div key={role.id} className="card-premium" style={{ background: 'white', border: '1px solid var(--border)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Users size={24} />
                </div>
                <div>
                   <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{role.name}</h4>
                   <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role.permissionIds.length} đặc quyền hệ thống</p>
                </div>
             </div>
             <button onClick={() => handleOpenConfig(role)} style={{ ...iconBtnStyle, background: '#f8fafc', color: 'var(--primary)', padding: '8px 16px', borderRadius: '10px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Settings size={18} /> <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Cấu hình</span> <ChevronRight size={14} />
             </button>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '32px', padding: '20px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '16px' }}>
         <h4 style={{ color: '#92400e', fontSize: '0.9rem', fontWeight: '800', marginBottom: '8px' }}>Lưu ý từ quản trị hệ thống</h4>
         <p style={{ fontSize: '0.85rem', color: '#b45309', lineHeight: '1.5' }}>
            Việc thay đổi quyền hạn của các Vai trò mặc định (Admin, Chủ trọ) có thể ảnh hưởng đến khả năng truy cập tính năng cốt lõi. Hãy cẩn trọng khi loại bỏ quyền.
         </p>
      </div>
    </div>
  );
}

const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };
