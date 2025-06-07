import React from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';

const WorkoutStatsCard = ({ workoutData = [], className = "" }) => {
  // Calculate workout statistics
  const totalWorkouts = workoutData.length;
  const totalMinutes = workoutData.reduce((total, w) => total + (w.durationMinutes || 0), 0);
  const totalHours = Math.round(totalMinutes / 60) || 0;
  const averageDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Calculate weekly workouts (last 7 days)
  const weeklyWorkouts = workoutData.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  // Calculate monthly workouts (last 30 days)
  const monthlyWorkouts = workoutData.filter(w => {
    const workoutDate = new Date(w.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return workoutDate >= monthAgo;
  }).length;

  // Get recent workouts (last 3)
  const recentWorkouts = workoutData.slice(0, 3);

  return (
    <Card className={`shadow-sm ${className}`}>
      <Card.Header 
        className="text-white border-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px 12px 0 0'
        }}
      >
        <div className="d-flex align-items-center">
          <i className="bi bi-activity me-2 fs-5"></i>
          <h5 className="mb-0 fw-semibold">Thống kê tập luyện</h5>
        </div>
      </Card.Header>
      
      <Card.Body className="p-4">
        {/* Total workouts with visual progress */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted fw-semibold">Tổng số buổi tập</small>
            <span className="badge bg-primary fs-6">{totalWorkouts}</span>
          </div>
          <div className="progress" style={{height: '8px'}}>
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ 
                width: totalWorkouts > 0 ? '100%' : '0%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }} 
              aria-valuenow="100" 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        {/* Workout frequency stats */}
        <Row className="mb-4">
          <Col xs={4} className="text-center">
            <div className="border rounded-3 p-3 h-100" style={{backgroundColor: '#f8f9ff'}}>
              <div className="fs-4 fw-bold text-primary mb-1">{weeklyWorkouts}</div>
              <small className="text-muted fw-semibold">Tuần này</small>
            </div>
          </Col>
          <Col xs={4} className="text-center">
            <div className="border rounded-3 p-3 h-100" style={{backgroundColor: '#fff8f0'}}>
              <div className="fs-4 fw-bold text-warning mb-1">{monthlyWorkouts}</div>
              <small className="text-muted fw-semibold">Tháng này</small>
            </div>
          </Col>
          <Col xs={4} className="text-center">
            <div className="border rounded-3 p-3 h-100" style={{backgroundColor: '#f0fff4'}}>
              <div className="fs-4 fw-bold text-success mb-1">{totalHours}</div>
              <small className="text-muted fw-semibold">Tổng giờ</small>
            </div>
          </Col>
        </Row>

        {/* Average workout duration */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="text-muted fw-semibold">Thời gian tập trung bình</small>
            <span className="text-info fw-bold">{averageDuration} phút</span>
          </div>
          <div className="progress" style={{height: '6px'}}>
            <div 
              className="progress-bar bg-info" 
              role="progressbar" 
              style={{ 
                width: averageDuration > 0 
                  ? `${Math.min(averageDuration / 60 * 100, 100)}%`
                  : '0%'
              }}
            ></div>
          </div>
        </div>

        {/* Recent workout activity */}
        {recentWorkouts.length > 0 && (
          <div className="mb-4">
            <small className="text-muted fw-semibold d-block mb-2">Hoạt động gần đây</small>
            <div className="bg-light rounded-3 p-3">
              {recentWorkouts.map((workout, index) => (
                <div key={index} className={`d-flex justify-content-between align-items-center ${index < recentWorkouts.length - 1 ? 'mb-2 pb-2 border-bottom' : ''}`}>
                  <div>
                    <div className="fw-semibold text-dark" style={{fontSize: '0.9rem'}}>
                      {new Date(workout.date).toLocaleDateString('vi-VN')}
                    </div>
                    <small className="text-muted">
                      {workout.notes || 'Buổi tập luyện'}
                    </small>
                  </div>
                  <span className="badge bg-secondary">
                    {workout.durationMinutes || 0} phút
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="d-grid gap-2">
          <Button 
            variant="outline-primary" 
            href="/user/progress"
            className="fw-semibold"
            style={{borderWidth: '2px'}}
          >
            <i className="bi bi-graph-up me-2"></i> 
            Xem chi tiết tiến độ
          </Button>
          <Button 
            variant="success" 
            href="/user/workout"
            className="fw-semibold"
            size="sm"
          >
            <i className="bi bi-plus-circle me-2"></i> 
            Thêm buổi tập mới
          </Button>
        </div>

        {/* Empty state */}
        {totalWorkouts === 0 && (
          <div className="text-center py-4">
            <i className="bi bi-activity text-muted" style={{fontSize: '3rem'}}></i>
            <h6 className="text-muted mt-3">Chưa có dữ liệu tập luyện</h6>
            <p className="text-muted small">Bắt đầu ghi lại các buổi tập của bạn!</p>
            <Button variant="primary" href="/user/workout" className="mt-2">
              <i className="bi bi-plus-circle me-1"></i> Thêm buổi tập đầu tiên
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default WorkoutStatsCard;
