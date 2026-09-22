import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { IndianRupee, ShoppingBag, UserX, TrendingUp, BarChart3, Clock } from 'lucide-react';

export default function MetricsOverview() {
  const { orders, config, activeVisitors } = useStore();
  const [timeframe, setTimeframe] = useState('today');

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const abandonedLeads = orders.filter((o) => o.status === 'abandoned');

  const totalRevenue = completedOrders.reduce((acc, curr) => acc + (curr.amount || config.currentPrice), 0);
  const totalLeads = orders.length || 1;
  const conversionRate = ((completedOrders.length / totalLeads) * 100).toFixed(1);

  // Hourly simulated telemetry points
  const hourlyData = [
    { hour: '12 PM', visitors: 34, sales: 3 },
    { hour: '02 PM', visitors: 48, sales: 6 },
    { hour: '04 PM', visitors: 62, sales: 9 },
    { hour: '06 PM', visitors: 58, sales: 8 },
    { hour: '08 PM', visitors: 82, sales: 14 },
    { hour: '10 PM', visitors: 96, sales: 19 },
    { hour: 'Now', visitors: activeVisitors, sales: completedOrders.length }
  ];

  const maxVisitors = 110;

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* 4 Stat Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Metric 1: Total Revenue */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--gold-light)' }}>
            <IndianRupee size={26} />
          </div>
          <div>
            <div className="stat-val">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="stat-title">Gross Paper Sales Revenue</div>
          </div>
        </div>

        {/* Metric 2: Completed Purchases */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
            <ShoppingBag size={26} />
          </div>
          <div>
            <div className="stat-val">{completedOrders.length}</div>
            <div className="stat-title">Completed Orders (Paid)</div>
          </div>
        </div>

        {/* Metric 3: Abandoned Checkouts */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#fb7185' }}>
            <UserX size={26} />
          </div>
          <div>
            <div className="stat-val">{abandonedLeads.length}</div>
            <div className="stat-title">Abandoned Checkouts (Recoverable)</div>
          </div>
        </div>

        {/* Metric 4: Conversion Rate */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="stat-val">{conversionRate}%</div>
            <div className="stat-title">Checkout Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Real-time Hourly Velocity Graph */}
      <div className="card" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--gold-light)' }} />
              <h3 style={{ fontSize: '1.15rem' }}>Real-time Traffic & Purchase Velocity</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Hourly trends of aspirants entering the ₹99 funnel versus completed order conversions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--gold-primary)' }} />
              <span style={{ color: '#cbd5e1' }}>Live Browsing Traffic</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
              <span style={{ color: '#cbd5e1' }}>Paid Orders</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${hourlyData.length}, 1fr)`,
          gap: '1rem',
          height: '140px',
          alignItems: 'flex-end',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.5rem'
        }}>
          {hourlyData.map((d, i) => {
            const heightPercent = Math.round((d.visitors / maxVisitors) * 100);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--gold-light)', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {d.visitors}
                </div>
                <div style={{
                  width: '100%',
                  maxWidth: '36px',
                  height: `${heightPercent}%`,
                  background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.8) 0%, rgba(245, 158, 11, 0.2) 100%)',
                  borderRadius: '6px 6px 2px 2px',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  position: 'relative',
                  transition: 'height 0.4s ease'
                }}>
                  {/* Overlay for orders */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${Math.min(100, d.sales * 5)}%`,
                    background: '#10b981',
                    borderRadius: '0 0 2px 2px',
                    opacity: 0.85
                  }} />
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
                  {d.hour}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
