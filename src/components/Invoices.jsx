import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Plus, Edit2, Trash2, X, FileText, CheckCircle, Clock, Zap, Droplets, Info, Save } from 'lucide-react';

function BulkInvoiceView({ onClose }) {
  const { rooms, invoices, addInvoice, showConfirm } = useAppStore();
  const rentedRooms = rooms.filter(r => r.status === 'rented');
  
  const [month, setMonth] = useState('');
  const [inputs, setInputs] = useState({});

  useEffect(() => {
    const initial = {};
    rentedRooms.forEach(room => {
      const roomInvs = invoices.filter(inv => inv.roomId === room.id);
      let lastElec = '', lastWater = '';
      if (roomInvs.length > 0) {
        lastElec = roomInvs[0].elecNew;
        lastWater = roomInvs[0].waterNew;
      }
      initial[room.id] = { elecOld: lastElec, elecNew: '', waterOld: lastWater, waterNew: '' };
    });
    setInputs(initial);
  }, [rooms, invoices]);

  const handleInputChange = (roomId, field, value) => {
    setInputs(prev => ({ ...prev, [roomId]: { ...prev[roomId], [field]: value } }));
  };

  const calculateTotal = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return 0;
    const data = inputs[roomId] || {};
    const ePrice = room.utilityConfig?.elecPrice || 3500;
    const wPrice = room.utilityConfig?.waterPrice || 20000;
    const sFee = (room.utilityConfig?.garbageFee || 50000) + (room.utilityConfig?.wifiFee || 100000);
    
    const dE = Math.max(0, Number(data.elecNew) - Number(data.elecOld));
    const dW = Math.max(0, Number(data.waterNew) - Number(data.waterOld));
    
    return room.price + (dE * ePrice) + (dW * wPrice) + sFee;
  };

  const handleCreateAll = () => {
    if (!month) {
      alert('Vui lòng nhập kỳ thanh toán (tháng)!');
      return;
    }
    showConfirm({
      title: 'Xác nhận tạo hóa đơn loạt',
      message: `Tạo hóa đơn tháng ${month} cho tất cả phòng đã có chỉ số mới?`,
      onConfirm: () => {
        rentedRooms.forEach(room => {
          const data = inputs[room.id];
          if (data && data.elecNew && data.waterNew) {
            const ePrice = room.utilityConfig?.elecPrice || 3500;
            const wPrice = room.utilityConfig?.waterPrice || 20000;
            const sFee = (room.utilityConfig?.garbageFee || 50000) + (room.utilityConfig?.wifiFee || 100000);
            
            const dE = Math.max(0, Number(data.elecNew) - Number(data.elecOld));
            const dW = Math.max(0, Number(data.waterNew) - Number(data.waterOld));
            
            const totalAmount = room.price + (dE * ePrice) + (dW * wPrice) + sFee;
            
            addInvoice({
              roomId: room.id, month,
              elecFee: dE * ePrice, waterFee: dW * wPrice, serviceFee: sFee,
              totalAmount, status: 'unpaid',
              elecOld: Number(data.elecOld), elecNew: Number(data.elecNew),
              waterOld: Number(data.waterOld), waterNew: Number(data.waterNew)
            });
          }
        });
        onClose();
      }
    });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
      <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={onClose}>
          <X size={24} />
          <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Chốt Điện/Nước Nhanh</span>
        </div>
        <button onClick={handleCreateAll} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', borderRadius: '10px' }}><Save size={18}/> Tạo HĐ</button>
      </header>
      
      <div className="app-content" style={{ padding: '20px', overflowY: 'auto', paddingBottom: '100px' }}>
         <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Kỳ hóa đơn (VD: 10/2023)</label>
            <input required placeholder="Nhập tháng xuất..." value={month} onChange={e => setMonth(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1.1rem', fontWeight: 'bold' }}/>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {rentedRooms.map(room => {
             const inps = inputs[room.id] || {};
             const isFilled = inps.elecNew && inps.waterNew;
             return (
               <div key={room.id} style={{ background: 'white', borderRadius: '16px', border: isFilled ? '1px solid #22c55e' : '1px solid var(--border)', padding: '16px', position: 'relative' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                   <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: isFilled ? '#166534' : 'var(--text-main)' }}>Phòng {room.number}</h4>
                   <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>
                     {calculateTotal(room.id).toLocaleString()}đ
                   </div>
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#d97706', marginBottom: '8px' }}><Zap size={14}/> ĐIỆN ({inps.elecOld})</div>
                      <input 
                        type="number" 
                        placeholder="Số mới" 
                        value={inps.elecNew || ''} 
                        onChange={e => handleInputChange(room.id, 'elecNew', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white', fontWeight: 'bold' }}
                      />
                    </div>
                    
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}><Droplets size={14}/> NƯỚC ({inps.waterOld})</div>
                      <input 
                        type="number" 
                        placeholder="Số mới" 
                        value={inps.waterNew || ''} 
                        onChange={e => handleInputChange(room.id, 'waterNew', e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', background: 'white', fontWeight: 'bold' }}
                      />
                    </div>
                 </div>
               </div>
             );
           })}
         </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const { invoices, rooms, tenants, addInvoice, updateInvoice, deleteInvoice, addTenantNotification, showConfirm } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [recordingInvoice, setRecordingInvoice] = useState(null); // For "Thu tiền" modal
  const [payAmount, setPayAmount] = useState('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  
  const [roomId, setRoomId] = useState('');
  const [month, setMonth] = useState('');
  
  // Các thông số điện (Tự động lấy từ Room Config)
  const [elecPrice, setElecPrice] = useState(0);
  const [elecOld, setElecOld] = useState('');
  const [elecNew, setElecNew] = useState('');
  
  // Các thông số nước
  const [waterPrice, setWaterPrice] = useState(0);
  const [waterOld, setWaterOld] = useState('');
  const [waterNew, setWaterNew] = useState('');

  // Các loại phí cố định (Rác + Wifi)
  const [serviceFee, setServiceFee] = useState(0);
  const [status, setStatus] = useState('unpaid');

  // Lấy dữ liệu config khi chọn phòng
  useEffect(() => {
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        setElecPrice(room.utilityConfig?.elecPrice || 3500);
        setWaterPrice(room.utilityConfig?.waterPrice || 20000);
        setServiceFee((room.utilityConfig?.garbageFee || 50000) + (room.utilityConfig?.wifiFee || 100000));
      }
    }
  }, [roomId, rooms]);

  const getMetrics = () => {
    const dE = Math.max(0, Number(elecNew) - Number(elecOld));
    const dW = Math.max(0, Number(waterNew) - Number(waterOld));
    
    const eFee = dE * elecPrice;
    const wFee = dW * waterPrice;
    const rPrice = rooms.find(r => r.id === roomId)?.price || 0;
    
    return { eFee, wFee, rPrice, sFee: Number(serviceFee), dE, dW };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { eFee, wFee, rPrice, sFee } = getMetrics();
    const totalAmount = rPrice + eFee + wFee + sFee;
    
    const data = { 
      roomId, month, 
      elecFee: eFee, waterFee: wFee, serviceFee: sFee,
      totalAmount, status 
    };

    showConfirm({
      title: 'Duyệt hóa đơn',
      message: `Xác nhận phê duyệt hóa đơn tháng ${month} cho phòng ${getRoomNumber(roomId)}?`,
      onConfirm: () => {
        addInvoice({
          ...data,
          elecOld: Number(elecOld), elecNew: Number(elecNew),
          waterOld: Number(waterOld), waterNew: Number(waterNew)
        });
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setRoomId(''); setMonth(''); setElecOld(''); setElecNew(''); setWaterOld(''); setWaterNew('');
    setStatus('unpaid');
    setShowForm(false);
    setRecordingInvoice(null);
  };

  const getRoomNumber = (rId) => rooms.find(r => r.id === rId)?.number || 'Trống';

  // --- Financial Logic ---
  const filteredInvoices = invoices.filter(inv => {
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchMonth = filterMonth === 'all' || inv.month === filterMonth;
    return matchStatus && matchMonth;
  });

  const stats = filteredInvoices.reduce((acc, inv) => {
    acc.total += inv.totalAmount;
    if (inv.status === 'paid') acc.collected += inv.totalAmount;
    else acc.debt += inv.totalAmount;
    return acc;
  }, { total: 0, collected: 0, debt: 0 });

  const uniqueMonths = [...new Set(invoices.map(inv => inv.month))];

  const handleRecordPayment = (inv) => {
    setRecordingInvoice(inv);
    setPayAmount(inv.totalAmount); // Default to full amount
  };

  const confirmPayment = () => {
    updateInvoice(recordingInvoice.id, { status: 'paid', paidAmount: Number(payAmount) });
    setRecordingInvoice(null);
  };

  if (showBulkForm) return <BulkInvoiceView onClose={() => setShowBulkForm(false)} />;

  if (showForm) {
    const { eFee, wFee, rPrice, sFee, dE, dW } = getMetrics();
    const totalCalc = rPrice + eFee + wFee + sFee;

    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={resetForm}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Lập hóa đơn mới</span>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '40px', overflowY: 'auto' }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={labelStyle}>Phòng đang thuê</label>
                <select required value={roomId} onChange={e => setRoomId(e.target.value)} style={inputStyle}>
                  <option value="">-- Chọn phòng --</option>
                  {rooms.filter(r => r.status === 'rented').map(r => <option key={r.id} value={r.id}>Phòng {r.number}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Kỳ thanh toán (Tháng)</label>
                <input required placeholder="VD: 10/2023" value={month} onChange={e => setMonth(e.target.value)} style={inputStyle}/>
              </div>
              
              {roomId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={calcCardStyle}>
                    <div style={{display:'flex', alignItems:'center', gap: '10px', marginBottom: '16px'}}>
                      <div style={{ padding: '10px', borderRadius: '12px', background: '#fef3c7', color: '#d97706' }}><Zap size={20}/></div>
                      <h4 style={{ margin: 0, fontWeight: '800' }}>Chỉ số Điện</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={subLabelStyle}>Chỉ số cũ</label>
                        <input type="number" required value={elecOld} onChange={e => setElecOld(e.target.value)} style={subInputStyle}/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={subLabelStyle}>Chỉ số mới</label>
                        <input type="number" required value={elecNew} onChange={e => setElecNew(e.target.value)} style={subInputStyle}/>
                      </div>
                    </div>
                  </div>

                  <div style={calcCardStyle}>
                    <div style={{display:'flex', alignItems:'center', gap: '10px', marginBottom: '16px'}}>
                       <div style={{ padding: '10px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb' }}><Droplets size={20}/></div>
                       <h4 style={{ margin: 0, fontWeight: '800' }}>Chỉ số Nước</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                         <label style={subLabelStyle}>Chỉ số cũ</label>
                         <input type="number" required value={waterOld} onChange={e => setWaterOld(e.target.value)} style={subInputStyle}/>
                      </div>
                      <div style={{ flex: 1 }}>
                         <label style={subLabelStyle}>Chỉ số mới</label>
                         <input type="number" required value={waterNew} onChange={e => setWaterNew(e.target.value)} style={subInputStyle}/>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(to right, var(--primary), #1d4ed8)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 12px 30px rgba(37, 99, 235, 0.3)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng cộng dự kiến</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: '900' }}>{totalCalc.toLocaleString()}đ</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                     <button 
                       onClick={handleSubmit} 
                       className="btn-primary" 
                       style={{ width: '100%', maxWidth: '300px', height: '52px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: '800', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}
                     >
                       Duyệt & Xuất Hóa Đơn
                     </button>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Hóa đơn tài chính</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowBulkForm(true)} style={{ ...btnStyle, background: '#f59e0b', color: 'white', padding: '10px 14px', borderRadius: '12px' }}><Zap size={18}/> Ghi Nhanh</button>
          <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: 'auto', padding: '10px 14px', borderRadius: '12px' }}><Plus size={18}/> Lập Lẻ</button>
        </div>
      </div>

      {/* --- FINANCIAL OVERVIEW CARD --- */}
      <div style={{ padding: '20px', borderRadius: '24px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', marginBottom: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
         <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '4px', fontWeight: '500' }}>TỔNG DOANH THU DỰ KIẾN ({filterMonth === 'all' ? 'Tất cả' : filterMonth})</div>
         <div style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' }}>{stats.total.toLocaleString()}đ</div>
         
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(34, 197, 94, 0.15)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
               <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 'bold', textTransform: 'uppercase' }}>Đã thu</div>
               <div style={{ fontSize: '1rem', fontWeight: '800' }}>{stats.collected.toLocaleString()}đ</div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
               <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 'bold', textTransform: 'uppercase' }}>Còn phải thu</div>
               <div style={{ fontSize: '1rem', fontWeight: '800' }}>{stats.debt.toLocaleString()}đ</div>
            </div>
         </div>
      </div>

      {/* --- TOOLBAR / FILTERS --- */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '8px' }}>
         <select 
           value={filterMonth} 
           onChange={e => setFilterMonth(e.target.value)}
           style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', fontSize: '0.85rem', outline: 'none', color: 'var(--text-main)' }}
         >
            <option value="all">Tất cả tháng</option>
            {uniqueMonths.map(m => <option key={m} value={m}>Tháng {m}</option>)}
         </select>

         <select 
           value={filterStatus} 
           onChange={e => setFilterStatus(e.target.value)}
           style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'white', fontWeight: '600', fontSize: '0.85rem', outline: 'none', color: 'var(--text-main)' }}
         >
            <option value="all">Tất cả trạng thái</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending_approval">Chờ duyệt</option>
         </select>
      </div>

      {/* --- INVOICE LIST --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredInvoices.map(inv => (
          <div key={inv.id} style={{ background: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--border)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f1f5f9', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>Phòng {getRoomNumber(inv.roomId)}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Tháng {inv.month}</div>
                  </div>
               </div>
               <span style={{ 
                  fontSize: '0.7rem', padding: '4px 12px', borderRadius: '20px', fontWeight: '800',
                  background: inv.status === 'paid' ? '#dcfce7' : inv.status === 'pending_approval' ? '#eff6ff' : '#fee2e2', 
                  color: inv.status === 'paid' ? '#166534' : inv.status === 'pending_approval' ? '#1d4ed8' : '#991b1b',
                  textTransform: 'uppercase'
                }}>
                  {inv.status === 'paid' ? 'Đã thu' : inv.status === 'pending_approval' ? 'Chờ duyệt' : 'Chưa thu'}
               </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <div style={badgeStyle}><Zap size={12}/> {inv.elecFee.toLocaleString()}đ</div>
                <div style={badgeStyle}><Droplets size={12}/> {inv.waterFee.toLocaleString()}đ</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Tổng cộng</div>
                   <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--primary)' }}>{inv.totalAmount.toLocaleString()}đ</div>
                </div>
                
                {inv.status !== 'paid' ? (
                  <button 
                    onClick={() => handleRecordPayment(inv)}
                    style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', fontSize: '0.85rem' }}
                  >
                    Ghi nhận thu tiền
                  </button>
                ) : (
                  <button 
                    style={{ padding: '10px 20px', borderRadius: '12px', background: '#f1f5f9', color: 'var(--text-main)', border: 'none', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckCircle size={16} /> Biên lai
                  </button>
                )}
            </div>

            {inv.status === 'pending_approval' && (
              <div style={{ marginTop: '16px', padding: '12px', background: '#fff7ed', borderRadius: '12px', border: '1px dashed #fdba74', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: '600' }}>Khách đã gửi minh chứng CK</div>
                 <button 
                  onClick={() => {
                    updateInvoice(inv.id, {status: 'paid'});
                    const t = tenants.find(ten => ten.roomId === inv.roomId);
                    if (t) addTenantNotification({ tenantId: t.id, title: 'Thanh toán thành công', message: `Hóa đơn tháng ${inv.month} của bạn đã được chủ trọ xác nhận thanh toán.` });
                  }} 
                  style={{ background: '#ea580c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}
                 >
                   Duyệt ngay
                 </button>
              </div>
            )}
          </div>
        ))}
        {filteredInvoices.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Không có hóa đơn nào phù hợp.</div>}
      </div>

      {/* --- RECORD PAYMENT MODAL --- */}
      {recordingInvoice && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div className="card-premium" style={{ width: '100%', maxWidth: '350px', padding: '24px', animation: 'modalSlideUp 0.3s ease' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '800' }}>Ghi nhận thu tiền</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Phòng {getRoomNumber(recordingInvoice.roomId)} - Tháng {recordingInvoice.month}</p>
              
              <div style={{ marginBottom: '20px' }}>
                 <label style={labelStyle}>Số tiền thực thu (VNĐ)</label>
                 <input 
                   type="number" 
                   value={payAmount} 
                   onChange={e => setPayAmount(e.target.value)} 
                   style={{...inputStyle, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)'}}
                 />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setRecordingInvoice(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontWeight: 'bold' }}>Hủy</button>
                  <button onClick={confirmPayment} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>Xác nhận đã thu</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' };
const labelStyle = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: '600' };
const btnStyle = { background: 'var(--primary)', color: 'white', padding: '12px 20px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer' };
const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' };

const subLabelStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block', fontWeight: '500' };
const subInputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' };

const calcCardStyle = { padding: '16px', border: '1px solid var(--border)', borderRadius: '16px', background: 'white' };
const badgeStyle = { fontSize: '0.75rem', padding: '4px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' };
