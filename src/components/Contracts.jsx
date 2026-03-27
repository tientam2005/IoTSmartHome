import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Search, Edit2, Trash2, X, Eye, FileText, MoreVertical, Calendar, ShieldAlert } from 'lucide-react';

export default function Contracts() {
  const { contracts, addContract, updateContract, deleteContract, rooms, tenants, showConfirm } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [liquidatingContract, setLiquidatingContract] = useState(null);
  
  // Liquidation State
  const [deduction, setDeduction] = useState('');
  const [deductionReason, setDeductionReason] = useState('');
  
  // Form State
  const [tenantId, setTenantId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deposit, setDeposit] = useState('');
  const [status, setStatus] = useState('active');

  const filteredContracts = contracts.filter((c) => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    const t = tenants.find(t => t.id === c.tenantId);
    const r = rooms.find(r => r.id === c.roomId);
    
    return (t && t.name.toLowerCase().includes(lowerTerm)) || 
           (r && r.number.toString().includes(lowerTerm));
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const contractData = { tenantId, roomId, startDate, endDate, deposit: parseInt(deposit), status };
    if (editingContract) {
      showConfirm({
        title: 'Cập nhật hợp đồng',
        message: 'Lưu các thay đổi cho hợp đồng này?',
        onConfirm: () => {
          updateContract(editingContract.id, contractData);
          resetForm();
        }
      });
    } else {
      showConfirm({
        title: 'Tạo hợp đồng mới',
        message: 'Bạn có chắc chắn muốn lập hợp đồng mới với các thông tin đã nhập?',
        onConfirm: () => {
          addContract(contractData);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setTenantId(contract.tenantId);
    setRoomId(contract.roomId);
    setStartDate(contract.startDate);
    setEndDate(contract.endDate);
    setDeposit(contract.deposit);
    setStatus(contract.status);
    setShowForm(true);
    setViewingContract(null);
  };

  const handleView = (contract) => {
    setViewingContract(contract);
    setShowForm(false);
  };

  const resetForm = () => {
    setEditingContract(null);
    setTenantId(''); setRoomId(''); setStartDate(''); setEndDate(''); setDeposit(''); setStatus('active');
    setShowForm(false);
    setViewingContract(null);
    setLiquidatingContract(null);
  };

  const getTenantName = (tId) => tenants.find(t => t.id === tId)?.name || 'Không xác định';
  const getRoomNumber = (rId) => rooms.find(r => r.id === rId)?.number || 'Trống';

  const handleLiquidationSubmit = (e) => {
    e.preventDefault();
    const deductAmount = Number(deduction) || 0;
    const returnAmount = liquidatingContract.deposit - deductAmount;
    
    showConfirm({
      title: 'Xác nhận thanh lý hợp đồng',
      message: `Hoàn trả ${returnAmount.toLocaleString()}đ tiền cọc và chuyển phòng sang trạng thái Trống? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        // 1. Expire Contract
        updateContract(liquidatingContract.id, { status: 'expired' });
        // 2. Set Room to 'available'
        useAppStore.getState().updateRoom(liquidatingContract.roomId, { status: 'available' });
        // 3. Clear Room from Tenant (Optional, let's just keep history or clear if needed)
        // For simplicity, we just mark the contract.
        resetForm();
      }
    });
  };

  if (liquidatingContract) {
    const deductAmount = Number(deduction) || 0;
    const returnAmount = liquidatingContract.deposit - deductAmount;

    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={resetForm}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Thanh Lý & Quyết Toán Cọc</span>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '40px', overflowY: 'auto' }}>
          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px', color: '#1d4ed8', fontSize: '1rem', fontWeight: '800' }}>Thông tin hợp đồng</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
               <div><strong>Khách:</strong> {getTenantName(liquidatingContract.tenantId)}</div>
               <div><strong>Phòng:</strong> {getRoomNumber(liquidatingContract.roomId)}</div>
               <div><strong>Tiền cọc giữ:</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{liquidatingContract.deposit.toLocaleString()}đ</span></div>
            </div>
          </div>

          <form onSubmit={handleLiquidationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Tiền khấu trừ (Hư hỏng, chưa đóng điện nước...) - VNĐ</label>
              <input type="number" min="0" max={liquidatingContract.deposit} placeholder="Nhập số tiền trừ..." value={deduction} onChange={e => setDeduction(e.target.value)} style={{...inputStyle, borderColor: deduction ? '#ef4444' : 'var(--border)'}}/>
            </div>
            
            {Number(deduction) > 0 && (
              <div>
                <label style={labelStyle}>Lý do khấu trừ</label>
                <input required placeholder="VD: Khách làm hỏng quạt trần..." value={deductionReason} onChange={e => setDeductionReason(e.target.value)} style={inputStyle}/>
              </div>
            )}

            <div style={{ marginTop: '16px', padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
               <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>TỔNG TIỀN PHẢI HOÀN TRẢ KHÁCH</div>
               <div style={{ fontSize: '2.4rem', fontWeight: '900', color: returnAmount >= 0 ? '#4ade80' : '#f87171' }}>
                  {returnAmount >= 0 ? returnAmount.toLocaleString() : '0'}đ
               </div>
               {deduction > 0 && (
                 <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={14} /> Đã trừ đi {deductAmount.toLocaleString()}đ</div>
               )}
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', marginTop: '16px', background: '#ef4444', border: 'none', color: 'white', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}>
               XÁC NHẬN THANH LÝ & TRẢ PHÒNG
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (viewingContract) {
    return (
      <div className="form-container" style={{ padding: '24px 16px', background: 'var(--surface)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Hợp đồng Thuê</h3>
          <button onClick={resetForm} style={iconBtnStyle}><X size={24}/></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Đại diện thuê:</span>
            <span style={{...detailValueStyle, color: 'var(--primary)', fontWeight: 'bold'}}>{getTenantName(viewingContract.tenantId)}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Phòng tương ứng:</span>
            <span style={{...detailValueStyle, fontWeight: 'bold', fontSize: '1.1rem'}}>Phòng {getRoomNumber(viewingContract.roomId)}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Từ ngày:</span>
            <span style={detailValueStyle}>{viewingContract.startDate}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Đến ngày:</span>
            <span style={detailValueStyle}>{viewingContract.endDate}</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Tiền cọc:</span>
            <span style={{...detailValueStyle, color: 'var(--text-main)'}}>{viewingContract.deposit.toLocaleString()} VNĐ</span>
          </div>
          <div style={detailRowStyle}>
            <span style={detailLabelStyle}>Tình trạng:</span>
            <span style={{ 
              padding: '6px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem',
              background: viewingContract.status === 'active' ? 'var(--success)' : 'var(--danger)',
              color: 'white'
            }}>
               {viewingContract.status === 'active' ? 'Có hiệu lực' : 'Hết hiệu lực'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
           {/* Removed Edit button from View Details as requested */}
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
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>{editingContract ? 'Sửa Hợp đồng' : 'Tạo hợp đồng mới'}</span>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '40px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={labelStyle}>Đại diện thuê (Khách khách)</label>
              <select required value={tenantId} onChange={e => setTenantId(e.target.value)} style={inputStyle}>
                <option value="">-- Chọn khách thuê --</option>
                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Phòng tương ứng</label>
              <select required value={roomId} onChange={e => setRoomId(e.target.value)} style={inputStyle}>
                <option value="">-- Chọn phòng --</option>
                {rooms.map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Lưu trú từ</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle}/>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Dự kiến trả</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Tiền cọc giữ chỗ (VNĐ)</label>
              <input required type="number" min="0" placeholder="Tiền đặt cọc (VNĐ)" value={deposit} onChange={e => setDeposit(e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Trạng thái hợp đồng</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
                <option value="active">Đang hiệu lực (Active)</option>
                <option value="expired">Đã thanh lý / Hết hạn</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
             <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                <strong>Quy định:</strong> Hợp đồng là căn cứ pháp lý để tính toán tiền phòng và dịch vụ hàng tháng. Hãy đảm bảo ngày bắt đầu và kết thúc trùng khớp với thực tế.
             </p>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleSubmit} 
              className="btn-primary" 
              style={{ width: '100%', maxWidth: '300px', height: '52px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: '800', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}
            >
              {editingContract ? 'Lưu cập nhật' : 'Xác nhận Tạo mới'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setActiveMenuId(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2>Hợp đồng</h2>
        <button onClick={() => setShowForm(true)} style={btnStyle}><Plus size={16}/> Tạo HĐ mới</button>
      </div>
      
      <div style={{ position: 'relative', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
        <input 
          placeholder="Tên khách, tên phòng..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '44px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredContracts.map(contract => (
          <div key={contract.id} style={{ background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'visible', border: '1px solid var(--border)' }}>
            {/* Header section with info and More Menu */}
            <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>HĐ • Phòng {getRoomNumber(contract.roomId)}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Khách: <strong>{getTenantName(contract.tenantId)}</strong>
                    </div>
                  </div>
               </div>
               
               <div style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === contract.id ? null : contract.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {activeMenuId === contract.id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{ position: 'absolute', right: 0, top: '100%', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--border)', zIndex: 50, minWidth: '160px', overflow: 'hidden', animation: 'modalSlideUp 0.15s ease' }}
                    >
                       <button onClick={() => { handleEdit(contract); setActiveMenuId(null); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                          <Edit2 size={16} /> Chỉnh sửa HĐ
                       </button>
                       {contract.status === 'active' && (
                         <button onClick={() => { setLiquidatingContract(contract); setActiveMenuId(null); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#ea580c', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                            <ShieldAlert size={16} /> Quyết toán cọc
                         </button>
                       )}
                       <button 
                         onClick={() => { 
                           setActiveMenuId(null);
                           showConfirm({
                             title: 'Xóa hợp đồng',
                             message: 'Gỡ bỏ hợp đồng này khỏi hệ thống? Thao tác này không thể hoàn tác.',
                             onConfirm: () => deleteContract(contract.id)
                           });
                         }} 
                         style={{ width: '100%', padding: '12px 16px', border: 'none', background: '#fee2e2', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--danger)', cursor: 'pointer', textAlign: 'left' }}
                       >
                          <Trash2 size={16} /> Gỡ hợp đồng
                       </button>
                    </div>
                  )}
               </div>
            </div>

            <div style={{ padding: '12px 16px 16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', background: contract.status === 'active' ? '#dcfce7' : '#f1f5f9', color: contract.status === 'active' ? '#166534' : '#64748b', fontWeight: 'bold' }}>
                        {contract.status === 'active' ? 'ĐANG HIỆU LỰC' : 'HẾT HẠN'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} /> {contract.startDate} → {contract.endDate}
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                   Tiền cọc: <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{contract.deposit.toLocaleString()}đ</span>
                </div>
            </div>
            
            <button 
              onClick={() => handleView(contract)} 
              style={{ width: '100%', padding: '12px', border: 'none', borderTop: '1px solid var(--border)', background: '#f8fafc', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Eye size={18}/> Xem chi tiết hợp đồng
            </button>
          </div>
        ))}
        {filteredContracts.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>Không tìm thấy hợp đồng.</p>}
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
