import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalAddMember = ({ show, handleClose, onAddMember }) => {
    const [newMember, setNewMember] = useState({
        name: '',
        address: '',
        membershipType: 'Thường',
        image: 'https://via.placeholder.com/50',  // Đặt ảnh mặc định
        createdAt: new Date().toISOString().split('T')[0]
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setNewMember(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e) => {
        const { id, files } = e.target;
        const file = files[0];
        const imageUrl = file ? URL.createObjectURL(file) : newMember.image;
        setNewMember(prev => ({ ...prev, [id]: file, image: imageUrl }));
    };

    const handleSubmit = () => {
        if (!newMember.name || !newMember.address) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        onAddMember(newMember);
        handleClose();
        setNewMember({
            name: '',
            address: '',
            membershipType: 'Thường',
            image: 'https://via.placeholder.com/50',
            createdAt: new Date().toISOString().split('T')[0]
        });
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Thêm hội viên mới</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Họ và tên</label>
                        <input type="text" className="form-control" id="name" value={newMember.name} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">Địa chỉ</label>
                        <input type="text" className="form-control" id="address" value={newMember.address} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="membershipType" className="form-label">Loại hội viên</label>
                        <select className="form-select" id="membershipType" value={newMember.membershipType} onChange={handleChange}>
                            <option value="Thường">Thường</option>
                            <option value="Vip">Vip</option>
                        </select>
                    </div>
                    {/* Thêm trường tải ảnh */}
                    <div className="mb-3">
                        <label htmlFor="image" className="form-label">Ảnh hội viên</label>
                        <input type="file" className="form-control" id="image" onChange={handleFileChange} />
                    </div>
                    {/* Thêm trường ngày đăng ký */}
                    <div className="mb-3">
                        <label htmlFor="createdAt" className="form-label">Ngày đăng ký</label>
                        <input type="date" className="form-control" id="createdAt" value={newMember.createdAt} onChange={handleChange} />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="success" onClick={handleSubmit}>
                    Thêm mới
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalAddMember;
