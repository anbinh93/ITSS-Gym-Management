import { useEffect, useState } from "react";
import { MdEdit, MdPersonAdd } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import ModalEditMember from './Modal/ModalEditMember';
import ModalAddMember from './Modal/ModalAddMember';
import './ClientList.css';
import { getMembershipsByCoach, updateMembershipStatus } from '../../services/membershipApi';
import authService from '../../services/authService';

export default function ClientList() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [coach] = useState(authService.getCurrentUser());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getMembershipsByCoach(coach?._id || coach?.id);
                if (res.success) {
                    setMemberships(res.data);
                } else {
                    setError(res.message || "Không thể tải danh sách hội viên");
                }
            } catch (err) {
                setError("Lỗi kết nối API");
            } finally {
                setLoading(false);
            }
        };
        if (coach) fetchData();
    }, [coach]);

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
        const nextId = memberships.length ? Math.max(...memberships.map(m => m._id)) + 1 : 1;
        setMemberships([...memberships, { ...newMember, _id: nextId }]);
    };

    const handleDeleteMember = (id) => {
        const member = memberships.find(m => m._id === id);
        const confirm = window.confirm(`Bạn có chắc muốn xóa hội viên "${member?.user?.name}" không?`);
        if (confirm) {
            const updated = memberships.filter(m => m._id !== id);
            setMemberships(updated);
        }
    };

    const handleSaveEditMember = (updatedMember) => {
        const updatedList = memberships.map(m =>
            m._id === updatedMember._id ? { ...updatedMember } : m
        );
        setMemberships(updatedList);
    };

    if (loading) return <div className="text-center">Đang tải danh sách hội viên...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Danh sách hội viên phụ trách</h4>
                <button className="btn btn-success" onClick={handleAddMember}>
                    <MdPersonAdd size={20} className="me-1" />
                    Thêm hội viên
                </button>
            </div>
            <div className="d-flex flex-wrap gap-3">
                {memberships.length === 0 ? (
                    <div className="text-muted">Chưa có hội viên nào được phân công.</div>
                ) : memberships.map((m) => {
                    // Tạo màu nền random dựa trên userId hoặc tên
                    const name = m.user?.name || '?';
                    const firstChar = name.charAt(0).toUpperCase();
                    const colorList = ['#6c5ce7', '#00b894', '#fdcb6e', '#0984e3', '#e17055', '#636e72', '#00cec9', '#d35400'];
                    let colorIdx = 0;
                    if (m.user?._id) {
                        colorIdx = m.user._id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colorList.length;
                    } else {
                        colorIdx = Math.floor(Math.random() * colorList.length);
                    }
                    const bgColor = colorList[colorIdx];
                    return (
                    <div key={m._id} className="member-card shadow-sm">
                        <div
                            className="member-avatar"
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                background: bgColor,
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 32,
                                fontWeight: 700,
                                margin: '0 auto 10px auto'
                            }}
                        >
                            {firstChar}
                        </div>
                        <div className="member-info">
                            <h5>{m.user?.name}</h5>
                            <p>Email: {m.user?.email}</p>
                            <p>Gói tập: {m.package?.name}</p>
                            <p>Thời hạn: {m.package?.durationInDays} ngày</p>
                            <p>Ngày đăng ký: {m.startDate ? new Date(m.startDate).toLocaleDateString() : ''}</p>
                            <p>Ngày kết thúc: {m.endDate ? new Date(m.endDate).toLocaleDateString() : ''}</p>
                            <p>Trạng thái thanh toán: {m.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                            <div className="mb-2">
                                <label className="me-2">Trạng thái học viên:</label>
                                <select
                                    className="form-select form-select-sm d-inline-block w-auto"
                                    value={m.status || 'active'}
                                    onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        await updateMembershipStatus(m._id, newStatus);
                                        // Cập nhật lại memberships sau khi đổi trạng thái
                                        const res = await getMembershipsByCoach(coach?._id || coach?.id);
                                        if (res.success) setMemberships(res.data);
                                    }}
                                >
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Ngừng hoạt động</option>
                                </select>
                            </div>
                            <div className="d-flex gap-2 mt-2">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditMember(m)}>
                                    <MdEdit /> Sửa
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteMember(m._id)}
                                >
                                    <FaRegTrashAlt /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )})}
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
