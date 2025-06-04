import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { ChevronDown, Search, Activity, TrendingUp } from 'lucide-react';
import { getAllUsers, getUserProgress } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#FF8042', '#0088FE'];

const ProgressDashboard = () => {
    const [searchText, setSearchText] = useState('');
    const [showMembersList, setShowMembersList] = useState(false);
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberData, setMemberData] = useState({ weightHeight: [], calories: [], bodyFat: [] });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getAllUsers().then(res => {
            if (res && (res.users || res.data)) {
                const users = res.users || res.data;
                const userList = users.filter(u => u.role === 'user');
                setMembers(userList);
                if (userList.length > 0) setSelectedMember(userList[0]);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedMember) {
            setLoading(true);
            getUserProgress(selectedMember._id).then(res => {
                if (res.success && res.progress) {
                    setMemberData({
                        weightHeight: res.progress.weightHeight || [],
                        calories: res.progress.calories || [],
                        bodyFat: res.progress.bodyFat && res.progress.bodyFat.length > 0
                            ? [
                                { name: 'Mỡ cơ thể', value: res.progress.bodyFat[res.progress.bodyFat.length - 1].value },
                                { name: 'Khối lượng khác', value: 100 - res.progress.bodyFat[res.progress.bodyFat.length - 1].value }
                              ]
                            : [ { name: 'Mỡ cơ thể', value: 0 }, { name: 'Khối lượng khác', value: 100 } ]
                    });
                } else {
                    setMemberData({ weightHeight: [], calories: [], bodyFat: [ { name: 'Mỡ cơ thể', value: 0 }, { name: 'Khối lượng khác', value: 100 } ] });
                }
            }).finally(() => setLoading(false));
        }
    }, [selectedMember]);

    const handleSelectMember = (member) => {
        setSelectedMember(member);
        setShowMembersList(false);
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="bg-light min-vh-100">
            <div className="container py-4">
                {/* Page Header */}
                <div className="row align-items-center mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                        <h1 className="fw-bold">Biểu Đồ Tiến Độ</h1>
                    </div>
                    <div className="col-md-6 d-flex justify-content-end align-items-center gap-2">
                        <button className="btn btn-outline-primary" onClick={() => navigate('/coach/edit-progress')}>
                            Chỉnh sửa số liệu
                        </button>
                        <div className="dropdown">
                            <div
                                className="d-flex align-items-center justify-content-between bg-white rounded border p-2"
                                role="button"
                                onClick={() => setShowMembersList(!showMembersList)}
                                style={{ cursor: 'pointer' }}
                            >
                                {selectedMember && (
                                    <>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle overflow-hidden me-2" style={{ width: '32px', height: '32px', backgroundColor: '#e9ecef' }}>
                                                <img src={selectedMember.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'} alt={selectedMember.name} className="w-100 h-100 object-fit-cover" />
                                            </div>
                                            <span className="fw-medium">{selectedMember.name}</span>
                                        </div>
                                        <ChevronDown size={18} className="text-secondary" />
                                    </>
                                )}
                            </div>
                            {showMembersList && (
                                <div className="position-absolute mt-1 w-100 bg-white rounded shadow border" style={{ zIndex: 1000 }}>
                                    <div className="p-2">
                                        <div className="position-relative">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm học viên..."
                                                className="form-control ps-4"
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                            />
                                            <Search size={16} className="position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                        </div>
                                    </div>
                                    <ul className="list-unstyled mb-0 overflow-auto" style={{ maxHeight: '240px' }}>
                                        {filteredMembers.map(member => (
                                            <li
                                                key={member._id}
                                                className="d-flex align-items-center px-3 py-2 hover-bg-light"
                                                onClick={() => handleSelectMember(member)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="rounded-circle overflow-hidden me-2" style={{ width: '32px', height: '32px', backgroundColor: '#e9ecef' }}>
                                                    <img src={member.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'} alt={member.name} className="w-100 h-100 object-fit-cover" />
                                                </div>
                                                <span>{member.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-2">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-2">
                                        <Activity size={20} className="text-primary" />
                                    </div>
                                    <h5 className="card-title mb-0">Cân nặng hiện tại</h5>
                                </div>
                                <div className="d-flex align-items-end">
                                    <span className="display-6 fw-bold text-primary">
                                        {memberData.weightHeight.length > 0 ? memberData.weightHeight[memberData.weightHeight.length - 1].weight : '-'}
                                    </span>
                                    <span className="ms-1 text-secondary">kg</span>
                                </div>
                                <div className="mt-2 small text-secondary d-flex align-items-center">
                                    <TrendingUp size={16} className="me-1 text-success" />
                                    <span>
                                        {memberData.weightHeight.length > 1
                                            ? (memberData.weightHeight[memberData.weightHeight.length - 1].weight - memberData.weightHeight[0].weight).toFixed(1) + ' kg từ khi bắt đầu'
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 mb-3 mb-md-0">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-2">
                                    <div className="bg-success bg-opacity-10 p-2 rounded-circle me-2">
                                        <Activity size={20} className="text-success" />
                                    </div>
                                    <h5 className="card-title mb-0">Chiều cao</h5>
                                </div>
                                <div className="d-flex align-items-end">
                                    <span className="display-6 fw-bold text-success">
                                        {memberData.weightHeight.length > 0 ? memberData.weightHeight[memberData.weightHeight.length - 1].height : '-'}
                                    </span>
                                    <span className="ms-1 text-secondary">cm</span>
                                </div>
                                <div className="mt-2 small text-secondary d-flex align-items-center">
                                    <TrendingUp size={16} className="me-1 text-success" />
                                    <span>
                                        {memberData.weightHeight.length > 1
                                            ? (memberData.weightHeight[memberData.weightHeight.length - 1].height - memberData.weightHeight[0].height).toFixed(1) + ' cm từ khi bắt đầu'
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex align-items-center mb-2">
                                    <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-2">
                                        <Activity size={20} className="text-warning" />
                                    </div>
                                    <h5 className="card-title mb-0">Phần trăm mỡ</h5>
                                </div>
                                <div className="d-flex align-items-end">
                                    <span className="display-6 fw-bold text-warning">
                                        {memberData.bodyFat && memberData.bodyFat.length > 0 ? memberData.bodyFat[0].value : '-'}
                                    </span>
                                    <span className="ms-1 text-secondary">%</span>
                                </div>
                                <div className="mt-2 small text-secondary">
                                    Mục tiêu: {memberData.bodyFat && memberData.bodyFat.length > 0 && memberData.bodyFat[0].value > 20 ? 'Giảm' : 'Duy trì'} phần trăm mỡ
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Charts */}
                <div className="row mb-4">
                    {/* Weight & Height Chart */}
                    <div className="col-lg-6 mb-4 mb-lg-0">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-4">Biểu đồ Cân nặng & Chiều cao</h5>
                                <div style={{ height: '320px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={memberData.weightHeight}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis yAxisId="left" domain={['auto', 'auto']} />
                                            <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="weight"
                                                name="Cân nặng (kg)"
                                                stroke="#0d6efd"
                                                activeDot={{ r: 8 }}
                                                strokeWidth={2}
                                            />
                                            <Line
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="height"
                                                name="Chiều cao (cm)"
                                                stroke="#198754"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calories Chart */}
                    <div className="col-lg-6">
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="fw-bold mb-4">Calories</h5>
                                <div style={{ height: '320px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={memberData.calories}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="goal" name="Mục tiêu (calories)" fill="#0d6efd" />
                                            <Bar dataKey="actual" name="Thực tế (calories)" fill="#198754" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Fat Chart */}
                <div className="card">
                    <div className="card-body">
                        <h5 className="fw-bold mb-4">Phần trăm mỡ trong cơ thể</h5>
                        <div className="row">
                            <div className="col-md-4 d-flex align-items-center justify-content-center mb-4 mb-md-0">
                                <div style={{ height: '256px', width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={memberData.bodyFat}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {memberData.bodyFat.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="col-md-8">
                                <div className="bg-light rounded p-4 h-100">
                                    <h5 className="mb-3">Phân tích thành phần cơ thể</h5>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium">Mỡ cơ thể</span>
                                            <span className="small fw-medium">{memberData.bodyFat && memberData.bodyFat.length > 0 ? memberData.bodyFat[0].value : '-' }%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-warning"
                                                role="progressbar"
                                                aria-valuenow={memberData.bodyFat && memberData.bodyFat.length > 0 ? memberData.bodyFat[0].value : 0}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${memberData.bodyFat && memberData.bodyFat.length > 0 ? memberData.bodyFat[0].value : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium">Cơ bắp</span>
                                            <span className="small fw-medium">{memberData.bodyFat && memberData.bodyFat.length > 0 ? (memberData.bodyFat[0].value > 20 ? 35 : 45) : '-'}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-primary"
                                                role="progressbar"
                                                aria-valuenow={memberData.bodyFat && memberData.bodyFat.length > 0 ? (memberData.bodyFat[0].value > 20 ? 35 : 45) : 0}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${memberData.bodyFat && memberData.bodyFat.length > 0 ? (memberData.bodyFat[0].value > 20 ? 35 : 45) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium">Nước</span>
                                            <span className="small fw-medium">{memberData.bodyFat && memberData.bodyFat.length > 0 ? (memberData.bodyFat[0].value > 20 ? 40 : 30) : '-'}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-info"
                                                role="progressbar"
                                                aria-valuenow={memberData.bodyFat && memberData.bodyFat.length > 0 ? (memberData.bodyFat[0].value > 20 ? 40 : 30) : 0}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${memberData.bodyFat && memberData.bodyFat.length > 0 ? (memberData.bodyFat[0].value > 20 ? 40 : 30) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium">Khác</span>
                                            <span className="small fw-medium">{memberData.bodyFat && memberData.bodyFat.length > 0 ? 100 - memberData.bodyFat[0].value - (memberData.bodyFat[0].value > 20 ? 75 : 75) : '-'}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-secondary"
                                                role="progressbar"
                                                aria-valuenow={memberData.bodyFat && memberData.bodyFat.length > 0 ? 100 - memberData.bodyFat[0].value - (memberData.bodyFat[0].value > 20 ? 75 : 75) : 0}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${memberData.bodyFat && memberData.bodyFat.length > 0 ? 100 - memberData.bodyFat[0].value - (memberData.bodyFat[0].value > 20 ? 75 : 75) : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressDashboard;