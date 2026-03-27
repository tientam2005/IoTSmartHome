import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Edit2, Trash2, X, Eye, Settings, Zap, MoreVertical } from 'lucide-react';

export default function Rooms() {
  const { rooms, addRoom, updateRoom, deleteRoom, showConfirm } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Form State
  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('available');

  // Utility Config State
  const [elecPrice, setElecPrice] = useState(3500);
  const [waterPrice, setWaterPrice] = useState(20000);
  const [garbageFee, setGarbageFee] = useState(50000);
  const [wifiFee, setWifiFee] = useState(100000);

  const filteredRooms = rooms.filter((r) => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return r.number.toString().toLowerCase().includes(lowerTerm) || 
           r.floor.toString().toLowerCase().includes(lowerTerm) || 
           r.price.toString().includes(lowerTerm);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const roomData = { 
      number: parseInt(number), 
      floor: parseInt(floor), 
      price: parseInt(price), 
      area: parseInt(area), 
      status,
      utilityConfig: { elecPrice: parseInt(elecPrice), waterPrice: parseInt(waterPrice), garbageFee: parseInt(garbageFee), wifiFee: parseInt(wifiFee) }
    };
    
    if (editingRoom) {
      showConfirm({
        title: 'Cập nhật phòng',
        message: `Bạn có chắc muốn lưu thay đổi cho phòng ${number}?`,
        onConfirm: () => {
          updateRoom(editingRoom.id, roomData);
          resetForm();
        }
      });
    } else {
      showConfirm({
        title: 'Thêm phòng mới',
        message: `Xác nhận tạo phòng ${number} với các thông tin đã nhập?`,
        onConfirm: () => {
          addRoom(roomData);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setNumber(room.number); setFloor(room.floor); setPrice(room.price); setArea(room.area); setStatus(room.status);
    if(room.utilityConfig) {
      setElecPrice(room.utilityConfig.elecPrice);
      setWaterPrice(room.utilityConfig.waterPrice);
      setGarbageFee(room.utilityConfig.garbageFee);
      setWifiFee(room.utilityConfig.wifiFee);
    }
    
    setShowForm(true);
    setViewingRoom(null);
  };

  const handleView = (room) => {
    setViewingRoom(room);
    setShowForm(false);
  };

  const resetForm = () => {
    setEditingRoom(null);
    setNumber(''); setFloor(''); setPrice(''); setArea(''); setStatus('available');
    setElecPrice(3500); setWaterPrice(20000); setGarbageFee(50000); setWifiFee(100000);
    setShowForm(false);
    setViewingRoom(null);
  };

  if (viewingRoom) {
    return (
      <div className="form-container" style={{ padding: '24px 16px', background: 'var(--surface)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Chi tiết Phòng {viewingRoom.number}</h3>
          <button onClick={resetForm} style={iconBtnStyle}><X size={24}/></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{...detailRowStyle, alignItems: 'center'}}>
            <span style={detailLabelStyle}>Trạng thái:</span>
            <span style={{ 
              padding: '6px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '0.85rem',
              background: viewingRoom.status === 'rented' ? 'var(--primary)' : viewingRoom.status === 'available' ? 'var(--success)' : 'var(--danger)',
              color: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              {viewingRoom.status === 'rented' ? 'Đang thuê' : viewingRoom.status === 'available' ? 'Trống' : 'Bảo trì'}
            </span>
          </div>
          <div style={{...detailRowStyle, alignItems: 'baseline'}}>
            <span style={detailLabelStyle}>Tầng:</span>
            <span style={{...detailValueStyle, fontSize: '1.1rem'}}>{viewingRoom.floor}</span>
          </div>
          <div style={{...detailRowStyle, alignItems: 'baseline'}}>
            <span style={detailLabelStyle}>Diện tích:</span>
            <span style={{...detailValueStyle, fontSize: '1.1rem'}}>{viewingRoom.area} m²</span>
          </div>
          <div style={{...detailRowStyle, alignItems: 'center'}}>
            <span style={detailLabelStyle}>Giá thuê gốc:</span>
            <span style={{...detailValueStyle, color: 'var(--primary)', fontWeight: '800', fontSize: '1.3rem', whiteSpace: 'nowrap'}}>
              {viewingRoom.price.toLocaleString()}đ <span style={{fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)'}}>/tháng</span>
            </span>
          </div>
          
          <div style={{ marginTop: '16px', borderTop: '2px dashed var(--border)', paddingTop: '16px' }}>
            <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} /> Cấu hình giá dịch vụ
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={utilCardStyle}>
                <span style={utilLabelStyle}>Điện (kWh)</span>
                <span style={utilValueStyle}>{(viewingRoom.utilityConfig?.elecPrice || 0).toLocaleString()}đ</span>
              </div>
              <div style={utilCardStyle}>
                <span style={utilLabelStyle}>Nước (m3)</span>
                <span style={utilValueStyle}>{(viewingRoom.utilityConfig?.waterPrice || 0).toLocaleString()}đ</span>
              </div>
              <div style={utilCardStyle}>
                <span style={utilLabelStyle}>Phí rác/Tháng</span>
                <span style={utilValueStyle}>{(viewingRoom.utilityConfig?.garbageFee || 0).toLocaleString()}đ</span>
              </div>
              <div style={utilCardStyle}>
                <span style={utilLabelStyle}>Phí Wifi/Tháng</span>
                <span style={utilValueStyle}>{(viewingRoom.utilityConfig?.wifiFee || 0).toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <button onClick={resetForm} className="btn-primary" style={{ flex: 1 }}>Đóng</button>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={resetForm}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{editingRoom ? 'Chỉnh sửa phòng' : 'Thêm phòng mới'}</span>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Số phòng</label>
                <input required placeholder="VD: 101" value={number} onChange={e => setNumber(e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Tầng</label>
                <input required type="number" min="1" value={floor} onChange={e => setFloor(e.target.value)} style={inputStyle}/>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Giá thuê (VNĐ)</label>
                <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Diện tích (m²)</label>
                <input required type="number" min="1" value={area} onChange={e => setArea(e.target.value)} style={inputStyle}/>
              </div>
            </div>

            <div style={{ padding: '20px', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 8px 16px -4px rgba(37,99,235,0.05)' }}>
              <h4 style={{ marginBottom: '20px', fontSize: '1rem', color: 'var(--primary)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18}/> Đơn giá dịch vụ
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                   <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Điện (1kWh)</label>
                   <input type="number" min="0" value={elecPrice} onChange={e=>setElecPrice(e.target.value)} style={inputStyle} />
                 </div>
                 <div>
                   <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Nước (1m³)</label>
                   <input type="number" min="0" value={waterPrice} onChange={e=>setWaterPrice(e.target.value)} style={inputStyle} />
                 </div>
                 <div>
                   <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Rác (Tháng)</label>
                   <input type="number" min="0" value={garbageFee} onChange={e=>setGarbageFee(e.target.value)} style={inputStyle} />
                 </div>
                 <div>
                   <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Wifi (Tháng)</label>
                   <input type="number" min="0" value={wifiFee} onChange={e=>setWifiFee(e.target.value)} style={inputStyle} />
                 </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Trạng thái</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                <option value="available">Trống (Available)</option>
                <option value="rented">Đang thuê (Rented)</option>
                <option value="maintenance">Bảo trì (Maintenance)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleSubmit} 
              className="btn-primary" 
              style={{ width: '100%', maxWidth: '300px', height: '52px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: '800', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}
            >
              {editingRoom ? 'Lưu thay đổi' : 'Xác nhận Thêm mới'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setActiveMenuId(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Quản lý phòng</h2>
        <button onClick={() => setShowForm(true)} style={btnStyle}><Plus size={16}/> Thêm mới</button>
      </div>
      
      <div style={{ position: 'relative', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
        <input 
          placeholder="Tìm tên, tầng, giá tiền..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '44px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredRooms.map(room => (
          <div key={room.id} style={{ background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'visible', border: '1px solid var(--border)' }}>
            {/* Header of card */}
            <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {room.number}
                  </div>
                  <div>
                    <span style={{ 
                      fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', textTransform: 'uppercase',
                      background: room.status === 'rented' ? '#dcfce7' : room.status === 'available' ? '#f1f5f9' : '#fee2e2',
                      color: room.status === 'rented' ? '#166534' : room.status === 'available' ? '#64748b' : '#991b1b'
                    }}>
                      {room.status === 'rented' ? 'Đang thuê' : room.status === 'available' ? 'Trống' : 'Bảo trì'}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Tầng {room.floor} • {room.area}m²</div>
                  </div>
               </div>
               
               {/* More Menu Trigger */}
               <div style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === room.id ? null : room.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenuId === room.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{ position: 'absolute', right: 0, top: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border)', zIndex: 50, minWidth: '140px', overflow: 'hidden', animation: 'modalSlideUp 0.15s ease' }}
                    >
                       <button onClick={() => { handleEdit(room); setActiveMenuId(null); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left' }}>
                          <Edit2 size={16} /> Chỉnh sửa
                       </button>
                       <button 
                         onClick={() => { 
                           setActiveMenuId(null);
                           showConfirm({
                             title: 'Xóa phòng',
                             message: `Bạn có chắc muốn xóa phòng ${room.number} khỏi danh sách?`,
                             onConfirm: () => deleteRoom(room.id)
                           });
                         }} 
                         style={{ width: '100%', padding: '12px 16px', border: 'none', background: '#fee2e2', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left' }}
                       >
                          <Trash2 size={16} /> Xóa phòng
                       </button>
                    </div>
                  )}
               </div>
            </div>

            <div style={{ padding: '4px 16px 16px' }}>
               <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)', margin: '8px 0' }}>{room.price.toLocaleString()}đ <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)'}}>/tháng</span></p>
            </div>
            
            <button 
              onClick={() => handleView(room)} 
              style={{ width: '100%', padding: '12px', border: 'none', borderTop: '1px solid var(--border)', background: '#f8fafc', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Eye size={18}/> Xem chi tiết phòng
            </button>
          </div>
        ))}
        {filteredRooms.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>Không tìm thấy phòng phù hợp.</p>}
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

const utilCardStyle = { display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const utilLabelStyle = { fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' };
const utilValueStyle = { fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' };

const subLabelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' };
const subInputStyle = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none' };
