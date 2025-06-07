import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaCalendarAlt, FaDumbbell, FaUser, FaChartLine } from 'react-icons/fa';

const links = [
    { path: '/coach/dashboard', label: 'Trang chủ', icon: <FaHome /> },
    { path: '/coach/clients', label: 'Hội viên', icon: <FaUsers /> },
    { path: '/coach/schedule', label: 'Lịch tập', icon: <FaCalendarAlt /> },
    { path: '/coach/training-programs', label: 'Chương trình tập', icon: <FaDumbbell /> },
    { path: '/coach/progress', label: 'Tiến độ', icon: <FaChartLine /> },
    { path: '/coach/profile', label: 'Profile', icon: <FaUser /> },
];

const TrainerSidebar = () => (
    <div className="bg-white border-end p-4" style={{ width: '300px'}}>
        <h2 className="h5 mb-4">🏋️‍♂️ Huấn luyện viên</h2>
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

export default TrainerSidebar;
