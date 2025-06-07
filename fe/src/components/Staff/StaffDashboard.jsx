import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/authSlice';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaDumbbell, 
  FaClipboardList,
  FaChartLine,
  FaComments,
  FaUserClock,
  FaToolbox
} from 'react-icons/fa';
import { MdRoomPreferences, MdFeedback, MdNewReleases } from 'react-icons/md';
import DashboardSummaryCard from '../ui/DashboardSummaryCard';
import RecentActivityCard from '../ui/RecentActivityCard';
import { 
  getAllUsers, 
  getAllGymRooms,
  getAllDevices
} from '../../services/api';
import { getAllMemberships } from '../../services/membershipApi';
import '../../styles/staffDashboard.css';

const StaffDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeRooms: 0,
    workingEquipment: 0,
    activeMemberships: 0,
    todayCheckIns: 0,
    pendingTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStaffDashboardData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const [usersRes, roomsRes, devicesRes, membershipsRes] = await Promise.allSettled([
        getAllUsers(),
        getAllGymRooms(),
        getAllDevices(),
        getAllMemberships()
      ]);

      // Process users data
      const usersData = usersRes.status === 'fulfilled' ? usersRes.value : { users: [] };
      const members = (usersData.users || []).filter(u => u.role === 'member' || u.role === 'user');
      
      // Process rooms data
      const roomsData = roomsRes.status === 'fulfilled' ? roomsRes.value : { gymrooms: [] };
      const activeRooms = (roomsData.gymrooms || roomsData.rooms || []).filter(r => r.status === 'available');
      
      // Process equipment data
      const devicesData = devicesRes.status === 'fulfilled' ? devicesRes.value : { equipment: [] };
      const workingEquipment = (devicesData.equipment || []).filter(d => d.condition === 'Good');
      
      // Process memberships data
      const membershipsData = membershipsRes.status === 'fulfilled' ? membershipsRes.value : { memberships: [] };
      const activeMemberships = (membershipsData.memberships || []).filter(m => m.status === 'ACTIVE');
      
      // Calculate today's check-ins (mock data for now)
      const todayCheckIns = Math.floor(Math.random() * 50) + 10;
      const pendingTasks = Math.floor(Math.random() * 15) + 3;

      setStats({
        totalMembers: members.length,
        activeRooms: activeRooms.length,
        workingEquipment: workingEquipment.length,
        activeMemberships: activeMemberships.length,
        todayCheckIns: todayCheckIns,
        pendingTasks: pendingTasks
      });

      // Generate recent activities with more variety
      const activities = [
        {
          id: 1,
          type: 'checkin',
          message: `${members[0]?.name || 'Nguyễn Văn A'} đã check-in phòng tập lúc 08:30`,
          time: '5 phút trước',
          priority: 'normal'
        },
        {
          id: 2,
          type: 'equipment',
          message: 'Máy chạy bộ TB001 báo lỗi, cần kiểm tra ngay',
          time: '15 phút trước',
          priority: 'high'
        },
        {
          id: 3,
          type: 'membership',
          message: `${members[1]?.name || 'Trần Thị B'} đã gia hạn gói Premium 6 tháng`,
          time: '1 giờ trước',
          priority: 'normal'
        },
        {
          id: 4,
          type: 'feedback',
          message: 'Nhận được đánh giá 5 sao từ hội viên về dịch vụ',
          time: '2 giờ trước',
          priority: 'normal'
        },
        {
          id: 5,
          type: 'registration',
          message: `${members[2]?.name || 'Lê Văn C'} đăng ký thành viên mới`,
          time: '3 giờ trước',
          priority: 'medium'
        },
        {
          id: 6,
          type: 'maintenance',
          message: 'Hoàn thành bảo trì thiết bị phòng Cardio',
          time: '4 giờ trước',
          priority: 'normal'
        },
        {
          id: 7,
          type: 'alert',
          message: 'Phòng tập A cần dọn dẹp sau buổi tập nhóm',
          time: '5 giờ trước',
          priority: 'medium'
        }
      ];

      setRecentActivities(activities);

    } catch (err) {
      console.error('Error fetching staff dashboard data:', err);
      setError("Lỗi tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Quản lý hội viên',
      description: 'Xem và quản lý thông tin hội viên',
      icon: <FaUsers />,
      link: '/staff/customer',
      color: 'primary'
    },
    {
      title: 'Quản lý thiết bị',
      description: 'Kiểm tra tình trạng thiết bị',
      icon: <FaDumbbell />,
      link: '/staff/device',
      color: 'success'
    },
    {
      title: 'Quản lý phòng tập',
      description: 'Theo dõi tình trạng phòng tập',
      icon: <MdRoomPreferences />,
      link: '/staff/gymroom',
      color: 'info'
    },
    {
      title: 'Đăng ký & Gia hạn',
      description: 'Xử lý đăng ký gói tập mới',
      icon: <FaClipboardList />,
      link: '/staff/subscription-management',
      color: 'warning'
    },
    {
      title: 'Quản lý phản hồi',
      description: 'Xem và phản hồi ý kiến hội viên',
      icon: <FaComments />,
      link: '/staff/feedback-management',
      color: 'secondary'
    }
  ];

  if (loading) {
    return (
      <div className="staff-dashboard-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staff-dashboard-container">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={fetchStaffDashboardData}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-container">
      {/* Header */}
      <div className="dashboard-header mb-4">
        <h2 className="dashboard-title">
          🏋️‍♂️ Staff Dashboard
        </h2>
        <p className="dashboard-subtitle">
          Xin chào {currentUser?.name || 'Staff'}! Chúc bạn một ngày làm việc hiệu quả.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-lg-2 col-md-4 col-sm-6">
          <DashboardSummaryCard
            type="members"
            value={stats.totalMembers}
            label="Tổng hội viên"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            trend="+12%"
            trendUp={true}
            onClick={() => window.location.href = '/staff/customer'}
          />
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6">
          <DashboardSummaryCard
            type="rooms"
            value={stats.activeRooms}
            label="Phòng hoạt động"
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            trend="+5%"
            trendUp={true}
            onClick={() => window.location.href = '/staff/gymroom'}
          />
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6">
          <DashboardSummaryCard
            type="equipment"
            value={stats.workingEquipment}
            label="Thiết bị hoạt động"
            gradient="linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)"
            trend="+8%"
            trendUp={true}
            onClick={() => window.location.href = '/staff/device'}
          />
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6">
          <DashboardSummaryCard
            type="memberships"
            value={stats.activeMemberships}
            label="Gói tập đang hoạt động"
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            trend="+3%"
            trendUp={true}
            onClick={() => window.location.href = '/staff/subscription-management'}
          />
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6">
          <DashboardSummaryCard
            type="checkins"
            value={stats.todayCheckIns}
            label="Check-in hôm nay"
            gradient="linear-gradient(135deg, #4b6cb7 0%, #182848 100%)"
            trend="+15%"
            trendUp={true}
          />
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6">
          <DashboardSummaryCard
            type="tasks"
            value={stats.pendingTasks}
            label="Công việc cần xử lý"
            gradient="linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)"
            trend="-2"
            trendUp={false}
          />
        </div>
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-lg-8">
          <div className="card dashboard-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <FaChartLine className="me-2" />
                Thao tác nhanh
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {quickActions.map((action, index) => (
                  <div key={index} className="col-md-4 col-sm-6">
                    <a 
                      href={action.link} 
                      className="text-decoration-none"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = action.link;
                      }}
                    >
                      <div className={`quick-action-card border-${action.color}`}>
                        <div className={`quick-action-icon text-${action.color}`}>
                          {action.icon}
                        </div>
                        <div className="quick-action-content">
                          <h6>{action.title}</h6>
                          <p className="text-muted small">{action.description}</p>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-lg-4">
          <RecentActivityCard activities={recentActivities} />
        </div>
      </div>

      {/* Daily Tasks Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card dashboard-card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <FaClipboardList className="me-2" />
                Nhiệm vụ hôm nay
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="task-item">
                    <div className="task-icon bg-info">
                      <FaUsers />
                    </div>
                    <div className="task-content">
                      <h6>Kiểm tra hội viên mới</h6>
                      <p className="text-muted">Xem và xử lý các đăng ký mới trong ngày</p>
                      <a href="/staff/customer" className="btn btn-sm btn-outline-info">Xem ngay</a>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="task-item">
                    <div className="task-icon bg-warning">
                      <FaToolbox />
                    </div>
                    <div className="task-content">
                      <h6>Kiểm tra thiết bị</h6>
                      <p className="text-muted">Đảm bảo tất cả thiết bị hoạt động tốt</p>
                      <a href="/staff/device" className="btn btn-sm btn-outline-warning">Kiểm tra</a>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="task-item">
                    <div className="task-icon bg-success">
                      <FaComments />
                    </div>
                    <div className="task-content">
                      <h6>Phản hồi khách hàng</h6>
                      <p className="text-muted">Trả lời các góp ý và phản hồi của hội viên</p>
                      <a href="/staff/feedback-management" className="btn btn-sm btn-outline-success">Xử lý</a>
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

export default StaffDashboard;
