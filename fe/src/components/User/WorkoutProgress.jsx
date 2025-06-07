import React, { useState, useEffect, useCallback } from 'react';
import { getUserWorkoutProgress, getUserWorkoutSessions, createWorkoutSession } from '../../services/workoutSessionApi';
import { getActiveMembership } from '../../services/membershipApi';
import { useAuth } from '../../contexts/AuthContext';
import './WorkoutProgress.css';

const WorkoutProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSession, setNewSession] = useState({
    membershipId: '',
    workoutDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    exerciseName: '',
    notes: ''
  });

  const fetchUserMemberships = useCallback(async () => {
    try {
      const data = await getActiveMembership(user.id);
      setMemberships(data.memberships || []);
      if (data.memberships && data.memberships.length > 0) {
        setSelectedMembership(data.memberships[0]);
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  }, [user]);

  const fetchProgressAndSessions = useCallback(async () => {
    if (!selectedMembership) return;
    
    try {
      setLoading(true);
      const [progressData, sessionsData] = await Promise.all([
        getUserWorkoutProgress(selectedMembership._id),
        getUserWorkoutSessions(user.id)
      ]);
      
      setProgress(progressData.progress);
      setSessions(sessionsData.sessions || []);
    } catch (error) {
      console.error('Error fetching progress and sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMembership, user]);

  useEffect(() => {
    if (user) {
      fetchUserMemberships();
    }
  }, [user, fetchUserMemberships]);

  useEffect(() => {
    if (selectedMembership) {
      fetchProgressAndSessions();
    }
  }, [selectedMembership, fetchProgressAndSessions]);

  const handleAddSession = async (e) => {
    e.preventDefault();
    try {
      await createWorkoutSession({
        ...newSession,
        membershipId: selectedMembership._id
      });
      
      // Reset form
      setNewSession({
        membershipId: '',
        workoutDate: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        exerciseName: '',
        notes: ''
      });
      setShowAddSession(false);
      
      // Refresh data
      fetchProgressAndSessions();
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Có lỗi xảy ra khi thêm buổi tập');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Chờ xác nhận' },
      confirmed: { class: 'status-confirmed', text: 'Đã xác nhận' },
      rejected: { class: 'status-rejected', text: 'Từ chối' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="workout-progress">
      <div className="progress-header">
        <h2>Tiến độ tập luyện</h2>
        
        {memberships.length > 1 && (
          <select 
            value={selectedMembership?._id || ''}
            onChange={(e) => {
              const membership = memberships.find(m => m._id === e.target.value);
              setSelectedMembership(membership);
            }}
            className="membership-select"
          >
            {memberships.map(membership => (
              <option key={membership._id} value={membership._id}>
                {membership.package?.name} - {new Date(membership.startDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedMembership && (
        <div className="membership-info">
          <h3>{selectedMembership.package?.name}</h3>
          <div className="membership-details">
            <p><strong>Thời hạn:</strong> {new Date(selectedMembership.startDate).toLocaleDateString()} - {new Date(selectedMembership.endDate).toLocaleDateString()}</p>
            <p><strong>Số buổi còn lại:</strong> {selectedMembership.sessionsRemaining}</p>
            {selectedMembership.coach && (
              <p><strong>HLV phụ trách:</strong> {selectedMembership.coach.name}</p>
            )}
          </div>
        </div>
      )}

      {progress && (
        <div className="progress-section">
          <h3>Tiến độ hoàn thành</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-number">{progress.completedSessions}</span>
              <span className="stat-label">Buổi đã tập</span>
            </div>
            <div className="stat">
              <span className="stat-number">{progress.totalSessions}</span>
              <span className="stat-label">Tổng số buổi</span>
            </div>
          </div>
        </div>
      )}

      <div className="sessions-section">
        <div className="sessions-header">
          <h3>Lịch sử tập luyện</h3>
          <button 
            className="btn-primary"
            onClick={() => setShowAddSession(true)}
          >
            Thêm buổi tập
          </button>
        </div>

        {showAddSession && (
          <div className="add-session-form">
            <form onSubmit={handleAddSession}>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày tập</label>
                  <input
                    type="date"
                    value={newSession.workoutDate}
                    onChange={(e) => setNewSession({...newSession, workoutDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Giờ kết thúc</label>
                  <input
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tên bài tập</label>
                <input
                  type="text"
                  value={newSession.exerciseName}
                  onChange={(e) => setNewSession({...newSession, exerciseName: e.target.value})}
                  placeholder="Ví dụ: Push Day, Leg Day, Cardio..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  placeholder="Ghi chú thêm về buổi tập..."
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Thêm buổi tập</button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowAddSession(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <p className="no-sessions">Chưa có buổi tập nào được ghi nhận.</p>
          ) : (
            sessions.map(session => (
              <div key={session._id} className="session-card">
                <div className="session-header">
                  <div className="session-date">
                    {new Date(session.workoutDate).toLocaleDateString('vi-VN')}
                  </div>
                  {getStatusBadge(session.confirmationStatus)}
                </div>
                <div className="session-details">
                  <p><strong>Bài tập:</strong> {session.exerciseName}</p>
                  <p><strong>Thời gian:</strong> {session.startTime} - {session.endTime}</p>
                  {session.notes && <p><strong>Ghi chú:</strong> {session.notes}</p>}
                  {session.confirmedBy && (
                    <p><strong>Xác nhận bởi:</strong> {session.confirmedBy.name}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutProgress;
