import { useState } from "react";
import { MdEdit, MdPersonAdd } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import ModalEditMember from './Modal/ModalEditMember';
import ModalAddMember from './Modal/ModalAddMember';
import './ClientList.css';

export default function ClientList() {
    const [members, setMembers] = useState([
        {
            id: 1,
            name: "Vũ Ngọc Duku",
            image: "https://randomuser.me/api/portraits/men/1.jpg",
            address: "Thái Bình",
            membershipType: "Thường",
            createdAt: "2021-01-15",
        },
        {
            id: 2,
            name: "Wean Lee",
            image: "https://randomuser.me/api/portraits/women/2.jpg",
            address: "Thanh Hóa",
            membershipType: "Vip",
            createdAt: "2021-02-20",
        },
        {
            id: 3,
            name: "Quyết Strong",
            image: "https://randomuser.me/api/portraits/women/2.jpg",
            address: "Thái Bình",
            membershipType: "Vip",
            createdAt: "2021-12-03",
        },
        {
            id: 4,
            name: "Đặng Hải Anh",
            image: "https://randomuser.me/api/portraits/women/2.jpg",
            address: "Hà Nội",
            membershipType: "Vip",
            createdAt: "2021-10-10",
        },
        {
            id: 5,
            name: "Too Min Anh",
            image: "https://randomuser.me/api/portraits/women/2.jpg",
            address: "Hà Nội",
            membershipType: "Thường",
            createdAt: "2025-5-5",
        },
        {
            id: 6,
            name: "An Bình",
            image: "https://randomuser.me/api/portraits/women/2.jpg",
            address: "Hà Tĩnh",
            membershipType: "Vip",
            createdAt: "2025-10-5",
        },
    ]);

    const [isShowModalEditMember, setIsShowModalEditMember] = useState(false);
    const [isShowModalAddMember, setIsShowModalAddMember] = useState(false);
    const [memberEdit, setMemberEdit] = useState({});

    const handleEditMember = (member) => {
        setMemberEdit(member);
        setIsShowModalEditMember(true);
    };

    const handleAddMember = () => {
        setIsShowModalAddMember(true);
    };

    const handleCloseEdit = () => {
        setIsShowModalEditMember(false);
    };

    const handleCloseAdd = () => {
        setIsShowModalAddMember(false);
    };

    const handleAddMemberSubmit = (newMember) => {
        const nextId = members.length ? Math.max(...members.map(m => m.id)) + 1 : 1;
        setMembers([...members, { ...newMember, id: nextId }]);
    };

    const handleDeleteMember = (id) => {
        const member = members.find(m => m.id === id);
        const confirm = window.confirm(`Bạn có chắc muốn xóa hội viên "${member.name}" không?`);
        if (confirm) {
            const updated = members.filter(m => m.id !== id);
            setMembers(updated);
        }
    };

    const handleSaveEditMember = (updatedMember) => {
        const updatedList = members.map(m =>
            m.id === updatedMember.id ? { ...updatedMember } : m
        );
        setMembers(updatedList);
    };

    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Danh sách hội viên</h4>
                <button className="btn btn-success" onClick={handleAddMember}>
                    <MdPersonAdd size={20} className="me-1" />
                    Thêm hội viên
                </button>
            </div>

            <div className="d-flex flex-wrap gap-3">
                {members.map((member) => (
                    <div key={member.id} className="member-card shadow-sm">
                        <img src={member.image} alt={member.name} className="member-image" />
                        <div className="member-info">
                            <h5>{member.name}</h5>
                            <p>Địa chỉ: {member.address}</p>
                            <p>Loại: {member.membershipType}</p>
                            <p>Ngày đăng ký: {member.createdAt}</p>
                            <div className="d-flex gap-2 mt-2">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditMember(member)}>
                                    <MdEdit /> Sửa
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteMember(member.id)}
                                >
                                    <FaRegTrashAlt /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ModalEditMember
                show={isShowModalEditMember}
                handleClose={handleCloseEdit}
                memberEdit={memberEdit}
                onSave={handleSaveEditMember}
            />

            <ModalAddMember
                show={isShowModalAddMember}
                handleClose={handleCloseAdd}
                onAddMember={handleAddMemberSubmit}
            />
        </div>
    );
}
