import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalEditMember = ({ show, handleClose, memberEdit, onSave }) => {
    const [editedMember, setEditedMember] = useState({ ...memberEdit });

    useEffect(() => {
        setEditedMember({ ...memberEdit });
    }, [memberEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedMember(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!editedMember.name || !editedMember.address) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        if (!["Thường", "Vip"].includes(editedMember.membershipType)) {
            alert("Loại hội viên không hợp lệ!");
            return;
        }
        onSave(editedMember);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Chỉnh sửa hội viên</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">Họ và tên</label>
                        <input type="text" className="form-control" name="name" value={editedMember.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">Địa chỉ</label>
                        <input type="text" className="form-control" name="address" value={editedMember.address} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="membershipType" className="form-label">Loại hội viên</label>
                        <select className="form-select" name="membershipType" value={editedMember.membershipType} onChange={handleChange}>
                            <option value="Thường">Thường</option>
                            <option value="Vip">Vip</option>
                        </select>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Đóng</Button>
                <Button variant="primary" onClick={handleSubmit}>Lưu thay đổi</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEditMember;
