import { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { CiCalendar } from "react-icons/ci";
import { CiUser } from "react-icons/ci";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getRevenue, getNewMembersStats, getStaffPerformance } from '../../services/api';

export default function AdminReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [revenue, setRevenue] = useState(0);
  const [revenueData, setRevenueData] = useState([]);
  const [memberStats, setMemberStats] = useState({ newMembers: 0, renewals: 0, sessionsUsed: 0 });
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [revenueRes, memberRes, staffRes] = await Promise.all([
          getRevenue(selectedPeriod),
          getNewMembersStats(),
          getStaffPerformance()
        ]);
        
        console.log('Revenue response:', revenueRes);
        console.log('Member response:', memberRes);
        console.log('Staff response:', staffRes);
        
        // Cập nhật dữ liệu doanh thu
        if (revenueRes.success) {
          setRevenue(revenueRes.revenue || 0);
          setRevenueData(revenueRes.timeSeriesData || []);
        }
        
        // Cập nhật thống kê thành viên
        if (memberRes.success) {
          setMemberStats({
            newMembers: memberRes.newMembers || 0,
            renewals: memberRes.renewals || 0,
            sessionsUsed: memberRes.sessionsUsed || 0
          });
        }
        
        // Cập nhật hiệu suất nhân viên
        if (staffRes.success) {
          if (staffRes.staffPerformance && Array.isArray(staffRes.staffPerformance)) {
            setStaffPerformance(staffRes.staffPerformance);
          } else if (staffRes.stats && typeof staffRes.stats === 'object') {
            // Fallback cho format cũ
            setStaffPerformance(Object.entries(staffRes.stats).map(([id, stat]) => ({
              name: `Staff ${id.slice(-4)}`,
              feedback: stat.sum / (stat.total || 1),
              tasks: stat.total
            })));
          } else {
            setStaffPerformance([]);
          }
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Lỗi tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPeriod]);

  // Hàm định dạng tiêu đề dựa trên khoảng thời gian
  const getPeriodLabel = (period) => {
    switch (period) {
      case "day":
        return "theo ngày";
      case "week":
        return "theo tuần";
      case "month":
        return "theo tháng";
      case "quarter":
        return "theo quý";
      case "year":
        return "theo năm";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Báo cáo thống kê</h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-[180px] p-2 border rounded"
        >
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
          <option value="quarter">Quý</option>
          <option value="year">Năm</option>
        </select>
      </div>
      {loading && <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2">Đang tải dữ liệu báo cáo...</p>
      </div>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && (
        <>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Doanh thu ({getPeriodLabel(selectedPeriod)})</h3>
              {/* Tổng doanh thu thực tế từ backend */}
              <div style={{ fontSize: 20, fontWeight: 600, color: '#4f46e5', marginBottom: 12 }}>
                Tổng doanh thu thực tế: {revenue.toLocaleString('vi-VN')} VNĐ
              </div>
              
              {revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value),
                        "Doanh thu",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4f46e5" name="Doanh thu (VNĐ)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted">
                  <p>Chưa có dữ liệu doanh thu cho khoảng thời gian này</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="card shadow-sm">
                  <div className="card-body py-4 px-5">
                    <h5 className="card-title mb-4 fw-semibold text-dark">Đăng ký mới và gia hạn</h5>
                    <div className="row g-4">
                      <div className="col-12 col-sm-4">
                        <div className="d-flex align-items-center p-3 bg-light rounded shadow-sm">
                          <div
                            className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: "50px", height: "50px" }}
                          >
                            <CiUser className="text-primary fs-4" />
                          </div>
                          <div>
                            <p className="mb-1 text-muted small">Hội viên mới</p>
                            <h4 className="mb-0 fw-bold text-dark">{memberStats.newMembers}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="d-flex align-items-center p-3 bg-light rounded shadow-sm">
                          <div
                            className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: "50px", height: "50px" }}
                          >
                            <FaRegShareFromSquare className="text-success fs-4" />
                          </div>
                          <div>
                            <p className="mb-1 text-muted small">Hội viên gia hạn</p>
                            <h4 className="mb-0 fw-bold text-dark">{memberStats.renewals}</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-sm-4">
                        <div className="d-flex align-items-center p-3 bg-light rounded shadow-sm">
                          <div
                            className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: "50px", height: "50px" }}
                          >
                            <CiCalendar className="text-info fs-4" />
                          </div>
                          <div>
                            <p className="mb-1 text-muted small">Buổi tập đã sử dụng</p>
                            <h4 className="mb-0 fw-bold text-dark">{memberStats.sessionsUsed}</h4>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Hiệu suất nhân viên</h3>
              {staffPerformance && staffPerformance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr className="table-secondary">
                        <th className="p-3">Nhân viên</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Phản hồi (trung bình)</th>
                        <th className="p-3">Số lượt phản hồi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffPerformance.map((staff, idx) => (
                        <tr key={idx}>
                          <td className="p-3">{staff.name}</td>
                          <td className="p-3">{staff.email || '--'}</td>
                          <td className="p-3">
                            <span className={`badge ${
                              (staff.averageRating || staff.feedback) >= 4 ? 'bg-success' : 
                              (staff.averageRating || staff.feedback) >= 3 ? 'bg-warning' : 'bg-danger'
                            }`}>
                              {(staff.averageRating || staff.feedback)?.toFixed(2) || '--'}/5
                            </span>
                          </td>
                          <td className="p-3">{staff.totalFeedbacks || staff.tasks || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <p>Chưa có dữ liệu hiệu suất nhân viên</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}