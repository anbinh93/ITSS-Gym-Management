import React from 'react';

const TrainerHeader = () => (
    <header className="bg-white shadow p-4 d-flex justify-content-between align-items-center">
        <h1 className="text-xl font-semibold">Trang Huấn Luyện Viên</h1>
        <div className="d-flex align-items-center">
            <div className="me-2 ">👤 HLV Patrick Nguyễn</div>
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

export default TrainerHeader;