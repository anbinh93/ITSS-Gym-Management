import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { ChevronDown, Search, Activity, TrendingUp } from 'lucide-react';

// Sample data
const members = [
    { id: 1, name: 'Vũ Ngọc Duku', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: 'Wean Lee', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 3, name: 'Quyết Strong', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 4, name: 'Đặng Hải Anh', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
];

const progressData = {
    1: {
        weightHeight: [
            { date: '01/01', weight: 75, height: 170 },
            { date: '01/15', weight: 74, height: 170 },
            { date: '02/01', weight: 72, height: 170 },
            { date: '02/15', weight: 71, height: 170 },
            { date: '03/01', weight: 70, height: 170 },
            { date: '03/15', weight: 69, height: 170 },
            { date: '04/01', weight: 68, height: 171 },
        ],
        calories: [
            { date: '01/05', goal: 2200, actual: 2350 },
            { date: '01/12', goal: 2200, actual: 2150 },
            { date: '01/19', goal: 2100, actual: 2050 },
            { date: '01/26', goal: 2100, actual: 2200 },
            { date: '02/02', goal: 2000, actual: 1950 },
            { date: '02/09', goal: 2000, actual: 1900 },
            { date: '02/16', goal: 1900, actual: 1950 },
        ],
        bodyFat: [
            { name: 'Mỡ cơ thể', value: 18 },
            { name: 'Khối lượng khác', value: 82 }
        ]
    },
    2: {
        weightHeight: [
            { date: '01/01', weight: 58, height: 160 },
            { date: '01/15', weight: 59, height: 160 },
            { date: '02/01', weight: 60, height: 160 },
            { date: '02/15', weight: 61, height: 161 },
            { date: '03/01', weight: 62, height: 161 },
            { date: '03/15', weight: 63, height: 161 },
            { date: '04/01', weight: 64, height: 161 },
        ],
        calories: [
            { date: '01/05', goal: 1800, actual: 1750 },
            { date: '01/12', goal: 1800, actual: 1850 },
            { date: '01/19', goal: 1900, actual: 1950 },
            { date: '01/26', goal: 1900, actual: 2000 },
            { date: '02/02', goal: 2000, actual: 2050 },
            { date: '02/09', goal: 2000, actual: 2100 },
            { date: '02/16', goal: 2100, actual: 2150 },
        ],
        bodyFat: [
            { name: 'Mỡ cơ thể', value: 24 },
            { name: 'Khối lượng khác', value: 76 }
        ]
    },
    3: {
        weightHeight: [
            { date: '01/01', weight: 82, height: 175 },
            { date: '01/15', weight: 81, height: 175 },
            { date: '02/01', weight: 80, height: 175 },
            { date: '02/15', weight: 79, height: 175 },
            { date: '03/01', weight: 78, height: 175 },
            { date: '03/15', weight: 77, height: 175 },
            { date: '04/01', weight: 76, height: 175 },
        ],
        calories: [
            { date: '01/05', goal: 2500, actual: 2400 },
            { date: '01/12', goal: 2500, actual: 2450 },
            { date: '01/19', goal: 2400, actual: 2350 },
            { date: '01/26', goal: 2400, actual: 2300 },
            { date: '02/02', goal: 2300, actual: 2250 },
            { date: '02/09', goal: 2300, actual: 2200 },
            { date: '02/16', goal: 2200, actual: 2150 },
        ],
        bodyFat: [
            { name: 'Mỡ cơ thể', value: 15 },
            { name: 'Khối lượng khác', value: 85 }
        ]
    },
    4: {
        weightHeight: [
            { date: '01/01', weight: 62, height: 165 },
            { date: '01/15', weight: 61, height: 165 },
            { date: '02/01', weight: 60, height: 165 },
            { date: '02/15', weight: 59, height: 165 },
            { date: '03/01', weight: 58, height: 165 },
            { date: '03/15', weight: 57, height: 165 },
            { date: '04/01', weight: 56, height: 165 },
        ],
        calories: [
            { date: '01/05', goal: 1900, actual: 1850 },
            { date: '01/12', goal: 1900, actual: 1800 },
            { date: '01/19', goal: 1800, actual: 1750 },
            { date: '01/26', goal: 1800, actual: 1700 },
            { date: '02/02', goal: 1700, actual: 1650 },
            { date: '02/09', goal: 1700, actual: 1600 },
            { date: '02/16', goal: 1600, actual: 1550 },
        ],
        bodyFat: [
            { name: 'Mỡ cơ thể', value: 22 },
            { name: 'Khối lượng khác', value: 78 }
        ]
    },
};

const COLORS = ['#FF8042', '#0088FE'];

const ProgressDashboard = () => {
    const [searchText, setSearchText] = useState('');
    const [showMembersList, setShowMembersList] = useState(false);
    const [selectedMember, setSelectedMember] = useState(members[0]);
    const [memberData, setMemberData] = useState(progressData[1]);

    const handleSelectMember = (member) => {
        setSelectedMember(member);
        setMemberData(progressData[member.id]);
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

                    {/* Member selector */}
                    <div className="col-md-6">
                        <div className="dropdown">
                            <div
                                className="d-flex align-items-center justify-content-between bg-white rounded border p-2"
                                role="button"
                                onClick={() => setShowMembersList(!showMembersList)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle overflow-hidden me-2" style={{ width: '32px', height: '32px', backgroundColor: '#e9ecef' }}>
                                        <img src={selectedMember.avatar} alt={selectedMember.name} className="w-100 h-100 object-fit-cover" />
                                    </div>
                                    <span className="fw-medium">{selectedMember.name}</span>
                                </div>
                                <ChevronDown size={18} className="text-secondary" />
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
                                                key={member.id}
                                                className="d-flex align-items-center px-3 py-2 hover-bg-light"
                                                onClick={() => handleSelectMember(member)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="rounded-circle overflow-hidden me-2" style={{ width: '32px', height: '32px', backgroundColor: '#e9ecef' }}>
                                                    <img src={member.avatar} alt={member.name} className="w-100 h-100 object-fit-cover" />
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
                                        {memberData.weightHeight[memberData.weightHeight.length - 1].weight}
                                    </span>
                                    <span className="ms-1 text-secondary">kg</span>
                                </div>
                                <div className="mt-2 small text-secondary d-flex align-items-center">
                                    <TrendingUp size={16} className="me-1 text-success" />
                                    <span>
                                        {(memberData.weightHeight[memberData.weightHeight.length - 1].weight -
                                            memberData.weightHeight[0].weight).toFixed(1)} kg từ khi bắt đầu
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
                                        {memberData.weightHeight[memberData.weightHeight.length - 1].height}
                                    </span>
                                    <span className="ms-1 text-secondary">cm</span>
                                </div>
                                <div className="mt-2 small text-secondary d-flex align-items-center">
                                    <TrendingUp size={16} className="me-1 text-success" />
                                    <span>
                                        {(memberData.weightHeight[memberData.weightHeight.length - 1].height -
                                            memberData.weightHeight[0].height).toFixed(1)} cm từ khi bắt đầu
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
                                        {memberData.bodyFat[0].value}
                                    </span>
                                    <span className="ms-1 text-secondary">%</span>
                                </div>
                                <div className="mt-2 small text-secondary">
                                    Mục tiêu: {memberData.bodyFat[0].value > 20 ? 'Giảm' : 'Duy trì'} phần trăm mỡ
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
                                            <span className="small fw-medium">{memberData.bodyFat[0].value}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-warning"
                                                role="progressbar"
                                                aria-valuenow={memberData.bodyFat[0].value}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${memberData.bodyFat[0].value}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium">Cơ bắp</span>
                                            <span className="small fw-medium">{memberData.bodyFat[0].value > 20 ? 35 : 45}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-primary"
                                                role="progressbar"
                                                aria-valuenow={memberData.bodyFat[0].value > 20 ? 35 : 45}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${memberData.bodyFat[0].value > 20 ? 35 : 45}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium">Nước</span>
                                            <span className="small fw-medium">{memberData.bodyFat[0].value > 20 ? 40 : 30}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-info"
                                                role="progressbar"
                                                aria-valuenow={memberData.bodyFat[0].value > 20 ? 40 : 30}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${memberData.bodyFat[0].value > 20 ? 40 : 30}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small fw-medium">Khác</span>
                                            <span className="small fw-medium">{100 - memberData.bodyFat[0].value - (memberData.bodyFat[0].value > 20 ? 75 : 75)}%</span>
                                        </div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar bg-secondary"
                                                role="progressbar"
                                                aria-valuenow={100 - memberData.bodyFat[0].value - (memberData.bodyFat[0].value > 20 ? 75 : 75)}
                                                aria-valuemin="0"
                                                aria-valuemax="100"
                                                style={{ width: `${100 - memberData.bodyFat[0].value - (memberData.bodyFat[0].value > 20 ? 75 : 75)}%` }}
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