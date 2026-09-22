import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Download, MessageSquare, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';

export default function LeadsOrderCRM() {
  const { orders, showToast } = useStore();
  const [filter, setFilter] = useState('all'); // 'all' | 'completed' | 'abandoned'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'all' ? true : order.status === filter;
    const matchesSearch = 
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.phone || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const abandonedCount = orders.filter((o) => o.status === 'abandoned').length;

  const handleExportCSV = () => {
    const headers = ['Order/Lead ID', 'Name', 'Email', 'Phone', 'Amount', 'Status', 'Date', 'Payment Method'];
    const rows = orders.map(o => [o.id, o.customerName, o.email, o.phone, o.amount, o.status, o.date, o.paymentMethod]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivilPrelims_Aspirant_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Aspirants CRM leads exported to CSV successfully.');
  };

  const handleWhatsAppReminder = (order) => {
    showToast(`WhatsApp reminder dispatched to ${order.customerName} (${order.phone})`);
  };

  return (
    <div>
      {/* CRM Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Filter Tabs */}
        <div className="admin-tabs" style={{ marginBottom: 0 }}>
          <button 
            className={`admin-tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Aspirants <span className="tab-count-badge">{orders.length}</span>
          </button>
          <button 
            className={`admin-tab-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed Orders <span className="tab-count-badge" style={{ color: '#34d399' }}>{completedCount}</span>
          </button>
          <button 
            className={`admin-tab-btn ${filter === 'abandoned' ? 'active' : ''}`}
            onClick={() => setFilter('abandoned')}
          >
            Abandoned Checkouts <span className="tab-count-badge" style={{ color: '#fb7185' }}>{abandonedCount}</span>
          </button>
        </div>

        {/* Search & Export Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem', width: '220px', padding: '0.5rem 0.75rem 0.5rem 2.25rem', fontSize: '0.85rem' }}
              placeholder="Search aspirant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          </div>

          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* CRM Leads Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Aspirant Name & ID</th>
              <th>Contact Details</th>
              <th>Order / Interest</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date & Time</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No aspirant records found matching current criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isPaid = order.status === 'completed';
                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>{order.id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Phone size={13} style={{ color: 'var(--gold-primary)' }} />
                        <span>{order.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Mail size={13} />
                        <span>{order.email}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{order.paperTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Via {order.paymentMethod}</div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--gold-light)', fontSize: '0.95rem' }}>₹{order.amount}</strong>
                    </td>
                    <td>
                      <span className={`badge ${isPaid ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                        {isPaid ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        {isPaid ? 'Paid' : 'Abandoned'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.825rem' }}>{order.timestamp}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>{order.date}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!isPaid ? (
                        <button
                          className="btn btn-outline-gold btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
                          title="Send automated WhatsApp discount recovery message"
                          onClick={() => handleWhatsAppReminder(order)}
                        >
                          <MessageSquare size={14} />
                          Recover
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                          ✓ Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
