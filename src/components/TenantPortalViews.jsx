import React, { useState, useRef } from 'react';
import { useAppStore } from '../store';
import { 
  FileText, CheckCircle, Clock, Wrench, Upload, User, Users as UsersIcon, Phone, Mail,
  Image as ImageIcon, Send, ShieldCheck, Calendar, Zap, Droplets, CreditCard, Info, ChevronRight, Lock, MessageSquare, BarChart2, Edit2, Save, X, LogOut, Camera, AlertCircle, ShieldAlert
} from 'lucide-react';

const cardStyle = { marginBottom: '20px' };

// --- HELPERS ---
const StatusBadge = ({ status }) => {
  const configs = {
    pending: { label: 'TIẾP NHẬN', bg: '#fee2e2', color: '#991b1b' },
    fixing: { label: 'ĐANG SỬA', bg: '#fff7ed', color: '#9a3412' },
    completed: { label: 'HOÀN TẤT', bg: '#dcfce7', color: '#166534' }
  };
  const config = configs[status] || configs.pending;
  return (
    <span style={{ 
      fontSize: '0.7rem', padding: '4px 10px', borderRadius: '10px', fontWeight: '800',
      background: config.bg, color: config.color,
    }}>
      {config.label}
    </span>
  );
};

export function TenantHome() {
  const { currentUser, tenants, rooms, assets, contracts, managerInfo, invoices } = useAppStore();
  const tenant = tenants.find(t => t.id === currentUser.id);
  const room = rooms.find(r => r.id === tenant?.roomId);
  const roomAssets = assets.filter(a => a.roomId === room?.id);
  const myContract = contracts.find(c => c.tenantId === tenant?.id && c.status === 'active');
  const roommates = tenants.filter(t => t.roomId === room?.id && t.id !== currentUser.id);
  
  const usageHistory = invoices.filter(i => i.roomId === room?.id).slice(-3).reverse();

  if (!tenant || !room) return <div className="card-premium">Không tìm thấy dữ liệu phòng của bạn.</div>;

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Chào {tenant.name.split(' ').pop()}! 👋</h2>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '6px 14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(37,99,235,0.2)' }}>
           PHÒNG {room.number}
        </div>
      </div>

      <div className="card-premium" style={cardStyle}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 size={20} color="var(--primary)" /> Nhật ký sử dụng (Điện/Nước)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {usageHistory.map(use => (
            <div key={use.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
               <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Tháng {use.month.split('/')[0]}</div>
               <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ĐIỆN</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--warning)' }}>{use.elecNew - use.elecOld} số</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>NƯỚC</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)' }}>{use.waterNew - use.waterOld} m³</div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-premium" style={cardStyle}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <ShieldCheck size={20} color="var(--primary)" /> Thông tin lưu trú
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
           <div>
              <label className="label-premium">VỊ TRÍ</label>
              <div style={{ fontWeight: '600' }}>Tầng {room.floor}</div>
           </div>
           <div>
              <label className="label-premium">DIỆN TÍCH</label>
              <div style={{ fontWeight: '600' }}>{room.area} m²</div>
           </div>
           <div>
              <label className="label-premium">GIÁ THUÊ</label>
              <div style={{ fontWeight: '800', color: 'var(--primary)' }}>{room.price.toLocaleString()}đ</div>
           </div>
           <div>
              <label className="label-premium">NGÀY VÀO</label>
              <div style={{ fontWeight: '600' }}>{myContract?.startDate || '---'}</div>
           </div>
        </div>
      </div>

      <div className="card-premium" style={{ ...cardStyle, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}>
         <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af' }}>
            <Phone size={18} /> Liên hệ Quản lý / Chủ nhà
         </h3>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1e40af' }}>{managerInfo.name}</div>
               <div style={{ fontSize: '0.85rem', color: '#1e40af', opacity: 0.8 }}>Zalo: {managerInfo.zalo}</div>
            </div>
            <a href={`tel:${managerInfo.phone}`} style={{ background: '#2563eb', color: 'white', width: '40px', height: '40px', borderRadius: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>
               <Phone size={20} />
            </a>
         </div>
      </div>

      <div className="card-premium">
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '800' }}>Tài sản bàn giao</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {roomAssets.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '600' }}>{a.name}</span>
              <span style={{ 
                fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold',
                background: a.condition === 'good' ? '#dcfce7' : '#fee2e2',
                color: a.condition === 'good' ? '#166534' : '#991b1b'
              }}>
                {a.condition === 'good' ? 'MỚI / TỐT' : 'HƯ HỎNG'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TenantInvoices() {
  const { currentUser, tenants, invoices, updateInvoice, addLandlordNotification, rooms, showConfirm, hideConfirm } = useAppStore();
  const tenant = tenants.find(t => t.id === currentUser.id);
  const room = rooms.find(r => r.id === tenant?.roomId);
  const myInvoices = invoices.filter(i => i.roomId === tenant?.roomId).sort((a,b) => b.id.localeCompare(a.id));
  
  const fileInputRef = useRef(null);
  const [targetInv, setTargetInv] = useState(null);
  const [qrInvoice, setQrInvoice] = useState(null);

  const triggerUpload = (inv) => {
    setTargetInv(inv);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && targetInv) {
      showConfirm({
        title: 'Xác nhận thanh toán',
        message: `Gửi biên lai chuyển khoản cho hóa đơn Tháng ${targetInv.month}?`,
        onConfirm: () => {
          updateInvoice(targetInv.id, { status: 'pending_approval' });
          addLandlordNotification({ message: `Phòng ${room?.number || '---'} vừa tải biên lai thanh toán tháng ${targetInv.month}` });
          setQrInvoice(null);
          hideConfirm();
        },
        onCancel: () => hideConfirm()
      });
    }
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.4rem', fontWeight: '800' }}>Hóa đơn của tôi</h2>
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

      <div className="card-premium" style={{ ...cardStyle, background: 'linear-gradient(135deg, #1e293b, #334155)', color: 'white', border: 'none' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <CreditCard size={18} /> Ngân hàng Thụ hưởng
        </h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
           <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '12px', padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="https://img.vietqr.io/image/vcb-0123456789-compact2.png" alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
           </div>
           <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: '700', textTransform: 'uppercase' }}>VIETCOMBANK</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '1px' }}>0123 456 789</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '4px' }}>Chủ TK: NGUYEN VAN CHU</div>
           </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {myInvoices.map(inv => (
          <div key={inv.id} className="card-premium" style={{ borderLeftWidth: '6px', borderLeftColor: inv.status === 'paid' ? 'var(--success)' : inv.status === 'pending_approval' ? 'var(--warning)' : 'var(--danger)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
               <div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Tháng {inv.month}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>#INV-{inv.id.slice(-4)}</div>
               </div>
               <StatusBadge status={inv.status === 'paid' ? 'completed' : inv.status === 'pending_approval' ? 'fixing' : 'pending'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: '#f8fafc', borderRadius: '16px', marginBottom: '16px' }}>
               <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ĐIỆN</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{inv.elecNew - inv.elecOld} số</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{inv.elecFee.toLocaleString()}đ</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>NƯỚC</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{inv.waterNew - inv.waterOld} m³</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{inv.waterFee.toLocaleString()}đ</div>
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500' }}>Tổng cộng:</div>
               <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>{inv.totalAmount.toLocaleString()}đ</div>
            </div>

            {inv.status === 'unpaid' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                 <button onClick={() => setQrInvoice(inv)} className="btn-primary" style={{ flex: 1, height: '48px', borderRadius: '14px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', boxShadow: 'none' }}>
                   Thanh toán QR
                 </button>
                 <button onClick={() => triggerUpload(inv)} className="btn-primary" style={{ flex: 1, height: '48px', borderRadius: '14px' }}>
                   <Upload size={18}/> Gửi Biên lai
                 </button>
              </div>
            )}
            {inv.status === 'pending_approval' && (
              <div style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-muted)', padding: '12px', borderRadius: '14px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Clock size={18}/> Đang chờ xác nhận...
              </div>
            )}
          </div>
        ))}
      </div>

      {qrInvoice && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'modalSlideUp 0.3s ease' }}>
           <div style={{ background: 'white', width: '100%', maxWidth: '350px', borderRadius: '24px', padding: '24px', position: 'relative', textAlign: 'center' }}>
             <button onClick={() => setQrInvoice(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '12px', padding: '6px', cursor: 'pointer' }}><X size={20}/></button>
             
             <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: '800' }}>Thanh toán trực tuyến</h3>
             <p style={{ margin: '0 0 24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sử dụng App Ngân hàng để quét mã QR</p>
             
             <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', display: 'inline-block', marginBottom: '24px' }}>
               <img 
                 src={`https://img.vietqr.io/image/vcb-0123456789-compact2.png?amount=${qrInvoice.totalAmount}&addInfo=PHONG%20${room?.number}%20TT%20THANG%20${qrInvoice.month.replace('/','')}&accountName=NGUYEN VAN CHU`} 
                 alt="Payment QR" 
                 style={{ width: '200px', height: '200px', objectFit: 'contain' }} 
               />
               <div style={{ marginTop: '12px', fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)' }}>
                 {qrInvoice.totalAmount.toLocaleString()}đ
               </div>
             </div>
             
             <button onClick={() => triggerUpload(qrInvoice)} className="btn-primary" style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1.05rem' }}>
                Đã thanh toán (Tải biên lai)
             </button>
           </div>
        </div>
      )}
    </div>
  );
}

