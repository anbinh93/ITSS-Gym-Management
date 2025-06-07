import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const UserHeader = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        localStorage.removeItem('gym_token');
        localStorage.removeItem('gym_user');
        navigate('/login');
    };

    return (
        <header className="bg-white shadow p-4 d-flex justify-content-between align-items-center">
            <h1 className="text-xl font-semibold">Trang Hội Viên</h1>
            <div className="d-flex align-items-center">
                <div className="me-2 ">👤 Hội viên {user?.name || user?.email || '---'}</div>
                <img
                    src="https://github.com/mdo.png"
                    alt="user"
                    width="60"
                    height="60"
                    className="rounded-circle"
                />
                <button
                    className="btn btn-outline-danger ms-3"
                    style={{ height: 40 }}
                    onClick={handleLogout}
                >
                    Đăng xuất
                </button>
            </div>
        </header>
    );
};

export default UserHeader;