import React from 'react';
import TrainerLayout from '../../components/Coach/TrainerLayout';

const Dashboard = () => (
    <TrainerLayout>
        <div className="h4 mb-4">
            <img
                src="/coach-dashboard.png"
                alt="Coach Dashboard"
                style={{ borderRadius: '10px' }}
            />
        </div>
    </TrainerLayout>
);

export default Dashboard;