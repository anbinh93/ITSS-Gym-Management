import React from 'react';
import { FaHome, FaTools, FaUsers, FaDochub, FaRegCalendarTimes } from "react-icons/fa";
import { NavLink } from 'react-router-dom';
import { MdRoomPreferences } from "react-icons/md";
import { LuPackage } from "react-icons/lu";
import { MdOutlineFeedback } from "react-icons/md";


const links = [
  { path: '/admin/dashboard', label: 'Trang chủ', icon: <FaHome /> },
  { path: '/admin/staff', label: 'Quản lý nhân sự', icon: <FaDochub /> },
  { path: '/admin/customer', label: 'Quản lý hội viên', icon: <FaUsers /> }, // chung
  { path: '/admin/device', label: 'Quản lý thiết bị', icon: <FaTools /> }, // chung
  { path: '/admin/gymroom', label: 'Quản lý phòng tập', icon: <MdRoomPreferences /> }, // chung
  { path: '/admin/report', label: 'Thống kê và Báo cáo', icon: <FaRegCalendarTimes /> },
  { path: '/admin/package-management', label: 'Quản lý gói tập', icon: <LuPackage /> },
  { path: '/admin/feedback-management', label: 'Quản lý phản hồi', icon: <MdOutlineFeedback /> }, // chung
];
 
const AdminSidebar = () => (
  <div className="bg-white border-end p-4" style={{ width: '250px', height: '100vh' }}>
    <h2 className="h5 mb-4">🏋️‍♂️ Administrator </h2>
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

export default AdminSidebar;