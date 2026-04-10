import React from 'react';
import AdminDashboard from '../../../PagesDisplay/AdminDashboard';

export default function AdminDashboardApp() {
    return (
        <div style={{ height: '100%', overflow: 'auto', backgroundColor: 'transparent' }}>
            <AdminDashboard embedded />
        </div>
    );
}
