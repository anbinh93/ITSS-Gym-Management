import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function ModalDetailFeedback({ show, handleClose, feedback, onUpdateStatus }) {
  const [adminResponse, setAdminResponse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(feedback?.status || "PENDING");

  const handleSubmit = () => {
    onUpdateStatus(feedback._id, {
      status: selectedStatus,
      adminResponse: adminResponse
    });
    handleClose();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: "warning", text: "Chờ xử lý" },
      IN_PROGRESS: { variant: "info", text: "Đang xử lý" },
      RESOLVED: { variant: "success", text: "Đã xử lý" },
      REJECTED: { variant: "danger", text: "Từ chối" }
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
  };

  if (!feedback) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết phản hồi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row mb-3">
          <div className="col-md-6">
            <p><strong>Hội viên:</strong> {feedback.user?.name || "N/A"}</p>
            <p><strong>Email:</strong> {feedback.user?.email || "N/A"}</p>
            <p><strong>Ngày gửi:</strong> {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Loại phản hồi:</strong> {feedback.target}</p>
            <p><strong>Đánh giá:</strong> {"⭐".repeat(feedback.rating)}</p>
            <p><strong>Trạng thái:</strong> {getStatusBadge(feedback.status)}</p>
          </div>
        </div>

        <div className="mb-3">
          <h6>Nội dung phản hồi:</h6>
          <div className="p-3 bg-light rounded">
            {feedback.message}
          </div>
        </div>

        {feedback.adminResponse && (
          <div className="mb-3">
            <h6>Phản hồi của admin:</h6>
            <div className="p-3 bg-light rounded">
              <p className="mb-1">{feedback.adminResponse.message}</p>
              <small className="text-muted">
                Bởi: {feedback.adminResponse.updatedBy?.name} - 
                {new Date(feedback.adminResponse.updatedAt).toLocaleDateString('vi-VN')}
              </small>
            </div>
          </div>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="PENDING">Chờ xử lý</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã xử lý</option>
              <option value="REJECTED">Từ chối</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phản hồi của admin</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Nhập phản hồi của bạn..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
