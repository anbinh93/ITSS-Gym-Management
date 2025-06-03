import { useState, useEffect } from "react";
import ModalDetailFeedback from "../Admin/Modal/ModalDetailFeedback";
import { Button, Form } from "react-bootstrap";
import { getFeedbacksByTarget, updateFeedbackStatus } from "../../services/api";

export default function FeedbackManager() {
  const [filter, setFilter] = useState("Tất cả");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, [filter]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await getFeedbacksByTarget("GYM");
      if (response.success) {
        setFeedbacks(response.feedbacks);
      }
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const handleUpdateStatus = async (feedbackId, updateData) => {
    try {
      const response = await updateFeedbackStatus(feedbackId, updateData);
      if (response.success) {
        // Refresh feedbacks after update
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Error updating feedback status:", error);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) =>
    filter === "Tất cả" ? true : f.status === filter
  );

  return (
    <div>
      <h3 className="mb-3">Quản lý phản hồi hội viên</h3>

      <Form.Select
        onChange={handleFilterChange}
        value={filter}
        className="mb-3"
        style={{ maxWidth: 300 }}
      >
        <option value="Tất cả">Tất cả</option>
        <option value="PENDING">Chưa xử lý</option>
        <option value="IN_PROGRESS">Đang xử lý</option>
        <option value="RESOLVED">Đã xử lý</option>
        <option value="REJECTED">Từ chối</option>
      </Form.Select>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
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
              <tr key={fb._id}>
                <td>{fb.user?.name || "N/A"}</td>
                <td>{new Date(fb.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>{fb.target}</td>
                <td>{fb.message}</td>
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
      )}

      <ModalDetailFeedback
        show={showModal}
        handleClose={() => setShowModal(false)}
        feedback={selectedFeedback}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
