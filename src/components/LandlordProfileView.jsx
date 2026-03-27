import React from 'react';
import { useAppStore } from '../store';
import { User, Phone, Package, ShieldCheck, MapPin, Building } from 'lucide-react';

export default function LandlordProfileView({ mode = 'full' }) {
  const { currentUser, packages, selectedSite } = useAppStore();
  const pkg = packages.find(p => p.id === currentUser.packageId) || packages[1]; // Default to Pro if not found

  if (mode === 'package') {
    return (
      <div style={{ padding: '0 0 24px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: '800', textAlign: 'center' }}>Gói Dịch Vụ</h2>
        <div className="card-premium" style={{ padding: '28px', border: '2px solid var(--primary)', position: 'relative', overflow: 'hidden', background: 'white' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', padding: '8px 20px', fontSize: '0.8rem', fontWeight: 'bold', borderBottomLeftRadius: '20px', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>
            ĐANG KÍCH HOẠT
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
             <div style={{ width: '72px', height: '72px', borderRadius: '36px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px', border: '1px solid #dbeafe' }}>
               <Package size={36} />
             </div>
             <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{pkg.name}</h3>
             <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>Hạn dùng: <strong style={{color: 'var(--text-main)'}}>25/11/2026</strong></p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: '#f8fafc', borderRadius: '20px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Giới hạn phòng:</span>
                <span style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '800' }}>{pkg.maxRooms} phòng</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tính năng:</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '700', textAlign: 'right' }}>{pkg.features}</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Trạng thái:</span>
                <span style={{ fontSize: '0.9rem', padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontWeight: '800' }}>ỔN ĐỊNH</span>
             </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '16px', marginTop: '32px', borderRadius: '16px', fontSize: '1.1rem', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)' }}>
             NÂNG CẤP GÓI NGAY
          </button>
          
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
             * Bạn sẽ được giảm 10% khi gia hạn gói trước 15 ngày hết hạn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 24px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: '800', textAlign: 'center' }}>Hồ sơ Chủ trọ</h2>
      
      {/* Profile Header Card */}
      <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '24px', background: 'white', borderRadius: '24px' }}>
        {/* ICON AXIS START */}
        <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: '#eff6ff', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--primary)', border: '2px solid #dbeafe' }}>
          <User size={40} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>Chủ Trọ Nguyễn</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Chủ hệ thống</p>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <ShieldCheck size={16} /> Tài khoản đã xác minh
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Unified Icon Row Component logic */}
        {[
          { icon: <Phone size={22} />, label: 'SỐ ĐIỆN THOẠI', value: currentUser.phone || '0900000001' },
          { icon: <Building size={22} />, label: 'TÊN KHU TRỌ', value: selectedSite },
          { icon: <MapPin size={22} />, label: 'ĐỊA CHỈ QUẢN LÝ', value: 'Quận 1, TP Hồ Chí Minh' }
        ].map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '18px 24px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', border: '1px solid var(--border)' }}>
             <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{item.icon}</div>
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.value}</div>
             </div>
          </div>
        ))}

        {/* Remove Package Section from Profile View */}
        <div style={{ marginTop: '24px', padding: '20px', background: '#eff6ff', borderRadius: '20px', color: 'var(--primary)', textAlign: 'center', border: '1px dashed var(--primary)' }}>
           <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Để quản lý gói cước hoặc nâng cấp, vui lòng vào mục "Gói dịch vụ" trong Tiện ích mở rộng.</div>
        </div>
      </div>
    </div>
  );
}

const rowStyle = { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' };
const iconBoxStyle = { width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const labelLabel = { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' };
const valueLabel = { fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)' };
