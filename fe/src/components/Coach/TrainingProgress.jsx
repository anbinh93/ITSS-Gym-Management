import React, { useState, useEffect, useCallback } from 'react';
import { getPendingWorkoutSessions, confirmWorkoutSession } from '../../services/workoutSessionApi';
import { useAuth } from '../../contexts/AuthContext';
import './TrainingProgress.css';

const TrainingProgress = () => {
  const { user } = useAuth();
  const [pendingSessions, setPendingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingSession, setConfirmingSession] = useState(null);

  const fetchPendingSessions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingWorkoutSessions();
      // Lọc chỉ những session mà coach này được assign
      const assignedSessions = data.sessions?.filter(session => 
        session.membership?.coach?._id === user.id
      ) || [];
      setPendingSessions(assignedSessions);
    } catch (error) {
      console.error('Error fetching pending sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'coach') {
      fetchPendingSessions();
    }
  }, [user, fetchPendingSessions]);

  const handleConfirmSession = async (sessionId, confirmed, notes = '') => {
    try {
      setConfirmingSession(sessionId);
      await confirmWorkoutSession(sessionId, {
        confirmed,
        notes
      });
      
      // Refresh danh sách
      await fetchPendingSessions();
      alert(confirmed ? 'Đã xác nhận buổi tập' : 'Đã từ chối buổi tập');
    } catch (error) {
      console.error('Error confirming session:', error);
      alert('Có lỗi xảy ra khi xác nhận buổi tập');
    } finally {
      setConfirmingSession(null);
    }
  };

  const formatDateTime = (date, time) => {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleDateString('vi-VN')} lúc ${time}`;
  };

  if (user?.role !== 'coach') {
    return (
      <div className="access-denied">
        <h3>Không có quyền truy cập</h3>
        <p>Chỉ huấn luyện viên mới có thể truy cập trang này.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="training-progress">
      <div className="page-header">
        <h2>Quản lý tiến độ tập luyện</h2>
        <p>Xác nhận các buổi tập của học viên được phân công</p>
      </div>

      {pendingSessions.length === 0 ? (
        <div className="no-sessions">
          <h3>Không có buổi tập nào cần xác nhận</h3>
          <p>Tất cả các buổi tập của học viên đã được xác nhận.</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {pendingSessions.map(session => (
            <div key={session._id} className="session-card">
              <div className="session-header">
                <div className="student-info">
                  <h4>{session.user?.name}</h4>
                  <span className="package-name">{session.membership?.package?.name}</span>
                </div>
                <div className="session-status">
                  <span className="status-pending">Chờ xác nhận</span>
                </div>
              </div>

              <div className="session-details">
                <div className="detail-row">
                  <span className="label">Thời gian:</span>
                  <span className="value">
                    {formatDateTime(session.workoutDate, session.startTime)} - {session.endTime}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="label">Bài tập:</span>
                  <span className="value">{session.exerciseName}</span>
                </div>

                {session.notes && (
                  <div className="detail-row">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{session.notes}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="label">Buổi còn lại:</span>
                  <span className="value">{session.membership?.sessionsRemaining} buổi</span>
                </div>
              </div>

              <div className="session-actions">
                <button
                  className="btn-confirm"
                  onClick={() => handleConfirmSession(session._id, true)}
                  disabled={confirmingSession === session._id}
                >
                  {confirmingSession === session._id ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                
                <button
                  className="btn-reject"
                  onClick={() => {
                    const notes = prompt('Lý do từ chối (không bắt buộc):');
                    if (notes !== null) { // User didn't cancel
                      handleConfirmSession(session._id, false, notes);
                    }
                  }}
                  disabled={confirmingSession === session._id}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingProgress;