export function TenantIssues() {
  const { currentUser, tenants, issues, addIssue, addLandlordNotification, rooms, showConfirm, hideConfirm } = useAppStore();
  const tenant = tenants.find(t => t.id === currentUser.id);
  const room = rooms.find(r => r.id === tenant?.roomId);
  const myIssues = issues.filter(i => i.tenantId === tenant?.id).reverse();
  
  const [title, setTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [detailIssue, setDetailIssue] = useState(null);
  const issueFileRef = useRef(null);

  const handleIssueFile = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const requestSubmit = (e) => {
    e.preventDefault();
    showConfirm({
      title: 'Gửi báo cáo sự cố',
      message: 'Bạn có chắc chắn muốn gửi báo cáo này đến chủ trọ?',
      onConfirm: () => {
        addIssue({
          roomId: tenant.roomId,
          tenantId: tenant.id,
          title, status: 'pending',
          date: new Date().toLocaleDateString('vi-VN'),
          image: selectedImage
        });
        setTitle(''); setSelectedImage(null);
        addLandlordNotification({ message: `Phòng ${room?.number || '---'} vừa báo cáo sự cố.` });
        hideConfirm();
      },
      onCancel: () => hideConfirm()
    });
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.4rem', fontWeight: '800' }}>Hỗ trợ & Sự cố</h2>
      <input type="file" ref={issueFileRef} style={{ display: 'none' }} accept="image/*" onChange={handleIssueFile} />

      <div className="card-premium" style={cardStyle}>
        <form onSubmit={requestSubmit}>
          <label className="label-premium">Báo cáo vấn đề mới</label>
          <textarea 
            required value={title} onChange={e => setTitle(e.target.value)} placeholder="Mô tả chi tiết sự cố..."
            style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid var(--border)', minHeight: '80px', marginBottom: '16px', fontSize: '1rem', background: '#f8fafc', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
             <button onClick={() => issueFileRef.current.click()} type="button" style={{ flex: 1, height: '44px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <ImageIcon size={18} /> {selectedImage ? 'Đã chọn ảnh' : 'Thêm hình ảnh'}
             </button>
             <button onClick={() => issueFileRef.current.click()} type="button" style={{ flex: 1, height: '44px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <Camera size={18} /> Chụp ảnh
             </button>
          </div>
          {selectedImage && (
            <div style={{ width: '100%', height: '100px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border)' }}>
               <img src={selectedImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ background: 'var(--warning)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
            <Send size={18} style={{marginRight:'8px'}}/> Gửi yêu cầu sửa chữa
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '800' }}>Lịch sử báo cáo</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {myIssues.map(iss => (
          <div key={iss.id} className="card-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
               <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>{iss.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{iss.date}</div>
               </div>
               <StatusBadge status={iss.status} />
            </div>
            {iss.image && (
               <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', border: '1px solid #f1f5f9', position: 'relative' }}>
                  <img 
                    src={iss.image} alt="Sự cố" 
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ display: 'none', width: '100%', height: '100%', background: '#f1f5f9', justifyContent: 'center', alignItems: 'center', color: '#94a3b8' }}><AlertCircle size={32} /></div>
               </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button onClick={() => setDetailIssue(iss)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Chi tiết xử lý <ChevronRight size={16} />
               </button>
            </div>
          </div>
        ))}
      </div>

      {detailIssue && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div className="card-premium" style={{ width: '100%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: '24px', position: 'relative', animation: 'modalSlideUp 0.3s ease-out' }}>
            <button onClick={() => setDetailIssue(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '20px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '8px' }}>Chi tiết xử lý</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontWeight: '600' }}>{detailIssue.title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
              <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: '#e2e8f0' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '10px', height: '10px', borderRadius: '5px', background: 'var(--success)' }} />
                <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Đã tiếp nhận yêu cầu</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{detailIssue.date} - Hệ thống</div>
              </div>
              {detailIssue.status === 'fixing' && (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-21px', top: '4px', width: '10px', height: '10px', borderRadius: '5px', background: 'var(--warning)', animation: 'pulse 1.5s infinite' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--warning)' }}>Đang trong quá trình sửa chữa</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>NV: TECH-991</div>
                </div>
              )}
            </div>
            <button onClick={() => setDetailIssue(null)} className="btn-primary" style={{ marginTop: '32px', height: '54px', borderRadius: '16px' }}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TenantProfile() {
  const { currentUser, tenants, updateTenant, rooms, logout, showConfirm, hideConfirm } = useAppStore();
  const tenant = tenants.find(t => t.id === currentUser.id);
  const room = rooms.find(r => r.id === tenant?.roomId);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...tenant });
  const profileFileRef = useRef(null);

  const [showMoveOutForm, setShowMoveOutForm] = useState(false);
  const [moveOutDate, setMoveOutDate] = useState('');
  const [moveOutReason, setMoveOutReason] = useState('');
  const { addLandlordNotification } = useAppStore();

  const requestSave = () => {
    showConfirm({
      title: 'Lưu thay đổi',
      message: 'Cập nhật thông tin cá nhân mới này?',
      onConfirm: () => {
        updateTenant(tenant.id, formData);
        setIsEditing(false);
        hideConfirm();
      },
      onCancel: () => hideConfirm()
    });
  };

  const requestCancel = () => {
    showConfirm({
      title: 'Hủy thay đổi',
      message: 'Mọi thông tin vừa nhập sẽ bị mất. Bạn muốn tiếp tục?',
      type: 'danger',
      onConfirm: () => {
        setFormData({ ...tenant });
        setIsEditing(false);
        hideConfirm();
      },
      onCancel: () => hideConfirm()
    });
  };

  const requestLogout = () => {
    showConfirm({
      title: 'Đăng xuất',
      message: 'Bạn muốn thoát khỏi phiên làm việc này?',
      type: 'danger', confirmText: 'Đăng xuất',
      onConfirm: () => logout(),
      onCancel: () => hideConfirm()
    });
  };

  const handleMoveOutSubmit = (e) => {
    e.preventDefault();
    if (!moveOutDate) return;
    showConfirm({
      title: 'Xác nhận Báo dọn đi',
      message: `Hệ thống sẽ gửi thông báo trả phòng vào ngày ${moveOutDate} đến Chủ trọ. Theo quy định, bạn cần báo trước ít nhất 30 ngày. Tiếp tục?`,
      type: 'warning',
      onConfirm: () => {
        addLandlordNotification({
          message: `Khách phòng ${room?.number || '---'} (${tenant.name}) gửi yêu cầu trả phòng vào ngày ${moveOutDate}. Lý do: ${moveOutReason || 'Không có'}`
        });
        setShowMoveOutForm(false);
        setTimeout(() => alert('Đã gửi thông báo thành công! Chủ trọ sẽ liên hệ để quyết toán cọc.'), 500);
      }
    });
  };

  if (!tenant) return <div className="card-premium">Không tìm thấy dữ liệu.</div>;

  if (showMoveOutForm) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setShowMoveOutForm(false)}>
            <X size={24} style={{ cursor: 'pointer' }} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Yêu Cầu Trả Phòng</span>
          </div>
        </header>

        <div className="app-content" style={{ padding: '24px', paddingBottom: '40px', overflowY: 'auto' }}>
          <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca', marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 8px', color: '#b91c1c', fontSize: '1rem', fontWeight: '800' }}>Quy định chung</h4>
            <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: 0, lineHeight: 1.5 }}>Khách thuê có trách nhiệm thông báo dọn đi <strong>trước 30 ngày</strong>. Trong trường hợp vi phạm, Khách có thể mất toàn bộ tiền cọc giữ chỗ theo đúng điều khoản Hợp đồng.</p>
          </div>

          <form onSubmit={handleMoveOutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label-premium">NGÀY DỰ KIẾN TRẢ PHÒNG</label>
              <input required type="date" value={moveOutDate} onChange={e => setMoveOutDate(e.target.value)} className="input-premium" />
            </div>
            
            <div>
              <label className="label-premium">LÝ DO DỌN ĐI (Tùy chọn)</label>
              <textarea placeholder="VD: Chuyển công tác..." value={moveOutReason} onChange={e => setMoveOutReason(e.target.value)} className="input-premium" style={{ minHeight: '100px', resize: 'none' }}/>
            </div>

            <button type="submit" className="btn-primary" style={{ height: '54px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', marginTop: '16px', background: '#ef4444', border: 'none', color: 'white', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)' }}>
               GỬI THÔNG BÁO CHO CHỦ TRỌ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Cá nhân & Bảo mật</h2>
         {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
               <Edit2 size={16} /> Chỉnh sửa
            </button>
         ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
               <button onClick={requestSave} style={{ background: 'var(--success)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <Save size={16} /> Lưu
               </button>
               <button onClick={requestCancel} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  <X size={16} /> Hủy
               </button>
            </div>
         )}
      </div>
      
      <input type="file" ref={profileFileRef} style={{ display: 'none' }} accept="image/*" />

      <div className="card-premium" style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div style={{ width: '84px', height: '84px', borderRadius: '24px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2.4rem', fontWeight: '900', boxShadow: '0 8px 16px rgba(37,99,235,0.2)' }}>
            {tenant.name.charAt(0)}
          </div>
          <div><h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900' }}>{tenant.name}</h3><p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontWeight: '600' }}>PHÒNG {room?.number || '---'}</p></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div><label className="label-premium">SỐ ĐIỆN THOẠI</label>{isEditing ? (<input className="input-premium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />) : (<div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{tenant.phone}</div>)}</div>
          <div><label className="label-premium">EMAIL</label>{isEditing ? (<input className="input-premium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />) : (<div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{tenant.email || 'Chưa cập nhật'}</div>)}</div>
          <div><label className="label-premium">QUÊ QUÁN</label>{isEditing ? (
             <select className="input-premium" value={formData.hometown} onChange={e => setFormData({...formData, hometown: e.target.value})} style={{ appearance: 'none', backgroundPosition: 'right 14px center', backgroundRepeat: 'no-repeat', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")' }}>
               <option value="Hà Nội">Hà Nội</option><option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option><option value="Đà Nẵng">Đà Nẵng</option><option value="Cần Thơ">Cần Thơ</option><option value="Khác">Khác...</option>
             </select>
          ) : (<div style={{ fontWeight: '600' }}>{tenant.hometown}</div>)}</div>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <label className="label-premium">ẢNH GIẤY TỜ TÙY THÂN</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <div onClick={() => profileFileRef.current.click()} style={{ flex: 1, height: '100px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#475569', border: '2px dashed #cbd5e1', cursor: 'pointer' }}>
                <Camera size={24} style={{marginBottom: '6px'}}/><span style={{fontSize: '0.75rem', fontWeight: '800'}}>Mặt trước</span>
              </div>
              <div onClick={() => profileFileRef.current.click()} style={{ flex: 1, height: '100px', background: '#f1f5f9', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#475569', border: '2px dashed #cbd5e1', cursor: 'pointer' }}>
                <Camera size={24} style={{marginBottom: '6px'}}/><span style={{fontSize: '0.75rem', fontWeight: '800'}}>Mặt sau</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => setShowMoveOutForm(true)} className="btn-primary" style={{ background: '#fef2f2', color: '#ef4444', border: '1px dashed #fecaca', boxShadow: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', height: '54px', borderRadius: '16px', marginTop: '24px' }}>
         <ShieldAlert size={20} /> <span style={{ fontWeight: '800' }}>BÁO DỌN ĐI / TRẢ PHÒNG</span>
      </button>

      <button onClick={requestLogout} className="btn-primary" style={{ background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', height: '54px', borderRadius: '16px', marginTop: '12px' }}>
         <LogOut size={20} /> <span style={{ fontWeight: '900' }}>ĐĂNG XUẤT</span>
      </button>
    </div>
  );
}
