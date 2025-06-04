import { useState, useEffect } from "react";
import { Table } from "react-bootstrap";
import ButtonAddNew from "../Button/ButtonAddNew";
import ActionButtons from "../Button/ActionButtons";
import ModalForm from "../Admin/Modal/ModalForm"; 
import { getAllMemberships } from '../../services/membershipApi';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isShowModalAdd, setIsShowModalAdd] = useState(false);
  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [selectedSub, setSelectedSub] = useState({}); // để sửa

  // Fetch memberships from backend
  useEffect(() => {
    setLoading(true);
    getAllMemberships()
      .then(res => {
        if (res.success && Array.isArray(res.data.memberships || res.data)) {
          // Map về format FE cần
          const mapped = (res.data.memberships || res.data).map(m => ({
            id: m._id,
            name: m.user?.name || '',
            registrationDate: m.startDate ? new Date(m.startDate).toLocaleDateString('vi-VN') : '',
            endDate: m.endDate ? new Date(m.endDate).toLocaleDateString('vi-VN') : '',
            type: m.package?.durationInDays >= 365 ? 'yearly' : (m.package?.durationInDays >= 28 ? 'monthly' : 'daily'),
            packageName: m.package?.name || '',
            renewalStatus: m.paymentStatus === 'paid' ? (new Date(m.endDate) < new Date() ? 'expired' : 'renewed') : 'pending',
            paymentStatus: m.paymentStatus,
            sessionsRemaining: m.sessionsRemaining,
          }));
          setSubscriptions(mapped);
        } else {
          setError(res.message || 'Không thể tải danh sách đăng ký.');
        }
      })
      .catch(() => setError('Không thể kết nối tới server.'))
      .finally(() => setLoading(false));
  }, []);

  // Lọc theo type và status
  const filteredData = subscriptions.filter((sub) => {
    return (
      (filterType === "" || sub.type === filterType) &&
      (filterStatus === "" || sub.renewalStatus === filterStatus)
    );
  });

  const titleModalAddSub = 'Thêm mới đăng ký'
  const titleModalEditSub = 'Cập nhật đăng ký'

  const handleAddSub = () => setIsShowModalAdd(true);
  const handleCloseAdd = () => setIsShowModalAdd(false);
  const handleCloseEdit = () => setIsShowModalEdit(false);

  const handleEditSub = (sub) => {
    setSelectedSub(sub);
    setIsShowModalEdit(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đăng ký này?")) {
      setSubscriptions((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = (data) => {
    console.log(data)
  }

  const subscriptionFields = [
    {
      label: "Họ và tên",
      name: 'name',
      type: "text",
      placeholder: 'VD: Nguyễn Văn A'
    },
    {
      label: "Ngày đăng ký",
      name: 'registrationDate',
      type: "date",
    },
    {
      label: "Loại đăng ký",
      name: 'type',
      type: "select",
      options: [
        { label: "Theo buổi", value: "daily" },
        { label: "Theo tháng", value: "monthly" },
        { label: "Theo năm", value: "yearly" },
      ],
    },
    {
      label: "Tình trạng gia hạn",
      name: "renewalStatus",
      type: "select",
      options: [
        { label: "Chưa gia hạn", value: "pending" },
        { label: "Đã gia hạn", value: "renewed" },
        { label: "Hết hạn", value: "expired" },
      ],
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Danh sách đăng ký & gia hạn</h3>
        <ButtonAddNew handleAdd={handleAddSub} label="Thêm mới"/>
      </div>

      <form className="d-flex mt-2 gap-2" role="search">
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">-- Tất cả loại đăng ký --</option>
          <option value="daily">Theo buổi</option>
          <option value="monthly">Theo tháng</option>
          <option value="yearly">Theo năm</option>
        </select>

        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">-- Tất cả tình trạng --</option>
          <option value="pending">Chưa gia hạn</option>
          <option value="renewed">Đã gia hạn</option>
          <option value="expired">Hết hạn</option>
        </select>
      </form>

      {loading && <div className="text-center my-3">Đang tải dữ liệu...</div>}
      {error && <div className="alert alert-danger my-3">{error}</div>}

      <Table bordered hover responsive className="mt-3">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Họ và tên</th>
            <th>Gói tập</th>
            <th>Ngày đăng ký</th>
            <th>Ngày kết thúc</th>
            <th>Loại đăng ký</th>
            <th>Tình trạng gia hạn</th>
            <th>Trạng thái thanh toán</th>
            <th>Số buổi còn lại</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            filteredData.map((sub, index) => (
              <tr key={sub.id}>
                <td>{sub.id}</td>
                <td>{sub.name}</td>
                <td>{sub.packageName}</td>
                <td>{sub.registrationDate}</td>
                <td>{sub.endDate}</td>
                <td>
                  {{
                    daily: "Theo buổi",
                    monthly: "Theo tháng",
                    yearly: "Theo năm",
                  }[sub.type]}
                </td>
                <td>
                  {{
                    pending: "Chưa gia hạn",
                    renewed: "Đã gia hạn",
                    expired: "Hết hạn",
                  }[sub.renewalStatus]}
                </td>
                <td>{sub.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                <td>{sub.sessionsRemaining ?? ''}</td>
                <td>
                <ActionButtons
                  onEdit={() => handleEditSub(sub)}
                  onDelete={() => handleDelete(sub.id)}
                />
              </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <ModalForm
        show={isShowModalAdd}
        handleClose={handleCloseAdd}
        title={titleModalAddSub}
        fields={subscriptionFields}
        data={{}}
        onSubmit={handleSubmit} 
      />
      <ModalForm
        show={isShowModalEdit}
        handleClose={handleCloseEdit}
        title={titleModalEditSub}
        fields={subscriptionFields}
        data={selectedSub}
        onSubmit={handleSubmit} 
      />
    </div>
  );
};

export default SubscriptionManagement;
