import { useEffect, useState } from "react";
import ModalDetailFeedback from "../Admin/Modal/ModalDetailFeedback";
import { Button, Form } from "react-bootstrap";
import { getFeedbacksByTarget } from '../../services/api';

const FEEDBACK_TARGETS = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Nhân viên', value: 'STAFF' },
  { label: 'Cơ sở vật chất', value: 'GYM' },
  { label: 'Huấn luyện viên', value: 'TRAINER' },
];

export default function FeedbackManager() {
  const [filter, setFilter] = useState("Tất cả");
  const [target, setTarget] = useState('ALL');
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError("");
      try {
        let allFeedbacks = [];
        if (target === 'ALL') {
          // Lấy tất cả loại feedback
          const staff = await getFeedbacksByTarget('STAFF');
          const gym = await getFeedbacksByTarget('GYM');
          const trainer = await getFeedbacksByTarget('TRAINER');
          allFeedbacks = [
            ...(staff.feedbacks || []),
            ...(gym.feedbacks || []),
            ...(trainer.feedbacks || [])
          ];
        } else {
          const res = await getFeedbacksByTarget(target);
          allFeedbacks = res.feedbacks || [];
        }
        // Chuẩn hóa dữ liệu cho bảng
        setFeedbacks(allFeedbacks.map(fb => ({
          id: fb._id,
          memberName: fb.user?.name || 'Ẩn danh',
          date: new Date(fb.createdAt).toLocaleDateString('vi-VN'),
          type: fb.target === 'GYM' ? 'Cơ sở vật chất' : fb.target === 'STAFF' ? 'Nhân viên' : 'Huấn luyện viên',
          content: fb.message,
          status: fb.status || 'Chưa xử lý', // Nếu backend có trường status
        })));
      } catch (err) {
        setError('Lỗi tải phản hồi');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [target]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleTargetChange = (e) => {
    setTarget(e.target.value);
  };

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const filteredFeedbacks = feedbacks.filter((f) =>
    filter === "Tất cả" ? true : f.status === filter
  );

  // Nếu backend có API update status, gọi ở đây. Nếu không thì cập nhật local.
  const handleMarkAsResolved = (id) => {
    setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, status: "Đã xử lý" } : fb));
    setShowModal(false);
  };

  return (
    <div>
      <h3 className="mb-3">Quản lý phản hồi hội viên</h3>
      <div className="d-flex gap-2 mb-3">
        <Form.Select
          onChange={handleTargetChange}
          value={target}
          style={{ maxWidth: 220 }}
        >
          {FEEDBACK_TARGETS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
        <Form.Select
          onChange={handleFilterChange}
          value={filter}
          style={{ maxWidth: 180 }}
        >
          <option>Tất cả</option>
          <option>Chưa xử lý</option>
          <option>Đã xử lý</option>
        </Form.Select>
      </div>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-danger">{error}</div>}
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Hội viên</th>
            <th>Ngày gửi</th>
            <th>Loại phản hồi</th>
            <th>Nội dung</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredFeedbacks.map((fb) => (
            <tr key={fb.id}>
              <td>{fb.memberName}</td>
              <td>{fb.date}</td>
              <td>{fb.type}</td>
              <td>{fb.content}</td>
              <td>{fb.status}</td>
              <td>
                <Button size="sm" variant="primary" onClick={() => handleView(fb)}>
                  Xem chi tiết
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ModalDetailFeedback
        show={showModal}
        handleClose={() => setShowModal(false)}
        feedback={selectedFeedback || {}}
        handleMarkAsResolved={handleMarkAsResolved}
      />
    </div>
  );
}
