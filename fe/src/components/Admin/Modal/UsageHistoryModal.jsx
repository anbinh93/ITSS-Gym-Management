import { Modal, Button, Table } from "react-bootstrap";

export default function UsageHistoryModal({ show, handleClose, data = [], customerName = "" }) {
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Lịch sử tập luyện: {customerName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {data.length === 0 ? (
          <p>Chưa có dữ liệu lịch sử tập luyện.</p>
        ) : (
          <Table bordered hover>
            <thead className="table-light">
              <tr>
                <th>Ngày</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Dịch vụ đã sử dụng</th>
                <th>Mức độ tham gia</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.checkIn}</td>
                  <td>{item.checkOut}</td>
                  <td>{item.services.join(", ")}</td>
                  <td>{item.participationLevel}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
