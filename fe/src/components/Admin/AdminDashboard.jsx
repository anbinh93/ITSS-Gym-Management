import StatCard from "./StatCard";
import RecentUsageTable from "../Manage/RecentUsageTable";
import ServiceUsageChart from "./ServiceUsageChart";
import { MdRoomPreferences } from "react-icons/md";
import { FaTools, FaUsers } from "react-icons/fa";
import { LuPackage } from "react-icons/lu";

export default function AdminDashboard() {
  const stats = {
    totalCustomers: 102,
    totalRoom: 3,
    totalDeviceActive: 17,
    totalPackage: 17,
  };

  const recentUsage = [
    {
      date: "2025-05-13",
      customerName: "Nguyễn Văn A",
      checkIn: "08:00",
      checkOut: "09:30",
      services: ["Gym", "Xông hơi"],
      participationLevel: "Tích cực",
    },
    {
      date: "2025-05-12",
      customerName: "Trần Thị B",
      checkIn: "18:15",
      checkOut: "19:05",
      services: ["Yoga"],
      participationLevel: "Trung bình",
    },
  ];

  // Dữ liệu thống kê dịch vụ sử dụng
  const serviceUsageData = [
    { service: "Gói theo buổi", count: 120 },
    { service: "Gói cá nhân với HLV", count: 75 },
    { service: "Gói 3 tháng", count: 40 },
    { service: "Gói 1 năm", count: 20 },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header mb-4">
        <h2 className="dashboard-title">Dashboard Overview</h2>
        <p className="dashboard-subtitle text-muted">
          Welcome back! Here's what's happening at your gym today.
        </p>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Tổng hội viên"
            value={stats.totalCustomers}
            icon={<FaUsers className="stat-icon" />}
            variant="primary"
            trend="+12%"
            trendUp={true}
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Số phòng hoạt động"
            value={stats.totalRoom}
            icon={<MdRoomPreferences className="stat-icon" />}
            variant="success"
            trend="+5%"
            trendUp={true}
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Số thiết bị hoạt động"
            value={stats.totalDeviceActive}
            icon={<FaTools className="stat-icon" />}
            variant="info"
            trend="+8%"
            trendUp={true}
          />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard
            title="Số gói tập hiện có"
            value={stats.totalPackage}
            icon={<LuPackage className="stat-icon" />}
            variant="warning"
            trend="+3%"
            trendUp={true}
          />
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card dashboard-card">
            <div className="card-header">
              <h5 className="card-title mb-0">Service Usage Statistics</h5>
            </div>
            <div className="card-body">
              <ServiceUsageChart data={serviceUsageData} />
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card dashboard-card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Stats</h5>
            </div>
            <div className="card-body">
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <div className="quick-stat-value">89%</div>
                  <div className="quick-stat-label">Equipment Utilization</div>
                </div>
                <div className="quick-stat-item">
                  <div className="quick-stat-value">24</div>
                  <div className="quick-stat-label">Active Sessions</div>
                </div>
                <div className="quick-stat-item">
                  <div className="quick-stat-value">156</div>
                  <div className="quick-stat-label">Monthly Check-ins</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card dashboard-card">
            <div className="card-header">
              <h5 className="card-title mb-0">Recent Member Activity</h5>
            </div>
            <div className="card-body p-0">
              <RecentUsageTable data={recentUsage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
