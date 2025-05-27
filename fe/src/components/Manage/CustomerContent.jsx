import { useState } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ModalForm from "../Admin/Modal/ModalForm";
import ActionButtons from "../Button/ActionButtons";
import UsageHistoryModal from "../Admin/Modal/UsageHistoryModal";


export default function CustomerContent() {
  const customers = [
    {
      id: 1,
      name: "Hiếu",
      age: 30,
      job: "Lập trình viên",
      contact: "hieu@gmail.com",
      birthday: "1994-05-10",
      address: "Hà Nội",
      ticketType: "Vip",
      fingerprint: true,
      createdAt: "2020-03-04",
    },
    {
      id: 2,
      name: "Đức",
      age: 25,
      job: "Chơi vơi",
      contact: "duc@gmail.com",
      birthday: "1998-02-15",
      address: "Hà Nội",
      ticketType: "Thường",
      fingerprint: false,
      createdAt: "2020-03-02",
    },
  ];

  const usageHistory = [
    { 
      id: 1,
      customerId: 1,
      date: "2025-05-10",
      checkIn: "08:00",
      checkOut: "09:30",
      services: ["Gym", "Xông hơi"],
      participationLevel: "Tích cực",
    },
    {
      id: 2,
      customerId: 1,
      date: "2025-05-12",
      checkIn: "08:00",
      checkOut: "09:30",
      services: ["Gym", "Xông hơi"],
      participationLevel: "Tích cực",
    },
    {
      id: 3,
      customerId: 2,
      date: "2025-05-10",
      checkIn: "08:00",
      checkOut: "09:30",
      services: ["Zoga", "Xông hơi"],
      participationLevel: "Trung bình",
    }
  ];

  // Trường thông tin của Modal
  const customerFields = [
    { name: "name", label: "Họ và tên", placeholder: "Nhập họ tên" },
    { name: "age", label: "Tuổi", type: "number", placeholder: "Nhập tuổi" },
    { name: "job", label: "Nghề nghiệp", placeholder: "Nhập nghề nghiệp" },
    { name: "contact", label: "Liên hệ", placeholder: "Email hoặc số điện thoại" },
    { name: "birthday", label: "Ngày sinh", type: "date" },
    { name: "address", label: "Địa chỉ", placeholder: "Nhập địa chỉ" },
    {
      name: "ticketType",
      label: "Loại thành viên",
      type: "select",
      options: [
        { label: "Thường", value: "Thường" },
        { label: "Vip", value: "Vip" },
      ],
    },
    {
      name: "fingerprint",
      label: "Dấu vân tay",
      type: "select",
      options: [
        { label: "Có", value: true },
        { label: "Không", value: false },
      ],
    },
    { name: "createdAt", label: "Ngày đăng ký", type: "date" },
  ];

  const [isShowModalAddCustomer, setIsShowModalAddCustomer] = useState(false);
  const [isShowModalEditCustomer, setIsShowModalEditCustomer] = useState(false);
  const [customerEdit, setCustomerEdit] = useState({});

  const [isShowHistoryModal, setIsShowHistoryModal] = useState(false);
  const [historyCustomerName, setHistoryCustomerName] = useState("");
  const [historyData, setHistoryData] = useState([]);


  const toggleHistory = (customer) => {
    setHistoryCustomerName(customer.name);
    setHistoryData(usageHistory.filter(h => h.customerId === customer.id));
    setIsShowHistoryModal(true);
  };


  const titleModalAddCustomer = "Thêm mới hội viên";
  const titleModalEditCustomer = "Cập nhật thông tin hội viên";

  const handleAddCustomer = () => setIsShowModalAddCustomer(true);
  const handleCloseAdd = () => setIsShowModalAddCustomer(false);
  const handleCloseEdit = () => setIsShowModalEditCustomer(false);

  const handleEditCustomer = (customer) => {
    setCustomerEdit(customer);
    setIsShowModalEditCustomer(true);
  };

  const onSubmit = (data) => {
    console.log("Submit thành công:", data);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Danh sách hội viên</h3>
        <ButtonAddNew handleAdd={handleAddCustomer} label="Thêm mới" />
      </div>

      <form className="d-flex mt-2" role="search">
        <input
          className="form-control"
          style={{ width: 200, marginRight: "10px" }}
          type="search"
          placeholder="Nhập tên khách hàng"
          aria-label="Search"
        />
        <button className="btn btn-outline-success" type="submit">
          Tìm kiếm
        </button>
      </form>

      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Họ và tên</th>
            <th>Tuổi</th>
            <th>Nghề nghiệp</th>
            <th>Liên hệ</th>
            <th>Ngày sinh</th>
            <th>Địa chỉ</th>
            <th>Loại thành viên</th>
            <th>Dấu vân tay</th>
            <th>Ngày đăng ký</th>
            <th>Lịch sử tập luyện</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.age}</td>
                <td>{customer.job}</td>
                <td>{customer.contact}</td>
                <td>{customer.birthday}</td>
                <td>{customer.address}</td>
                <td>{customer.ticketType}</td>
                <td>{customer.fingerprint ? "Có" : "Không"}</td>
                <td>{customer.createdAt}</td>
                <td>
                  <button
                    className="btn btn-link btn-sm text-primary"
                    onClick={() => toggleHistory(customer)}
                  >
                    Xem lịch sử
                  </button>
                </td>
                <td>
                  <ActionButtons
                    onEdit={() => handleEditCustomer(customer)}
                    onDelete={() => {}}
                  />
                </td>
              </tr>
          ))}
        </tbody>

      </table>

      <ModalForm
        show={isShowModalAddCustomer}
        handleClose={handleCloseAdd}
        title={titleModalAddCustomer}
        fields={customerFields}
        data={{}}
        onSubmit={onSubmit}
      />

      <ModalForm
        show={isShowModalEditCustomer}
        handleClose={handleCloseEdit}
        title={titleModalEditCustomer}
        fields={customerFields}
        data={customerEdit}
        onSubmit={onSubmit}
      />

      <UsageHistoryModal
        show={isShowHistoryModal}
        handleClose={() => setIsShowHistoryModal(false)}
        data={historyData}
        customerName={historyCustomerName}
      />
    </div>
  );
}
