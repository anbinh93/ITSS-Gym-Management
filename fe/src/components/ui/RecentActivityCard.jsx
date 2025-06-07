import React from 'react';
import { 
  FaUserClock, 
  FaToolbox, 
  FaCalendarCheck, 
  FaComments,
  FaUsers,
  FaCog,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { MdFeedback, MdNewReleases } from 'react-icons/md';

const RecentActivityCard = ({ activities }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      'checkin': <FaUserClock className="text-success" />,
      'equipment': <FaToolbox className="text-warning" />,
      'membership': <FaCalendarCheck className="text-info" />,
      'feedback': <MdFeedback className="text-primary" />,
      'registration': <FaUsers className="text-success" />,
      'maintenance': <FaCog className="text-secondary" />,
      'alert': <FaExclamationTriangle className="text-danger" />,
      'task_completed': <FaCheckCircle className="text-success" />
    };
    return iconMap[type] || <MdNewReleases className="text-info" />;
  };

  const getActivityStyle = (type) => {
    const styleMap = {
      'checkin': 'border-left: 4px solid #28a745;',
      'equipment': 'border-left: 4px solid #ffc107;',
      'membership': 'border-left: 4px solid #17a2b8;',
      'feedback': 'border-left: 4px solid #007bff;',
      'registration': 'border-left: 4px solid #28a745;',
      'maintenance': 'border-left: 4px solid #6c757d;',
      'alert': 'border-left: 4px solid #dc3545;',
      'task_completed': 'border-left: 4px solid #28a745;'
    };
    return styleMap[type] || 'border-left: 4px solid #17a2b8;';
  };

  return (
    <div className="recent-activity-card">
      <div className="activity-header">
        <h5 className="mb-0">
          <MdNewReleases className="me-2" />
          Hoạt động gần đây
        </h5>
      </div>
      <div className="activity-body">
        <div className="activity-list">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="activity-item"
              style={{ 
                borderLeft: getActivityStyle(activity.type).split(':')[1].trim() 
              }}
            >
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <small className="activity-time text-muted">{activity.time}</small>
                {activity.priority && (
                  <span className={`badge ms-2 ${
                    activity.priority === 'high' ? 'bg-danger' : 
                    activity.priority === 'medium' ? 'bg-warning' : 'bg-secondary'
                  }`}>
                    {activity.priority === 'high' ? 'Ưu tiên cao' : 
                     activity.priority === 'medium' ? 'Ưu tiên vừa' : 'Bình thường'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="activity-footer">
          <button className="btn btn-outline-primary btn-sm w-100">
            Xem tất cả hoạt động
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivityCard;
