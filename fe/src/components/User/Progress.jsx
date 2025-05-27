import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, User, ArrowDown, ArrowUp, Scale, Heart, Award, Zap, Lightbulb } from 'lucide-react';

export default function Progress() {
    const [userData, setUserData] = useState({
        weight: 75,
        height: 175,
        bodyFat: 18,
        weightHistory: [
            { date: '01/05', weight: 76 },
            { date: '05/05', weight: 75 },
            { date: '10/05', weight: 74 },
            { date: '15/05', weight: 73 }
        ],
        heightHistory: [
            { date: '01/05', height: 175 },
            { date: '05/05', height: 175 },
            { date: '10/05', height: 175 },
            { date: '15/05', height: 175 }
        ],
        caloriesHistory: [
            { date: '01/05', calories: 2200 },
            { date: '02/05', calories: 2000 },
            { date: '03/05', calories: 2300 },
            { date: '04/05', calories: 2100 }
        ]
    });

    const COLORS = ['#6366F1', '#FF8042'];
    const RADIAN = Math.PI / 180;

    const bodyFatData = [
        { name: 'Body Fat', value: userData.bodyFat },
        { name: 'Lean Body Mass', value: 100 - userData.bodyFat }
    ];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // Use black text with a white outline for better contrast regardless of background
        return (
            <text
                x={cx + (x - cx) * 1.5}
                y={cy + (y - cy) * 1.5}
                fill={percent >= 50 ? '#ffffff' : '#ffffff'}
                stroke={percent >= 50 ? '#f97316' : '#6366f1'}
                strokeWidth="1px"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontWeight: 'bold' }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const calculateBMI = () => {
        const heightInMeters = userData.height / 100;
        return (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return "Thiếu cân";
        if (bmi < 25) return "Bình thường";
        if (bmi < 30) return "Thừa cân";
        return "Béo phì";
    };

    const weightTrend = userData.weightHistory[userData.weightHistory.length - 1].weight -
        userData.weightHistory[0].weight;

    const bmi = calculateBMI();
    const bmiCategory = getBMICategory(bmi);

    return (
        <div className="bg-light py-4" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="container">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                    <div className="bg-indigo p-2 rounded-circle me-3 shadow-sm" style={{ backgroundColor: '#6366F1' }}>
                        <Award className="text-white fs-4" />
                    </div>
                    <h2 className="fw-bold" style={{ color: '#3730a3' }}>Tiến Độ Của Bạn</h2>
                </div>

                {/* Stats Overview */}
                <div className="row g-4 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 h-100 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header py-3 border-0" style={{ background: 'linear-gradient(to right, #6366F1, #818CF8)' }}>
                                <h5 className="fw-bold mb-0 text-white">
                                    <Scale className="me-2" />
                                    Cân nặng hiện tại
                                </h5>
                            </div>
                            <div className="card-body d-flex align-items-center">
                                <div className="display-5 fw-bold me-3" style={{ color: '#4F46E5' }}>
                                    {userData.weight}
                                </div>
                                <div>
                                    <div className="fs-4 fw-light text-muted">kg</div>
                                    <div className={`d-flex align-items-center ${weightTrend < 0 ? 'text-success' : 'text-danger'}`}>
                                        {weightTrend < 0 ? <ArrowDown className="me-1" /> : <ArrowUp className="me-1" />}
                                        <span className="fw-medium">{Math.abs(weightTrend)} kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 h-100 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header py-3 border-0" style={{ background: 'linear-gradient(to right, #0EA5E9, #38BDF8)' }}>
                                <h5 className="fw-bold mb-0 text-white">
                                    <User className="me-2" />
                                    Chiều cao
                                </h5>
                            </div>
                            <div className="card-body d-flex align-items-center">
                                <div className="display-5 fw-bold me-3" style={{ color: '#0284C7' }}>
                                    {userData.height}
                                </div>
                                <div className="fs-4 fw-light text-muted">cm</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 h-100 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header py-3 border-0" style={{ background: 'linear-gradient(to right, #8B5CF6, #A78BFA)' }}>
                                <h5 className="fw-bold mb-0 text-white">
                                    <Activity className="me-2" />
                                    BMI
                                </h5>
                            </div>
                            <div className="card-body d-flex align-items-center">
                                <div className="display-5 fw-bold me-3" style={{ color: '#7C3AED' }}>
                                    {bmi}
                                </div>
                                <div>
                                    <span className="badge rounded-pill fs-6"
                                        style={{
                                            backgroundColor:
                                                bmiCategory === "Thiếu cân" ? '#FBBF24' :
                                                    bmiCategory === "Bình thường" ? '#10B981' :
                                                        bmiCategory === "Thừa cân" ? '#F59E0B' : '#EF4444'
                                        }}>
                                        {bmiCategory}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-4 mb-4">
                    {/* Body Fat Chart */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                            <div className="card-header py-3 border-0" style={{ background: 'linear-gradient(to right, #6366F1, #818CF8)' }}>
                                <h5 className="fw-bold mb-0 text-white">
                                    <Heart className="me-2" />
                                    Phần trăm mỡ cơ thể
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="d-flex flex-column align-items-center">
                                    <div style={{ height: '250px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={bodyFatData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={renderCustomizedLabel}
                                                    outerRadius={90}
                                                    innerRadius={60}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {bodyFatData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="d-flex justify-content-center mt-3 gap-4">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: COLORS[0] }}></div>
                                            <span className="fw-medium">Mỡ cơ thể: {userData.bodyFat}%</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: COLORS[1] }}></div>
                                            <span className="fw-medium">Khối lượng nạc: {100 - userData.bodyFat}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calories Chart */}
                    <div className="col-lg-6">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                            <div className="card-header py-3 border-0" style={{ background: 'linear-gradient(to right, #F97316, #FB923C)' }}>
                                <h5 className="fw-bold mb-0 text-white">
                                    <Zap className="me-2" />
                                    Calories nạp vào mỗi ngày
                                </h5>
                            </div>
                            <div className="card-body">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={userData.caloriesHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                                            formatter={(value) => [`${value} calories`, 'Calories']}
                                        />
                                        <Bar
                                            dataKey="calories"
                                            fill="#FF8042"
                                            radius={[8, 8, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weight History Chart */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                    <div className="card-header py-3 border-0" style={{ background: 'linear-gradient(to right, #10B981, #34D399)' }}>
                        <h5 className="fw-bold mb-0 text-white">
                            <TrendingUp className="me-2" />
                            Cân nặng theo thời gian
                        </h5>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userData.weightHistory} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
                                    formatter={(value) => [`${value} kg`, 'Cân nặng']}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ stroke: '#10B981', strokeWidth: 2, r: 6, fill: 'white' }}
                                    activeDot={{ r: 8, fill: '#10B981' }}
                                    name="Cân nặng (kg)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                    <div className="card-body p-0">
                        <div className="row g-0">
                            <div className="col-md-1 d-flex align-items-stretch" style={{ backgroundColor: '#FBBF24' }}>
                                <div className="d-flex align-items-center justify-content-center w-100">
                                    <Lightbulb className="text-white fs-1" />
                                </div>
                            </div>
                            <div className="col-md-11">
                                <div className="p-4">
                                    <h4 className="fw-bold mb-3" style={{ color: '#D97706' }}>Lời khuyên</h4>
                                    <p className="mb-0 fs-5">Bạn đang có xu hướng giảm cân tốt! Hãy tiếp tục duy trì lượng calories phù hợp và kết hợp với tập luyện thường xuyên để đạt được mục tiêu của mình.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}