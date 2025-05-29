import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)' }}>
    <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem', textShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      Welcome to FitnessPro Gym System
    </h1>
    <p style={{ color: '#e0e7ef', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: 480, textAlign: 'center' }}>
      Quản lý phòng gym, hội viên, thiết bị, huấn luyện viên và nhiều hơn nữa. Đăng nhập để trải nghiệm hệ thống quản lý chuyên nghiệp!
    </p>
    <Link to="/login" style={{
      background: 'linear-gradient(90deg, #059669, #2563eb)',
      color: '#fff',
      padding: '0.9rem 2.2rem',
      borderRadius: '2rem',
      fontWeight: 600,
      fontSize: '1.15rem',
      textDecoration: 'none',
      boxShadow: '0 2px 12px 0 rgba(37,99,235,0.18)',
      transition: 'background 0.2s, transform 0.2s',
      display: 'inline-block'
    }}
    onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb, #059669)'}
    onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #059669, #2563eb)'}
    >
      Đăng nhập ngay
    </Link>
  </div>
);

export default HomePage; 