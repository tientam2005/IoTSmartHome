import React from 'react';
import { useAppStore } from '../store';
import { CheckCircle, Clock, Wrench, AlertCircle } from 'lucide-react';

export default function SuCo() {
  const { 
    issues, rooms, tenants, updateIssue, 
    addTenantNotification, showConfirm, hideConfirm 
  } = useAppStore();
  
  const getRoomNumber = (rId) => rooms.find(r => r.id === rId)?.number || 'Trống';
  const getTenantName = (tId) => tenants.find(t => t.id === tId)?.name || 'Khách';

  const handleUpdateStatus = (id, newStatus) => {
    let confirmationMessage = '';
    if (newStatus === 'fixing') {
      confirmationMessage = 'Chuyển trạng thái sự cố này sang "Đang xử lý"?';
    } else if (newStatus === 'completed') {
      confirmationMessage = 'Đánh dấu sự cố này là "Đã sửa xong"?';
    }

    showConfirm({
      title: 'Cập nhật trạng thái',
      message: confirmationMessage,
      type: newStatus === 'completed' ? 'info' : 'warning',
      onConfirm: () => {
        updateIssue(id, { status: newStatus });
        const issue = issues.find(i => i.id === id);
        if (issue) {
          const statusText = newStatus === 'fixing' ? 'đăng được xử lý' : 'đã hoàn tất';
          addTenantNotification({ 
            tenantId: issue.tenantId, 
            title: 'Cập nhật sự cố', 
            message: `Sự cố "${issue.title}" của bạn ${statusText}.` 
          });
        }
        hideConfirm();
      },
      onCancel: () => hideConfirm()
    });
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Quản lý sự cố</h2>
        <div style={{ background: '#eff6ff', color: 'var(--primary)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800' }}>
           {issues.filter(i => i.status !== 'completed').length} YÊU CẦU MỚI
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '24px', border: '1px solid var(--border)' }}>
             <CheckCircle size={48} color="var(--success)" style={{ opacity: 0.2, marginBottom: '16px' }} />
             <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Tuyệt vời! Không có sự cố nào cần xử lý.</p>
          </div>
        ) : issues.map(iss => (
          <div key={iss.id} className="card-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
               <span style={{ 
                 fontSize: '0.7rem', padding: '4px 10px', borderRadius: '10px', fontWeight: '800',
                 background: iss.status === 'pending' ? '#fee2e2' : iss.status === 'fixing' ? '#fff7ed' : '#dcfce7',
                 color: iss.status === 'pending' ? '#991b1b' : iss.status === 'fixing' ? '#9a3412' : '#166534'
               }}>
                 {iss.status === 'pending' ? 'YÊU CẦU MỚI' : iss.status === 'fixing' ? 'ĐANG XỬ LÝ' : 'ĐÃ HOÀN TẤT'}
               </span>
               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{iss.date}</span>
            </div>

            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)' }}>{iss.title}</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
               <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' }}>
                  {getRoomNumber(iss.roomId)}
               </div>
               <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800' }}>{getTenantName(iss.tenantId)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cần hỗ trợ ngay</div>
               </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
               {iss.status === 'pending' && (
                 <button onClick={() => handleUpdateStatus(iss.id, 'fixing')} style={{ flex: 1, height: '44px', borderRadius: '12px', background: '#f59e0b', color: 'white', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                   <Wrench size={18}/> Tiếp nhận & Sửa chữa
                 </button>
               )}
               {iss.status === 'fixing' && (
                 <button onClick={() => handleUpdateStatus(iss.id, 'completed')} style={{ flex: 1, height: '44px', borderRadius: '12px', background: 'var(--success)', color: 'white', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                   <CheckCircle size={18}/> Xác nhận Hoàn tất
                 </button>
               )}
               {iss.status === 'completed' && (
                 <div style={{ flex: 1, height: '44px', borderRadius: '12px', background: '#f1f5f9', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '800' }}>
                   <CheckCircle size={18}/> Đã giải quyết xong
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
