export default function RecentUsageTable({ data }) {
  return (
    <div className="card mt-4">
      <div className="card-header">Lịch sử tập luyện gần đây</div>
      <div className="card-body table-responsive">
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Họ tên</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Dịch vụ</th>
              <th>Mức độ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.date}</td>
                <td>{item.customerName}</td>
                <td>{item.checkIn}</td>
                <td>{item.checkOut}</td>
                <td>{item.services.join(", ")}</td>
                <td>{item.participationLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
