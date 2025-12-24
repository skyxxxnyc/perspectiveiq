
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardProps {
  contactsCount: number;
  companiesCount: number;
}

const activityData = [
  { name: 'Mon', calls: 20, emails: 35, meetings: 3 },
  { name: 'Tue', calls: 30, emails: 45, meetings: 5 },
  { name: 'Wed', calls: 25, emails: 50, meetings: 4 },
  { name: 'Thu', calls: 40, emails: 60, meetings: 7 },
  { name: 'Fri', calls: 35, emails: 55, meetings: 6 },
];

const leadData = [
  { name: 'Jan', leads: 400 },
  { name: 'Feb', leads: 300 },
  { name: 'Mar', leads: 500 },
  { name: 'Apr', leads: 450 },
  { name: 'May', leads: 600 },
  { name: 'Jun', leads: 550 },
];

const StatCard: React.FC<{ title: string; value: string; change: string; isPositive: boolean }> = ({ title, value, change, isPositive }) => (
  <div className="glass border-2 border-white/10 p-6 rounded-none shadow-glass-brutalist transition-transform hover:translate-y-[-4px]">
    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{title}</h3>
    <div className="flex items-baseline justify-between mt-3">
        <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
        <span className={`text-xs font-black px-2 py-1 border-2 border-black shadow-brutalist-sm ${isPositive ? 'bg-brand-accent text-gray-900' : 'bg-red-500 text-white'}`}>
            {change}
        </span>
    </div>
  </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="glass border-2 border-white/10 p-6 rounded-none shadow-glass-brutalist">
        <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest border-l-4 border-brand-primary pl-4">{title}</h3>
        <div className="h-64">
            {children}
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ contactsCount, companiesCount }) => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="New Contacts" value={contactsCount.toString()} change="+12.5%" isPositive={true} />
        <StatCard title="Companies Added" value={companiesCount.toString()} change="+8.2%" isPositive={true} />
        <StatCard title="Emails Sent" value="1,204" change="+20.1%" isPositive={true} />
        <StatCard title="Meetings Booked" value="48" change="-3.2%" isPositive={false} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Weekly Activity">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '2px solid #000', color: '#fff', fontWeight: 900 }} />
                    <Bar dataKey="emails" stackId="a" fill="#6366F1" stroke="#000" strokeWidth={1} />
                    <Bar dataKey="calls" stackId="a" fill="#22D3EE" stroke="#000" strokeWidth={1} />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Lead Growth">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                    <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '2px solid #000', color: '#fff', fontWeight: 900 }} />
                    <Line type="step" dataKey="leads" stroke="#22D3EE" strokeWidth={3} dot={{ r: 6, fill: '#6366F1', stroke: '#000', strokeWidth: 2 }} />
                </LineChart>
            </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
