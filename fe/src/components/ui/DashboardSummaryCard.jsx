import React from 'react';
import { Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaDumbbell, 
  FaUserClock,
  FaToolbox,
  FaClipboardList,
  FaChartLine,
  FaComments
} from 'react-icons/fa';
import { MdRoomPreferences } from 'react-icons/md';

const DashboardSummaryCard = ({ 
  title = "Dashboard Summary", 
  stats = [], 
  className = "",
  gradientColors = { from: "#667eea", to: "#764ba2" }
}) => {
  return (
    <Card className={`shadow-lg border-0 ${className}`}>
      <Card.Header 
        className="text-white border-0"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%)`,
          borderRadius: '12px 12px 0 0'
        }}
      >
        <div className="d-flex align-items-center">
          <i className="bi bi-speedometer2 me-2 fs-5"></i>
          <h5 className="mb-0 fw-semibold">{title}</h5>
        </div>
      </Card.Header>
      
      <Card.Body className="p-4">
        <Row>
          {stats.map((stat, index) => (
            <Col xs={6} md={3} key={index} className="mb-3">
              <div 
                className="text-center p-3 rounded-3 h-100"
                style={{
                  backgroundColor: stat.bgColor || '#f8f9fa',
                  border: '1px solid #e9ecef'
                }}
              >
                <div className="mb-2">
                  <i 
                    className={`${stat.icon} fs-3`}
                    style={{ color: stat.iconColor || '#6c757d' }}
                  ></i>
                </div>
                <div 
                  className="fs-4 fw-bold mb-1"
                  style={{ color: stat.valueColor || '#212529' }}
                >
                  {stat.value}
                </div>
                <small className="text-muted fw-semibold">{stat.label}</small>
                
                {stat.progress && (
                  <div className="mt-2">
                    <ProgressBar 
                      variant={stat.progressVariant || 'primary'}
                      now={stat.progress} 
                      style={{ height: '4px' }}
                    />
                  </div>
                )}
                
                {stat.badge && (
                  <div className="mt-2">
                    <Badge bg={stat.badgeVariant || 'secondary'} className="px-2 py-1">
                      {stat.badge}
                    </Badge>
                  </div>
                )}
              </div>
            </Col>
          ))}
        </Row>

        {/* Additional content area */}
        <div className="mt-4">
          <div className="border-top pt-3">
            <Row>
              <Col md={6}>
                <small className="text-muted fw-semibold">Hoạt động gần đây</small>
                <div className="mt-2">
                  <div className="d-flex align-items-center mb-2">
                    <div 
                      className="rounded-circle me-2"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#28a745'
                      }}
                    ></div>
                    <small className="text-muted">Hệ thống hoạt động bình thường</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle me-2"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#17a2b8'
                      }}
                    ></div>
                    <small className="text-muted">Dữ liệu được cập nhật liên tục</small>
                  </div>
                </div>
              </Col>
              <Col md={6} className="text-md-end">
                <small className="text-muted">
                  Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
                </small>
              </Col>
            </Row>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Example usage configurations for different user roles
export const getAdminDashboardStats = (data) => [
  {
    icon: 'bi-people-fill',
    value: data.totalUsers || 0,
    label: 'Tổng thành viên',
    iconColor: '#007bff',
    bgColor: '#f8f9ff',
    valueColor: '#007bff'
  },
  {
    icon: 'bi-calendar-check',
    value: data.activeWorkouts || 0,
    label: 'Buổi tập hôm nay',
    iconColor: '#28a745',
    bgColor: '#f0fff4',
    valueColor: '#28a745',
    progress: 75,
    progressVariant: 'success'
  },
  {
    icon: 'bi-currency-dollar',
    value: `${data.revenue || 0}K`,
    label: 'Doanh thu tháng',
    iconColor: '#ffc107',
    bgColor: '#fff8f0',
    valueColor: '#ffc107',
    badge: '+12%',
    badgeVariant: 'warning'
  },
  {
    icon: 'bi-gear-fill',
    value: data.equipment || 0,
    label: 'Thiết bị',
    iconColor: '#6f42c1',
    bgColor: '#f8f0ff',
    valueColor: '#6f42c1'
  }
];

export const getUserDashboardStats = (data) => [
  {
    icon: 'bi-activity',
    value: data.totalWorkouts || 0,
    label: 'Tổng buổi tập',
    iconColor: '#007bff',
    bgColor: '#f8f9ff',
    valueColor: '#007bff'
  },
  {
    icon: 'bi-clock',
    value: `${data.totalHours || 0}h`,
    label: 'Tổng thời gian',
    iconColor: '#28a745',
    bgColor: '#f0fff4',
    valueColor: '#28a745'
  },
  {
    icon: 'bi-calendar-week',
    value: data.weeklyWorkouts || 0,
    label: 'Tuần này',
    iconColor: '#ffc107',
    bgColor: '#fff8f0',
    valueColor: '#ffc107',
    progress: (data.weeklyWorkouts / 7) * 100,
    progressVariant: 'warning'
  },
  {
    icon: 'bi-trophy',
    value: data.achievements || 0,
    label: 'Thành tích',
    iconColor: '#dc3545',
    bgColor: '#fff0f0',
    valueColor: '#dc3545'
  }
];

export default DashboardSummaryCard;
