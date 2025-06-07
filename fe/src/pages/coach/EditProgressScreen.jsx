import React, { useEffect, useState } from 'react';
import TrainerLayout from '../../components/Coach/TrainerLayout';
import { getMembershipsByCoach } from '../../services/membershipApi';
import { getUserProgress, updateUserProgress, getCurrentUser, getAllUsers } from '../../services/api';

const EditProgressScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progress, setProgress] = useState({ weightHeight: [], calories: [], bodyFat: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch only users that this coach is responsible for
    const coach = getCurrentUser();
    if (coach && coach._id) {
      getMembershipsByCoach(coach._id).then(res => {
        if (res && res.success && res.data && res.data.length > 0) {
          const uniqueUsers = [];
          const userIds = new Set();
          (res.data || []).forEach(m => {
            if (m.user && m.user._id && !userIds.has(m.user._id)) {
              uniqueUsers.push(m.user);
              userIds.add(m.user._id);
            }
          });
          setUsers(uniqueUsers);
        } else {
          // Fallback: Nếu không có membership data, lấy tất cả users role='user' để test
          getAllUsers().then(usersRes => {
            if (usersRes && (usersRes.users || usersRes.data)) {
              const allUsers = usersRes.users || usersRes.data;
              const userList = allUsers.filter(u => u.role === 'user');
              setUsers(userList);
            }
          }).catch(error => {
            console.error('Error fetching all users:', error);
          });
        }
      }).catch(error => {
        console.error('Error fetching memberships:', error);
        // Fallback to all users on error
        getAllUsers().then(usersRes => {
          if (usersRes && (usersRes.users || usersRes.data)) {
            const allUsers = usersRes.users || usersRes.data;
            const userList = allUsers.filter(u => u.role === 'user');
            setUsers(userList);
          }
        });
      });
    } else {
      // Fallback nếu không có coach info
      getAllUsers().then(usersRes => {
        if (usersRes && (usersRes.users || usersRes.data)) {
          const allUsers = usersRes.users || usersRes.data;
          const userList = allUsers.filter(u => u.role === 'user');
          setUsers(userList);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      getUserProgress(selectedUser._id)
        .then(res => {
          if (res.success && res.progress) {
            setProgress({
              weightHeight: res.progress.weightHeight || [],
              calories: res.progress.calories || [],
              bodyFat: res.progress.bodyFat || []
            });
          } else {
            setProgress({ weightHeight: [], calories: [], bodyFat: [] });
          }
        })
        .catch(error => {
          console.error('Error fetching user progress:', error);
          setProgress({ weightHeight: [], calories: [], bodyFat: [] });
        })
        .finally(() => setLoading(false));
    }
  }, [selectedUser]);

  const handleChange = (type, idx, field, value) => {
    setProgress(prev => {
      const arr = [...prev[type]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [type]: arr };
    });
  };

  const handleAddRow = (type) => {
    setProgress(prev => ({ ...prev, [type]: [...prev[type], {}] }));
  };

  const handleRemoveRow = (type, idx) => {
    setProgress(prev => {
      const arr = [...prev[type]];
      arr.splice(idx, 1);
      return { ...prev, [type]: arr };
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await updateUserProgress(selectedUser._id, progress);
      if (res.success) setMessage('Lưu thành công!');
      else setMessage(res.message || 'Lỗi khi lưu');
    } catch (err) {
      setMessage('Lỗi khi lưu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TrainerLayout>
      <div className="container py-4">
        <h2 className="mb-4">Chỉnh sửa số liệu tiến độ học viên</h2>
        
        <div className="mb-3">
          <label>Chọn học viên:</label>
          <select className="form-select" value={selectedUser?._id || ''} onChange={e => {
            const user = users.find(u => u._id === e.target.value);
            setSelectedUser(user);
          }}>
            <option value=''>-- Chọn học viên --</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>
        {selectedUser && (
          <>
            <h5 className="mt-4">Cân nặng & Chiều cao</h5>
            <table className="table table-bordered">
              <thead><tr><th>Ngày</th><th>Cân nặng</th><th>Chiều cao</th><th></th></tr></thead>
              <tbody>
                {progress.weightHeight.map((row, idx) => (
                  <tr key={idx}>
                    <td><input value={row.date || ''} onChange={e => handleChange('weightHeight', idx, 'date', e.target.value)} className="form-control" /></td>
                    <td><input value={row.weight || ''} onChange={e => handleChange('weightHeight', idx, 'weight', e.target.value)} className="form-control" type="number" /></td>
                    <td><input value={row.height || ''} onChange={e => handleChange('weightHeight', idx, 'height', e.target.value)} className="form-control" type="number" /></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleRemoveRow('weightHeight', idx)}>Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-outline-primary mb-3" onClick={() => handleAddRow('weightHeight')}>Thêm dòng</button>

            <h5 className="mt-4">Calories</h5>
            <table className="table table-bordered">
              <thead><tr><th>Ngày</th><th>Mục tiêu</th><th>Thực tế</th><th></th></tr></thead>
              <tbody>
                {progress.calories.map((row, idx) => (
                  <tr key={idx}>
                    <td><input value={row.date || ''} onChange={e => handleChange('calories', idx, 'date', e.target.value)} className="form-control" /></td>
                    <td><input value={row.goal || ''} onChange={e => handleChange('calories', idx, 'goal', e.target.value)} className="form-control" type="number" /></td>
                    <td><input value={row.actual || ''} onChange={e => handleChange('calories', idx, 'actual', e.target.value)} className="form-control" type="number" /></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleRemoveRow('calories', idx)}>Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-outline-primary mb-3" onClick={() => handleAddRow('calories')}>Thêm dòng</button>

            <h5 className="mt-4">Body Fat</h5>
            <table className="table table-bordered">
              <thead><tr><th>Ngày</th><th>Giá trị (%)</th><th></th></tr></thead>
              <tbody>
                {progress.bodyFat.map((row, idx) => (
                  <tr key={idx}>
                    <td><input value={row.date || ''} onChange={e => handleChange('bodyFat', idx, 'date', e.target.value)} className="form-control" /></td>
                    <td><input value={row.value || ''} onChange={e => handleChange('bodyFat', idx, 'value', e.target.value)} className="form-control" type="number" /></td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => handleRemoveRow('bodyFat', idx)}>Xóa</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-outline-primary mb-3" onClick={() => handleAddRow('bodyFat')}>Thêm dòng</button>

            <div className="mt-4">
              <button className="btn btn-success" onClick={handleSave} disabled={loading}>Lưu số liệu</button>
              {message && <span className="ms-3 text-success">{message}</span>}
            </div>
          </>
        )}
      </div>
    </TrainerLayout>
  );
};

export default EditProgressScreen; 