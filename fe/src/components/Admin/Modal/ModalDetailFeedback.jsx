import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function ModalDetailFeedback({ show, handleClose, feedback, handleMarkAsResolved }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chi tiết phản hồi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Hội viên:</strong> {feedback.memberName}</p>
        <p><strong>Ngày gửi:</strong> {feedback.date}</p>
        <p><strong>Loại phản hồi:</strong> {feedback.type}</p>
        <p><strong>Nội dung:</strong> {feedback.content}</p>
        <p><strong>Trạng thái:</strong> {feedback.status}</p>
      </Modal.Body>
      <Modal.Footer>
        {feedback.status === "Chưa xử lý" && (
              <Button
                variant="success"
                onClick={() => handleMarkAsResolved(feedback.id)}
              >
                Đánh dấu đã xử lý
              </Button>
            )}
        <Button variant="secondary" onClick={handleClose}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
}
