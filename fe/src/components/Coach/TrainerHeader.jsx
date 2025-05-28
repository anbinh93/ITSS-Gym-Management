import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrainerHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/'); // chuyển về homepage
    };

    return (
        <header className="bg-white shadow p-4 d-flex justify-content-between align-items-center">
            <h1 className="text-xl font-semibold">Trang Huấn Luyện Viên</h1>
            <div className="d-flex align-items-center">
                <div className="me-2 ">👤 HLV An Bình Nguyễn</div>
                <img
                    src="https://github.com/mdo.png"
                    alt="user"
                    width="60"
                    height="60"
                    className="rounded-circle"
                />
            </div>
        </header>
    );
};

export default TrainerHeader;