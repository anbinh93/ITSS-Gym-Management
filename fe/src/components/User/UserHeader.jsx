import React from 'react';

const UserHeader = () => (
    <header className="bg-white shadow p-4 d-flex justify-content-between align-items-center">
        <h1 className="text-xl font-semibold">Trang Hội Viên</h1>
        <div className="d-flex align-items-center">
            <div className="me-2 ">👤 Hội viên Patrick Nguyễn</div>
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

export default UserHeader;