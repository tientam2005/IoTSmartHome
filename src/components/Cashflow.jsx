import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ArrowDownRight, ArrowUpRight, Plus, Trash2, X, Wallet, Calendar, FileText } from 'lucide-react';

export default function Cashflow() {
  const { transactions, addTransaction, deleteTransaction, showConfirm } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('vi-VN'));

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !note) return;
    
    showConfirm({
      title: 'Xác nhận tạo phiếu',
      message: `Tạo phiếu ${type === 'income' ? 'THU' : 'CHI'} với số tiền ${Number(amount).toLocaleString()}đ?`,
      type: 'info',
      onConfirm: () => {
        addTransaction({ type, amount: Number(amount), date, note });
        setShowForm(false);
        setAmount('');
        setNote('');
      }
    });
  };

  const handleDelete = (id) => {
    showConfirm({
      title: 'Xóa giao dịch',
      message: 'Bạn có chắc chắn muốn xóa giao dịch này? Hành động không thể hoàn tác.',
      type: 'danger',
      onConfirm: () => deleteTransaction(id)
    });
  };

  if (showForm) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'var(--background)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'modalSlideUp 0.3s ease' }}>
        <header className="app-header" style={{ padding: '16px 20px', background: 'white', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setShowForm(false)}>
            <X size={24} />
            <span style={{ fontWeight: '800', fontSize: '1.2rem' }}>Thêm Phiếu Mới</span>
          </div>
        </header>
        
        <div className="app-content" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', gap: '12px', background: '#f1f5f9', padding: '6px', borderRadius: '16px' }}>
              <div 
                onClick={() => setType('expense')}
                style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s', background: type === 'expense' ? 'white' : 'transparent', color: type === 'expense' ? '#ef4444' : 'var(--text-muted)', boxShadow: type === 'expense' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}>
                Phiếu Chi
              </div>
              <div 
                onClick={() => setType('income')}
                style={{ flex: 1, padding: '12px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', transition: 'all 0.2s', background: type === 'income' ? 'white' : 'transparent', color: type === 'income' ? '#22c55e' : 'var(--text-muted)', boxShadow: type === 'income' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none' }}>
                Phiếu Thu
              </div>
            </div>

            <div>
              <label style={labelStyle}>Ngày giao dịch</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input required value={date} onChange={e => setDate(e.target.value)} style={{...inputStyle, paddingLeft: '48px'}}/>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Số tiền (VNĐ)</label>
              <div style={{ position: 'relative' }}>
                <Wallet size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input required type="number" placeholder="VD: 500000" value={amount} onChange={e => setAmount(e.target.value)} style={{...inputStyle, paddingLeft: '48px', fontSize: '1.2rem', fontWeight: 'bold', color: type === 'expense' ? '#ef4444' : '#22c55e'}}/>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Lý do thu / chi</label>
              <div style={{ position: 'relative' }}>
                <FileText size={20} style={{ position: 'absolute', left: 16, top: 20, color: 'var(--text-muted)' }} />
                <textarea required placeholder="VD: Sửa máy lạnh phòng 102..." value={note} onChange={e => setNote(e.target.value)} style={{...inputStyle, paddingLeft: '48px', minHeight: '100px', resize: 'none'}}/>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '16px', borderRadius: '16px', fontSize: '1.1rem', marginTop: '16px', background: type === 'income' ? '#22c55e' : '#ef4444', boxShadow: type === 'income' ? '0 8px 20px rgba(34,197,94,0.3)' : '0 8px 20px rgba(239,68,68,0.3)' }}>
               HOÀN TẤT
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Sổ Quỹ Giao Dịch</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px' }}><Plus size={18}/> Thêm Phiếu</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
         <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '24px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Tổng Thu Khác</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#16a34a' }}>+{income.toLocaleString()}đ</div>
         </div>
         <div style={{ padding: '20px', background: '#fef2f2', borderRadius: '24px', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Tổng Chi Phí</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#dc2626' }}>-{expense.toLocaleString()}đ</div>
         </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {transactions.map(t => (
          <div key={t.id} style={{ padding: '16px 20px', background: 'white', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: t.type === 'income' ? '#dcfce7' : '#fee2e2', color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                  {t.type === 'income' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
               </div>
               <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>{t.note}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>{t.date}</div>
               </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ fontSize: '1.1rem', fontWeight: '900', color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}đ
               </div>
               <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', opacity: 0.6 }}><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có giao dịch thu/chi nào.</div>
        )}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', outline: 'none' };
const labelStyle = { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', fontWeight: '700' };
