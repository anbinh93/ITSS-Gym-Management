import React, { useState } from 'react';
import { Info, Users, Shield, Briefcase, User, X } from 'lucide-react';

const DemoInstructions = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@gym.com',
      password: 'admin123',
      description: 'Full system access',
      icon: <Shield size={20} className="text-danger" />,
      color: 'danger'
    },
    {
      role: 'Staff',
      email: 'staff@gym.com',
      password: 'staff123',
      description: 'Customer & operations management',
      icon: <Briefcase size={20} className="text-warning" />,
      color: 'warning'
    },
    {
      role: 'Coach',
      email: 'coach@gym.com',
      password: 'coach123',
      description: 'Training programs & client management',
      icon: <Users size={20} className="text-success" />,
      color: 'success'
    },
    {
      role: 'Member',
      email: 'user@gym.com',
      password: 'user123',
      description: 'Personal dashboard & progress tracking',
      icon: <User size={20} className="text-info" />,
      color: 'info'
    }
  ];

  return (
    <div className="demo-instructions-overlay">
      <div className="demo-instructions-modal">
        <div className="demo-header">
          <div className="d-flex align-items-center">
            <Info size={24} className="text-primary me-2" />
            <h4 className="mb-0">FitnessPro Demo System</h4>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setIsVisible(false)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="demo-content">
          <p className="text-muted mb-4">
            Welcome to the FitnessPro Gym Management System! Use any of the demo accounts below to explore different user roles and features.
          </p>

          <div className="row g-3">
            {demoAccounts.map((account, index) => (
              <div key={index} className="col-md-6">
                <div className={`demo-account-card border-${account.color}`}>
                  <div className="d-flex align-items-center mb-2">
                    {account.icon}
                    <h6 className="mb-0 ms-2">{account.role}</h6>
                  </div>
                  <div className="demo-credentials">
                    <div className="credential-item">
                      <small className="text-muted">Email:</small>
                      <code className="ms-2">{account.email}</code>
                    </div>
                    <div className="credential-item">
                      <small className="text-muted">Password:</small>
                      <code className="ms-2">{account.password}</code>
                    </div>
                  </div>
                  <small className="text-muted">{account.description}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="demo-features mt-4">
            <h6>System Features:</h6>
            <ul className="feature-list">
              <li>✅ Role-based access control</li>
              <li>✅ Modern responsive design</li>
              <li>✅ Real-time authentication</li>
              <li>✅ Dashboard analytics</li>
              <li>✅ Member management</li>
              <li>✅ Equipment tracking</li>
            </ul>
          </div>

          <div className="demo-footer mt-4 pt-3 border-top">
            <small className="text-muted">
              <strong>Note:</strong> This is a demo system with mock data. All authentication is handled locally without a backend server.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoInstructions; 