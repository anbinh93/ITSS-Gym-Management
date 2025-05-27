import { useState } from "react";
import ModalDetailFeedback from "../Admin/Modal/ModalDetailFeedback";
import { Button, Form } from "react-bootstrap";

const mockFeedbacks = [
  {
    id: 1,
    memberName: "Nguyễn Văn A",
    date: "2025-05-10",
    type: "Nhân viên",
    content: "Huấn luyện viên không nhiệt tình.",
    status: "Chưa xử lý",
  },
  {
    id: 2,
    memberName: "Trần Thị B",
    date: "2025-05-12",
    type: "Cơ sở vật chất",
    content: "Phòng xông hơi bị hỏng.",
    status: "Đã xử lý",
  },
  {
    id: 3,
    memberName: "Lê Văn C",
    date: "2025-05-13",
    type: "Nhân viên",
    content: "Tiếp tân rất thân thiện.",
    status: "Chưa xử lý",
  },
];

export default function FeedbackManager() {
  const [filter, setFilter] = useState("Tất cả");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleView = (feedback) => {
    setSelectedFeedback(feedback);
    setShowModal(true);
  };

  const filteredFeedbacks = mockFeedbacks.filter((f) =>
    filter === "Tất cả" ? true : f.status === filter
  );

  const handleMarkAsResolved = (id) => {
    const updated = mockFeedbacks.map((fb) =>
      fb.id === id ? { ...fb, status: "Đã xử lý" } : fb
    );
    setSelectedFeedback(updated);
    setShowModal(false);
  };

  return (
    <div>
      <h3 className="mb-3">Quản lý phản hồi hội viên</h3>

      <Form.Select
        onChange={handleFilterChange}
        value={filter}
        className="mb-3"
        style={{ maxWidth: 300 }}
      >
        <option>Tất cả</option>
        <option>Chưa xử lý</option>
        <option>Đã xử lý</option>
      </Form.Select>

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
