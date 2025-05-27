import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { CiCalendar } from "react-icons/ci";
import { CiUser } from "react-icons/ci";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Hàm tạo dữ liệu mẫu cho các khoảng thời gian
const generateRevenueData = (period) => {
  switch (period) {
    case "day":
      return [
        { name: "Hôm nay", revenue: 1500000 },
        { name: "Hôm qua", revenue: 1200000 },
        { name: "2 ngày trước", revenue: 1800000 },
      ];
    case "week":
      return [
        { name: "Tuần này", revenue: 3500000 },
        { name: "Tuần trước", revenue: 3000000 },
        { name: "2 tuần trước", revenue: 2800000 },
      ];
    case "month":
      return [
        { name: "Tháng này", revenue: 12000000 },
        { name: "Tháng trước", revenue: 10000000 },
        { name: "2 tháng trước", revenue: 9000000 },
      ];
    case "quarter":
      return [
        { name: "Quý này", revenue: 35000000 },
        { name: "Quý trước", revenue: 30000000 },
        { name: "2 quý trước", revenue: 28000000 },
      ];
    case "year":
      return [
        { name: "Năm nay", revenue: 140000000 },
        { name: "Năm trước", revenue: 120000000 },
        { name: "2 năm trước", revenue: 100000000 },
      ];
    default:
      return [];
  }
};

export default function AdminReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Lấy dữ liệu doanh thu dựa trên khoảng thời gian được chọn
  const revenueData = generateRevenueData(selectedPeriod);

  // Báo cáo về đăng ký mới và gia hạn
  const memberStats = {
    newMembers: 30,
    renewals: 15,
    sessionsUsed: 120,
  };

  // Đánh giá hiệu suất nhân viên
  const staffPerformance = [
    { name: "Nguyễn Văn A", feedback: 4.5, tasks: 10 },
    { name: "Trần Thị B", feedback: 4.8, tasks: 12 },
    { name: "Lê Văn C", feedback: 4.2, tasks: 9 },
  ];

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

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Doanh thu ({getPeriodLabel(selectedPeriod)})</h3>
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
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Nhân viên</th>
                <th className="p-2 text-left">Phản hồi (trung bình)</th>
                <th className="p-2 text-left">Số hoạt động quản lý</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.map((staff, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{staff.name}</td>
                  <td className="p-2">{staff.feedback}</td>
                  <td className="p-2">{staff.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}