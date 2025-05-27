import React from 'react';
import { FaHome, FaTools, FaUsers } from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import { MdRoomPreferences } from "react-icons/md";
import { MdOutlineSubtitles } from "react-icons/md";
import { MdOutlineFeedback } from "react-icons/md";


const links = [
  { path: '/staff/dashboard', label: 'Trang chủ', icon: <FaHome /> },
  { path: '/staff/customer', label: 'Quản lý hội viên', icon: <FaUsers /> }, // chung
  { path: '/staff/device', label: 'Quản lý thiết bị', icon: <FaTools /> }, // chung
  { path: '/staff/gymroom', label: 'Quản lý phòng tập', icon: <MdRoomPreferences /> }, // chung
  { path: '/staff/subscription-management', label: 'Đăng ký và gia hạn', icon: <MdOutlineSubtitles  /> },
  { path: '/staff/feedback-management', label: 'Quản lý phản hồi', icon: <MdOutlineFeedback /> }, // chung
];
 
const StaffSidebar = () => (
  <div className="bg-white border-end p-4" style={{ width: '250px', height: '100vh' }}>
    <h2 className="h5 mb-4">🏋️‍♂️ Staff Manager </h2>
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

export default StaffSidebar;