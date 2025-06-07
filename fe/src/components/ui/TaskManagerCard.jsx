import React from 'react';
import { 
  FaUsers, 
  FaToolbox, 
  FaComments,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle
} from 'react-icons/fa';

const TaskManagerCard = ({ tasks }) => {
  const getTaskIcon = (type) => {
    const iconMap = {
      'member_check': <FaUsers />,
      'equipment_check': <FaToolbox />,
      'feedback_response': <FaComments />,
      'general': <FaClipboardList />
    };
    return iconMap[type] || <FaClipboardList />;
  };

  const getTaskStatusColor = (status) => {
    const colorMap = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'urgent': 'danger'
    };
    return colorMap[status] || 'secondary';
  };

  const getTaskStatusText = (status) => {
    const textMap = {
      'pending': 'Chờ xử lý',
      'in_progress': 'Đang thực hiện',
      'completed': 'Hoàn thành',
      'urgent': 'Khẩn cấp'
    };
    return textMap[status] || 'Không xác định';
  };

  const defaultTasks = [
    {
      id: 1,
      type: 'member_check',
      title: 'Kiểm tra hội viên mới',
      description: 'Xem và xử lý các đăng ký mới trong ngày',
      status: 'pending',
      priority: 'medium',
      link: '/staff/customer',
      estimatedTime: '30 phút'
    },
    {
      id: 2,
      type: 'equipment_check',
      title: 'Kiểm tra thiết bị',
      description: 'Đảm bảo tất cả thiết bị hoạt động tốt',
      status: 'urgent',
      priority: 'high',
      link: '/staff/device',
      estimatedTime: '45 phút'
    },
    {
      id: 3,
      type: 'feedback_response',
      title: 'Phản hồi khách hàng',
      description: 'Trả lời các góp ý và phản hồi của hội viên',
      status: 'pending',
      priority: 'medium',
      link: '/staff/feedback-management',
      estimatedTime: '20 phút'
    }
  ];

  const tasksToShow = tasks || defaultTasks;

  const handleTaskClick = (link) => {
    if (link) {
      window.location.href = link;
    }
  };

  return (
    <div className="task-manager-card">
      <div className="task-header">
        <h5 className="mb-0">
          <FaClipboardList className="me-2" />
          Nhiệm vụ hôm nay
        </h5>
        <small className="text-muted">
          {tasksToShow.filter(t => t.status !== 'completed').length} công việc cần hoàn thành
        </small>
      </div>
      
      <div className="task-body">
        <div className="task-list">
          {tasksToShow.map((task) => (
            <div 
              key={task.id} 
              className={`task-item-card ${task.status === 'urgent' ? 'urgent' : ''}`}
              onClick={() => handleTaskClick(task.link)}
            >
              <div className="task-item-header">
                <div className={`task-icon bg-${getTaskStatusColor(task.status)}`}>
                  {getTaskIcon(task.type)}
                </div>
                <div className="task-info">
                  <h6 className="task-title">{task.title}</h6>
                  <p className="task-description">{task.description}</p>
                </div>
                <div className="task-status">
                  <span className={`badge bg-${getTaskStatusColor(task.status)}`}>
                    {getTaskStatusText(task.status)}
                  </span>
                </div>
              </div>
              
              <div className="task-item-footer">
                <div className="task-meta">
                  <span className="task-time">
                    <FaClock className="me-1" />
                    {task.estimatedTime}
                  </span>
                  {task.priority === 'high' && (
                    <span className="task-priority high">
                      <FaExclamationCircle className="me-1" />
                      Ưu tiên cao
                    </span>
                  )}
                </div>
                
                {task.status !== 'completed' && (
                  <button 
                    className={`btn btn-sm btn-outline-${getTaskStatusColor(task.status)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task.link);
                    }}
                  >
                    {task.status === 'pending' ? 'Bắt đầu' : 'Tiếp tục'}
                  </button>
                )}
                
                {task.status === 'completed' && (
                  <div className="task-completed">
                    <FaCheckCircle className="text-success me-1" />
                    <small className="text-success">Hoàn thành</small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="task-summary">
          <div className="row text-center">
            <div className="col-4">
              <div className="summary-stat">
                <h4 className="text-warning">{tasksToShow.filter(t => t.status === 'pending').length}</h4>
                <small>Chờ xử lý</small>
              </div>
            </div>
            <div className="col-4">
              <div className="summary-stat">
                <h4 className="text-info">{tasksToShow.filter(t => t.status === 'in_progress').length}</h4>
                <small>Đang thực hiện</small>
              </div>
            </div>
            <div className="col-4">
              <div className="summary-stat">
                <h4 className="text-success">{tasksToShow.filter(t => t.status === 'completed').length}</h4>
                <small>Hoàn thành</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagerCard;
