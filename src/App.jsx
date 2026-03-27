import React, { useState } from 'react';
import { 
  ShieldAlert, LogOut, Home, Users, Key, FileText, Bell, Wrench, Package, ListMinus, 
  User, Lock, Eye, EyeOff, Info, ChevronDown, ShieldCheck, Wallet 
} from 'lucide-react';
import Rooms from './components/Rooms';
import Tenants from './components/Tenants';
import Contracts from './components/Contracts';
import Invoices from './components/Invoices';
import Issues from './components/Issues';
import Announcements from './components/Announcements';
import Assets from './components/Assets';
import Cashflow from './components/Cashflow';
import AdminUsers from './components/AdminUsers';
import AdminPackages from './components/AdminPackages';
import AdminRoles from './components/AdminRoles';
import { TenantHome, TenantInvoices, TenantIssues, TenantProfile } from './components/TenantPortalViews';
import LandlordProfileView from './components/LandlordProfileView';
import { useAppStore } from './store';

const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none', background: '#f8fafc' };
const labelStyle = { fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '6px', display: 'block', fontWeight: '500' };
const btnStyle = { background: 'var(--primary)', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', justifyContent: 'center' };

// ============ LOGIN SCREEN ============
function LoginScreen() {
  const login = useAppStore(state => state.login);
  const [view, setView] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Call store login which now returns a result or sets state
    login(username, password);
    
    // Check if login failed after one tick (simple mock check)
    setTimeout(() => {
      const { currentUser } = useAppStore.getState();
      if (!currentUser) {
        setError('Tên đăng nhập không chính xác hoặc không tồn tại!');
      }
    }, 50);
  };

  if (view === 'register') {
    return (
      <div className="login-container" style={{ padding: '40px 28px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '2rem', marginBottom: '8px' }}>Tham gia SmartRent</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bắt đầu quản lý khu trọ của bạn chuyên nghiệp hơn</p>
        </div>

        <form onSubmit={(e) => {e.preventDefault(); setView('login'); alert('Đăng ký thành công! Vui lòng đăng nhập.');}} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
          <div style={{ textAlign: 'left' }}>
             <label style={{ ...labelStyle, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Họ và tên chủ trọ</label>
             <input required value={regName} onChange={e=>setRegName(e.target.value)} style={inputStyle} placeholder="Nguyễn Văn A" />
          </div>
          <div style={{ textAlign: 'left' }}>
             <label style={{ ...labelStyle, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Số điện thoại</label>
             <input required type="tel" value={regPhone} onChange={e=>setRegPhone(e.target.value)} style={inputStyle} placeholder="090..." />
          </div>
          <div style={{ textAlign: 'left' }}>
             <label style={{ ...labelStyle, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mật khẩu mới</label>
             <input required type="password" style={inputStyle} placeholder="••••••••" />
          </div>

          <button type="submit" style={{...btnStyle, padding: '16px', marginTop: '12px', borderRadius: '16px'}}>
            Đăng ký tài khoản
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
           <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Đã có tài khoản? <strong onClick={() => setView('login')} style={{color:'var(--primary)', cursor:'pointer'}}>Đăng nhập ngay</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container" style={{ padding: '40px 28px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', background: 'var(--background)' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ 
          width: '84px', height: '84px', background: 'white', borderRadius: '24px', 
          margin: '0 auto 20px', display: 'flex', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 12px 24px -6px rgba(37,99,235,0.25)',
          border: '1px solid var(--border)'
        }}>
           <Home size={42} color="var(--primary)" strokeWidth={2.5}/>
        </div>
        <h1 style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '2.8rem', margin: '0 0 8px 0', letterSpacing: '-0.04em' }}>SmartRent</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, fontWeight: '500' }}>Hệ thống Quản lý Lưu trú Chuyên nghiệp</p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
        <div style={{ textAlign: 'left' }}>
           <label style={{ ...labelStyle, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên đăng nhập</label>
           <div style={{ position: 'relative', marginTop: '6px' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                style={{ ...inputStyle, paddingLeft: '48px' }} 
                placeholder="admin, chu, hoặc khach" 
              />
           </div>
        </div>

        <div style={{ textAlign: 'left' }}>
           <label style={{ ...labelStyle, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mật khẩu</label>
           <div style={{ position: 'relative', marginTop: '6px' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                required 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                style={{ ...inputStyle, paddingLeft: '48px', paddingRight: '56px' }} 
                placeholder="••••••••" 
              />
              <div 
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </div>
           </div>
        </div>

        {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', padding: '12px', borderRadius: '12px' }}>
           <ShieldAlert size={16}/> {error}
        </div>}

        <button type="submit" style={{...btnStyle, padding: '16px', marginTop: '12px', boxShadow: '0 10px 15px -3px rgba(37,99,235,0.3)', borderRadius: '16px'}}>
          Đăng nhập
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
         <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '500', marginBottom: '12px' }}>Chưa có tài khoản? <strong onClick={() => setView('register')} style={{color:'var(--primary)', cursor:'pointer'}}>Đăng ký ngay</strong></div>
         <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '400' }}>Bạn gặp vấn đề khi truy cập? <strong style={{color:'var(--text-muted)', cursor:'pointer', textDecoration: 'underline'}}>Hỗ trợ</strong></span>
      </div>
    </div>
  );
}

// ============ TENANT PORTAL ============
function TenantPortal() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const logout = useAppStore(state => state.logout);
  const { currentUser, tenants, announcements, tenantNotifications, markTenantNotificationsAsRead } = useAppStore();
  const tenant = tenants.find(t => t.id === currentUser.id);

  const mySystemNotifs = tenantNotifications.filter(n => n.tenantId === tenant?.id);
  const myAnnouncements = announcements.filter(a => a.roomId === 'all' || a.roomId === tenant?.roomId).map(a => ({ ...a, isSystem: false }));
  
  const allNotifications = [
    ...mySystemNotifs.map(n => ({ ...n, isSystem: true })),
    ...myAnnouncements
  ].sort((a,b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));
  
  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  const handleOpenNotifications = () => {
    setShowNotifications(true);
    markTenantNotificationsAsRead(tenant?.id);
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Phòng' },
    { id: 'invoices', icon: FileText, label: 'Hoá đơn' },
    { id: 'issues', icon: Wrench, label: 'Sự cố' },
    { id: 'profile', icon: Users, label: 'Hồ sơ' }
  ];

  if (showNotifications) {
    return (
      <>
        <header className="app-header" style={{ padding: '16px 20px', background: 'var(--primary)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>
            <span style={{ fontSize: '1.5rem', marginTop: '-4px' }}>←</span>
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Thông báo ({allNotifications.length})</span>
          </div>
        </header>
        <main className="app-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {allNotifications.map(notif => (
              <div key={notif.id} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${notif.isSystem ? 'var(--primary)' : 'var(--warning)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: notif.isSystem ? 'var(--primary)' : 'var(--warning)', fontWeight: 'bold' }}>
                    {notif.isSystem ? 'Hệ thống' : 'Thông báo chung'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.date}</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px', color: 'var(--text-main)' }}>{notif.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{notif.isSystem ? notif.message : notif.content}</p>
              </div>
            ))}
            {allNotifications.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>Không có thông báo nào.</p>}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="app-header" style={{ padding: '16px 20px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{fontWeight: '800', fontSize: '1.2rem'}}>SmartRent cho Khách</div>
          <div style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase'}}>Tenant Experience</div>
        </div>
        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleOpenNotifications}>
            <Bell size={22} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', width: '16px', height: '16px', borderRadius: '8px', fontSize: '0.65rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', border: '2px solid var(--primary)' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div 
            onClick={() => setActiveTab('profile')}
            style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
            title="Xem hồ sơ"
          >
            {tenant?.name?.charAt(0).toUpperCase() || 'T'}
          </div>
        </div>
      </header>
      <main className="app-content">
        {activeTab === 'home' && <TenantHome />}
        {activeTab === 'invoices' && <TenantInvoices />}
        {activeTab === 'issues' && <TenantIssues />}
        {activeTab === 'profile' && <TenantProfile />}
      </main>
      <nav className="bottom-nav">
        {navItems.map(item => (
          <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <item.icon size={24} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </>
  );
}

// ============ ADMIN PORTAL ============
function AdminPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdminNotifications, setShowAdminNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const logout = useAppStore(state => state.logout);
  const { users, packages } = useAppStore();

  const navItems = [
    { id: 'dashboard', icon: ShieldAlert, label: 'Tổng quan' },
    { id: 'roles', icon: ShieldCheck, label: 'Phân Quyền' },
    { id: 'users', icon: Users, label: 'Đối tác' },
    { id: 'packages', icon: Package, label: 'Gói Cước' }
  ];

  return (
    <>
      <header className="app-header" style={{ padding: '16px 20px', background: 'linear-gradient(to right, #1e3a8a, #2563eb)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
           <div style={{ fontWeight: '900', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>SmartRent Admin</div>
           <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Platform Control</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', cursor: 'pointer', opacity: 0.8 }} onClick={() => setShowAdminNotifications(true)}>
            <Bell size={22} />
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', width: '12px', height: '12px', borderRadius: '6px', fontSize: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
              0
            </span>
          </div>
          <div 
            onClick={() => setShowAccountMenu(true)}
            style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', color: '#4ade80' }}
            title="Tài khoản"
          >
             AD
          </div>
        </div>
      </header>

      {/* Admin Notification Overlay */}
      {showAdminNotifications && (
        <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 200, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
           <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setShowAdminNotifications(false)}>
               <X size={24} style={{ cursor: 'pointer' }} />
               <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Thông báo Hệ thống</span>
             </div>
           </header>
           <div className="app-content" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ padding: '40px 20px', background: 'white', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                 <Bell size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '16px' }} />
                 <h4 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Gần đây không có biến động</h4>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>Toàn bộ hệ thống SaaS đang vận hành ổn định. Các thông báo về lỗi Server hoặc giao dịch thất bại sẽ xuất hiện tại đây.</p>
              </div>
           </div>
        </div>
      )}

      {/* Account Menu Overlay */}
      {showAccountMenu && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowAccountMenu(false)}>
           <div 
             className="card-premium" 
             style={{ width: '100%', background: 'white', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', padding: '32px 24px', animation: 'modalSlideUp 0.3s ease' }}
             onClick={(e) => e.stopPropagation()}
           >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                 <div style={{ width: '80px', height: '80px', borderRadius: '40px', background: '#f0fdf4', color: '#22c55e', fontSize: '2rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>AD</div>
                 <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Administrator</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sếp Tổng (System Owner)</p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <button className="btn-secondary" style={{ padding: '16px', borderRadius: '16px' }} onClick={() => setShowAccountMenu(false)}>Hồ sơ hệ thống</button>
                 <button 
                  onClick={logout}
                  style={{ padding: '16px', borderRadius: '16px', background: '#fee2e2', color: '#ef4444', border: 'none', fontWeight: '800', fontSize: '1rem' }}
                 >
                   Đăng xuất ngay
                 </button>
              </div>
              <button 
                onClick={() => setShowAccountMenu(false)}
                style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: '600' }}
              >
                Để sau
              </button>
           </div>
        </div>
      )}
      <main className="app-content">
        {activeTab === 'dashboard' && <AdminDashboardView />}
        {activeTab === 'roles' && <AdminRoles />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'packages' && <AdminPackages />}
      </main>
      <nav className="bottom-nav">
        {navItems.map(item => (
          <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <item.icon size={24} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </>
  );
}

// ============ LANDLORD PORTAL ============
function LandlordPortal() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSiteSelector, setShowSiteSelector] = useState(false);
  
  const logout = useAppStore(state => state.logout);
  const { landlordNotifications, markLandlordNotificationsAsRead, selectedSite, setSelectedSite } = useAppStore();

  const unreadCount = landlordNotifications.filter(n => !n.isRead).length;

  const handleOpenBell = () => {
    setShowNotifications(true);
    markLandlordNotificationsAsRead();
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Tổng quan' },
    { id: 'rooms', icon: Key, label: 'Phòng' },
    { id: 'tenants', icon: Users, label: 'Khách' },
    { id: 'invoices', icon: FileText, label: 'Hoá đơn' },
    { id: 'more', icon: ListMinus, label: 'Mở rộng' },
  ];

  if (showNotifications) {
    return (
      <>
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>
            <span style={{ fontSize: '1.5rem', marginTop: '-4px' }}>←</span>
            <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>Trung tâm Thông báo</span>
          </div>
        </header>
        <main className="app-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {landlordNotifications.map(notif => (
              <div key={notif.id} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>Tin hệ thống</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.date}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{notif.message}</p>
              </div>
            ))}
            {landlordNotifications.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>Chưa có thông báo nào từ khách.</p>}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="app-header" style={{ padding: '16px 20px', background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }} onClick={() => setShowSiteSelector(true)}>
           <div style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>{selectedSite}</div>
           <ChevronDown size={14} style={{ opacity: 0.8, marginTop: '2px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleOpenBell}>
            <Bell size={22} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', width: '16px', height: '16px', borderRadius: '8px', fontSize: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', border: '2px solid var(--primary)' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div 
            onClick={() => setActiveTab('profile')}
            style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
          >
             CH
          </div>
        </div>
      </header>
      
      <main className="app-content">
        {activeTab === 'home' && <LandlordDashboard setActiveTab={setActiveTab} />}
        {activeTab === 'rooms' && <Rooms />}
        {activeTab === 'tenants' && <Tenants />}
        {activeTab === 'invoices' && <Invoices />}
        
        {activeTab === 'more' && (
          <div>
            <h2 style={{ marginBottom: '16px' }}>Tiện ích mở rộng</h2>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="stat-card" onClick={() => setActiveTab('contracts')} style={{cursor:'pointer', textAlign: 'center', padding: '24px 16px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{display:'flex', justifyContent:'center', marginBottom: '12px'}}><FileText color="var(--primary)" size={32}/></div>
                 <h4 style={{fontSize: '0.95rem', fontWeight: '700'}}>Hợp đồng</h4>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('issues')} style={{cursor:'pointer', textAlign: 'center', padding: '24px 16px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{display:'flex', justifyContent:'center', marginBottom: '12px'}}><Wrench color="#ef4444" size={32}/></div>
                 <h4 style={{fontSize: '0.95rem', fontWeight: '700'}}>Sự cố</h4>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('announcements')} style={{cursor:'pointer', textAlign: 'center', padding: '24px 16px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{display:'flex', justifyContent:'center', marginBottom: '12px'}}><Bell color="#f59e0b" size={32}/></div>
                 <h4 style={{fontSize: '0.95rem', fontWeight: '700'}}>Thông báo</h4>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('profile')} style={{cursor:'pointer', textAlign: 'center', padding: '24px 16px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{display:'flex', justifyContent:'center', marginBottom: '12px'}}><User color="#3b82f6" size={32}/></div>
                 <h4 style={{fontSize: '0.95rem', fontWeight: '700'}}>Hồ sơ chủ trọ</h4>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('packages')} style={{cursor:'pointer', textAlign: 'center', padding: '24px 16px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{display:'flex', justifyContent:'center', marginBottom: '12px'}}><Package color="#8b5cf6" size={32}/></div>
                 <h4 style={{fontSize: '0.95rem', fontWeight: '700'}}>Gói dịch vụ</h4>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('assets')} style={{cursor:'pointer', textAlign: 'center', padding: '24px 16px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{display:'flex', justifyContent:'center', marginBottom: '12px'}}><Key color="#6366f1" size={32}/></div>
                 <h4 style={{fontSize: '0.95rem', fontWeight: '700'}}>Quản lý Tài sản</h4>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('cashflow')} style={{cursor:'pointer', textAlign: 'center', padding: '24px 16px', borderRadius: '20px', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                 <div style={{display:'flex', justifyContent:'center', marginBottom: '12px'}}><Wallet color="#22c55e" size={32}/></div>
                 <h4 style={{fontSize: '0.95rem', fontWeight: '700'}}>Sổ quỹ Thu/Chi</h4>
              </div>
            </div>
            <div style={{ marginTop: '20px', padding: '0 8px' }}>
               <button 
                 onClick={logout} 
                 style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#fee2e2', color: 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
               >
                 <LogOut size={20}/> Đăng xuất hệ thống
               </button>
            </div>
          </div>
        )}
        
        {activeTab === 'contracts' && <Contracts />}
        {activeTab === 'issues' && <Issues />}
        {activeTab === 'announcements' && <Announcements />}
        {activeTab === 'profile' && <LandlordProfileView mode="profile" />}
        {activeTab === 'packages' && <LandlordProfileView mode="package" />}
        {activeTab === 'assets' && <Assets />}
        {activeTab === 'cashflow' && <Cashflow />}
        
      </main>

      <nav className="bottom-nav">
        {navItems.map(item => (
          <div 
            key={item.id} 
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon size={22} />
            <span style={{marginTop: '4px'}}>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* --- SITE SELECTOR MODAL --- */}
      {showSiteSelector && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setShowSiteSelector(false)}>
           <div 
             onClick={e => e.stopPropagation()}
             style={{ width: '100%', maxWidth: '450px', background: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', animation: 'modalSlideUp 0.3s ease' }}
           >
              <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px', margin: '0 auto 20px' }} />
              <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>Chọn khu trọ quản lý</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 {['Khu Trọ Phát Tài', 'Khu Trọ Bình An', 'Khu Trọ Sen Hồng'].map(site => (
                   <div 
                     key={site}
                     onClick={() => { setSelectedSite(site); setShowSiteSelector(false); }}
                     style={{ padding: '16px', borderRadius: '12px', background: site === selectedSite ? '#eff6ff' : '#f8fafc', border: site === selectedSite ? '1px solid var(--primary)' : '1px solid #e2e8f0', color: site === selectedSite ? 'var(--primary)' : 'var(--text-main)', fontWeight: site === selectedSite ? 'bold' : '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                   >
                      {site}
                      {site === selectedSite && <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--primary)' }} />}
                   </div>
                 ))}
              </div>
              <button 
                onClick={() => setShowSiteSelector(false)}
                style={{ width: '100%', padding: '16px', marginTop: '24px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Đóng
              </button>
           </div>
        </div>
      )}
    </>
  );
}

function AdminDashboardView() {
  const { users, packages } = useAppStore();
  
  const activeLandlords = users.filter(u => u.status === 'active').length;
  const totalRevenue = users.filter(u => u.status === 'active').reduce((sum, u) => {
    const pkg = packages.find(p => p.id === u.packageId);
    return sum + (pkg ? pkg.price : 0);
  }, 0);

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.4rem', fontWeight: '800' }}>Hệ thống Quản trị</h2>
      
      {/* 1. PLATFORM REVENUE - PREMIUM CARD */}
      <div style={{ 
        padding: '24px', 
        borderRadius: '28px', 
        background: 'linear-gradient(135deg, #0f172a, #1e293b, #334155)', 
        color: 'white', 
        marginBottom: '24px', 
        boxShadow: '0 15px 35px rgba(0, 15, 42, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '60px' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Doanh thu gói phần mềm (SaaS)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '4px' }}>{totalRevenue.toLocaleString()}đ</div>
          <div style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
             Từ {activeLandlords} khách hàng đang hoạt động
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div style={adminStatCardStyle}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
           </div>
           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Chủ trọ</div>
           <div style={{ fontSize: '1.4rem', fontWeight: '900', marginTop: '4px' }}>{users.length} đối tác</div>
        </div>

        <div style={adminStatCardStyle}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} />
              </div>
           </div>
           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase' }}>Gói dịch vụ</div>
           <div style={{ fontSize: '1.4rem', fontWeight: '900', marginTop: '4px' }}>{packages.length} loại</div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px' }}>Hoạt động hệ thống gần đây</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: 'Chủ trọ mới đăng ký', desc: 'Khu Trọ Phát Tài vừa tạo tài khoản', time: '5 phút trước', icon: <Users size={16}/>, color: 'var(--primary)' },
            { title: 'Nâng cấp Gói dịch vụ', desc: 'SĐT 090... đã nâng cấp lên gói PRO', time: '1 giờ trước', icon: <Package size={16}/>, color: '#8b5cf6' },
            { title: 'Giao dịch thành công', desc: 'Đã nhận 150.000đ từ thanh toán gói tháng', time: '3 giờ trước', icon: <Info size={16}/>, color: '#22c55e' }
          ].map((act, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {act.icon}
              </div>
              <div>
                 <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{act.title}</div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{act.desc}</div>
                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '600' }}>{act.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LandlordDashboard({ setActiveTab }) {
  const { rooms, tenants, invoices, issues, transactions } = useAppStore();
  
  // Logic calculations
  const totalRooms = rooms.length;
  const emptyRooms = rooms.filter(r => r.status === 'available').length;
  const rentedRooms = rooms.filter(r => r.status === 'rented').length;
  
  // Financial Overview
  const totalExpected = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalDebt = totalExpected - totalCollected;
  
  const additionalIncome = transactions ? transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) : 0;
  const totalExpense = transactions ? transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) : 0;
  const realProfit = totalCollected + additionalIncome - totalExpense;
  
  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
  const pendingIssues = issues.filter(i => i.status === 'pending');

  return (
    <div style={{ paddingBottom: '20px' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.4rem', fontWeight: '800' }}>Tổng quan</h2>
      
      {/* 1. FINANCIAL HUB - ENHANCED */}
      <div style={{ 
        padding: '24px', 
        borderRadius: '28px', 
        background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
        color: 'white', 
        marginBottom: '24px', 
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%' }} />
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Lợi Nhuận Thực Tế Kỳ Này</div>
          <div style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-1px', color: '#4ade80' }}>{realProfit.toLocaleString()}đ</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
           <div style={{ background: 'rgba(34, 197, 94, 0.12)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 'bold' }}>DOANH THU</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px' }}>{(totalCollected + additionalIncome).toLocaleString()}đ</div>
              <div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8 }}>Gồm HĐ + Thu khác</div>
           </div>
           <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '16px', borderRadius: '18px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 'bold' }}>TỔNG CHI PHÍ & NỢ</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '4px' }}>{totalExpense.toLocaleString()}đ chi</div>
              <div style={{ fontSize: '0.7rem', marginTop: '4px', opacity: 0.8 }}>Khách còn nợ {totalDebt.toLocaleString()}đ</div>
           </div>
        </div>
      </div>

      {/* 2. OPERATIONAL GRID - CLICKABLE */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div 
          onClick={() => setActiveTab('rooms')}
          style={{ ...statCardActionStyle, borderLeft: '5px solid #ef4444' }}
        >
          <div style={statTitleStyle}>Phòng trống</div>
          <div style={{ ...statValueStyle, color: '#ef4444' }}>{emptyRooms}/{totalRooms}</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('rooms')}
          style={{ ...statCardActionStyle, borderLeft: '5px solid #22c55e' }}
        >
          <div style={statTitleStyle}>Đang cho thuê</div>
          <div style={{ ...statValueStyle, color: '#22c55e' }}>{rentedRooms}/{totalRooms}</div>
        </div>

        <div 
          onClick={() => setActiveTab('invoices')}
          style={{ ...statCardActionStyle, borderLeft: '5px solid #f59e0b', background: unpaidInvoices.length > 0 ? '#fffbeb' : 'white' }}
        >
          <div style={statTitleStyle}>HĐ quá hạn/Chưa thu</div>
          <div style={{ ...statValueStyle, color: '#f59e0b' }}>{unpaidInvoices.length} hồ sơ</div>
        </div>

        <div 
          onClick={() => setActiveTab('issues')}
          style={{ ...statCardActionStyle, borderLeft: '5px solid #3b82f6', background: pendingIssues.length > 0 ? '#eff6ff' : 'white' }}
        >
          <div style={statTitleStyle}>Sự cố cần sửa</div>
          <div style={{ ...statValueStyle, color: '#3b82f6' }}>{pendingIssues.length} yêu cầu</div>
        </div>
      </div>

      {/* 3. URGENT ACTIONS (TO-DO LIST) */}
      <div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Việc cần xử lý ngay</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>Tất cả công việc</span>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingIssues.slice(0, 2).map(issue => (
              <div key={issue.id} onClick={() => setActiveTab('issues')} style={todoItemStyle}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '5px', background: '#ef4444', flexShrink: 0 }} />
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>Sửa {issue.title} - Phòng {rooms.find(r=>r.id===issue.roomId)?.number}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Khách báo: {issue.date}</div>
                 </div>
                 <ChevronDown size={16} style={{ transform: 'rotate(-90deg)', opacity: 0.4 }} />
              </div>
            ))}
            
            {unpaidInvoices.slice(0, 2).map(inv => (
              <div key={inv.id} onClick={() => setActiveTab('invoices')} style={todoItemStyle}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '5px', background: '#f59e0b', flexShrink: 0 }} />
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>Thu tiền phòng {rooms.find(r=>r.id===inv.roomId)?.number}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tháng {inv.month} - {inv.totalAmount.toLocaleString()}đ</div>
                 </div>
                 <ChevronDown size={16} style={{ transform: 'rotate(-90deg)', opacity: 0.4 }} />
              </div>
            ))}

            {pendingIssues.length === 0 && unpaidInvoices.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                 Tuyệt vời! Không còn việc tồn đọng.
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

const statCardActionStyle = { padding: '20px 16px', background: 'white', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s ease', active: { transform: 'scale(0.98)' } };
const adminStatCardStyle = { padding: '20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--border)' };
const statTitleStyle = { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const statValueStyle = { fontSize: '1.2rem', fontWeight: '900' };
const todoItemStyle = { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'white', border: '1px solid var(--border)', borderRadius: '20px', cursor: 'pointer' };

function ConfirmModal() {
  const { confirmModal, hideConfirm } = useAppStore();
  if (!confirmModal.isOpen) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
      <div className="card-premium" style={{ width: '100%', maxWidth: '320px', padding: '24px', textAlign: 'center', animation: 'modalSlideUp 0.2s ease-out' }}>
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '28px', background: confirmModal.type === 'danger' ? '#fee2e2' : '#eff6ff', 
          color: confirmModal.type === 'danger' ? '#ef4444' : '#2563eb', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px' 
        }}>
          {confirmModal.type === 'danger' ? <ShieldAlert size={32} /> : <Info size={32} />}
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '8px' }}>{confirmModal.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>{confirmModal.message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => { confirmModal.onCancel?.(); hideConfirm(); }} 
            style={{ flex: 1, height: '48px', borderRadius: '14px', background: '#f1f5f9', border: 'none', fontWeight: '800', color: '#475569', cursor: 'pointer' }}
          >
            {confirmModal.cancelText || 'Hủy'}
          </button>
          <button 
            onClick={() => { confirmModal.onConfirm?.(); hideConfirm(); }} 
            style={{ flex: 1, height: '48px', borderRadius: '14px', background: confirmModal.type === 'danger' ? '#ef4444' : 'var(--primary)', color: 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}
          >
            {confirmModal.confirmText || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const currentUser = useAppStore(state => state.currentUser);

  return (
    <>
      {!currentUser ? <LoginScreen /> : (
        currentUser.role === 'admin' ? <AdminPortal /> : (
          currentUser.role === 'tenant' ? <TenantPortal /> : <LandlordPortal />
        )
      )}
      <ConfirmModal />
    </>
  );
}
