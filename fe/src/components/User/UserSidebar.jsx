import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaChartLine, FaArchive, FaAudible, FaUser } from 'react-icons/fa';

const links = [
    { path: '/user/dashboard', label: 'Trang chủ', icon: <FaHome /> },
    { path: '/user/schedule', label: 'Lịch tập', icon: <FaCalendarAlt /> },
    { path: '/user/progress', label: 'Tiến độ', icon: <FaChartLine /> },
    { path: '/user/package', label: 'Gói tập', icon: <FaArchive /> },
    { path: '/user/evaluate', label: 'Đánh giá', icon: <FaAudible /> },
    { path: '/user/profile', label: 'Profile', icon: <FaUser /> },
];

const UserSidebar = () => (
    <div className="bg-white border-end p-4" style={{ width: '300px' }}>
        <h2 className="h5 mb-4">🏋️‍♂️ Hội viên</h2>
        <nav>
            {links.map(({ path, label, icon }) => (
                <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) => `d-flex align-items-center mb-3 text-decoration-none ${isActive ? 'text-primary fw-bold' : 'text-dark'}`}
                >
                    <span className="me-2">{icon}</span> {label}
                </NavLink>
            ))}
        </nav>
    </div>
);

export default UserSidebar;
