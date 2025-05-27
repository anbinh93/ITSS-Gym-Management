import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header
      className="bg-white shadow p-4 d-flex justify-content-between align-items-center fixed-top"
      style={{ zIndex: 1000, marginLeft: '250px', width: 'calc(100% - 250px)', height: 88 }}
    >
      <h1 className="fs-4 fw-semibold mb-0">Trang nhân viên quản lý</h1>
      <div className="d-flex align-items-center">
        <div className="me-3">👤 Staff Patrick Nguyễn</div>
        <Dropdown>
          <Dropdown.Toggle
            as="img"
            src="https://github.com/mdo.png"
            alt="user"
            width="40"
            height="40"
            className="rounded-circle"
            style={{ cursor: 'pointer' }}
          />
          <Dropdown.Menu align="end">
            <Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;