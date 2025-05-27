import React from 'react';
import UserLayout from '../../components/User/UserLayout';

const UserDashboard = () => (
    <UserLayout>
        <div className="h4 mb-4">
            <img
                src="/coach-dashboard.png"
                alt="Coach Dashboard"
                style={{ borderRadius: '10px' }}
            />
        </div>
    </UserLayout>
);

export default UserDashboard;