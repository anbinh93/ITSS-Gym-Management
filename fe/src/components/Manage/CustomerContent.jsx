import { useState, useEffect } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ModalForm from "../Admin/Modal/ModalForm";
import ActionButtons from "../Button/ActionButtons";
import UsageHistoryModal from "../Admin/Modal/UsageHistoryModal";
import { getAllUsers, register, updateUser, deleteUser } from '../../services/api';

export default function CustomerContent() {
  // State management
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isShowModalAddCustomer, setIsShowModalAddCustomer] = useState(false);
  const [isShowModalEditCustomer, setIsShowModalEditCustomer] = useState(false);
  const [customerEdit, setCustomerEdit] = useState({});

  // History modal states
  const [isShowHistoryModal, setIsShowHistoryModal] = useState(false);
  const [historyCustomerName, setHistoryCustomerName] = useState("");
  const [historyData, setHistoryData] = useState([]);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllUsers();
      if (response.success) {
        // Filter only customers (users with role 'user' or 'member')
        const customerUsers = (response.users || []).filter(
          user => user.role === 'user' || user.role === 'member'
        );
        setCustomers(customerUsers);
      } else {
        setError("Không thể tải danh sách hội viên");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  // Calculate age from birth year
  const calculateAge = (birthYear) => {
    if (!birthYear) return 'N/A';
    return new Date().getFullYear() - birthYear;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Trường thông tin của Modal (mapping với User model)
  const customerFields = [
    { name: "name", label: "Họ và tên", placeholder: "Nhập họ tên" },
    { name: "email", label: "Email", type: "email", placeholder: "Nhập email" },
    { name: "phone", label: "Số điện thoại", placeholder: "Nhập số điện thoại" },
    { name: "birthYear", label: "Năm sinh", type: "number", placeholder: "VD: 1990" },
    {
      name: "gender",
      label: "Giới tính",
      type: "select",
      options: [
        { label: "Nam", value: "Male" },
        { label: "Nữ", value: "Female" },
        { label: "Khác", value: "Other" }
      ]
    },
    { name: "username", label: "Tên đăng nhập", placeholder: "Nhập username" },
    { name: "password", label: "Mật khẩu", type: "password", placeholder: "Nhập mật khẩu" },
  ];

  // Edit customer fields (without password)
  const customerEditFields = customerFields.filter(field => field.name !== 'password');

  // Event handlers
  const handleAddCustomer = () => setIsShowModalAddCustomer(true);
  const handleCloseAdd = () => setIsShowModalAddCustomer(false);
  const handleCloseEdit = () => setIsShowModalEditCustomer(false);

  const handleEditCustomer = (customer) => {
    setCustomerEdit(customer);
    setIsShowModalEditCustomer(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hội viên này?')) {
      try {
        const response = await deleteUser(customerId);
        if (response.success) {
          fetchCustomers(); // Reload data
        } else {
          alert('Xóa hội viên thất bại: ' + response.message);
        }
      } catch (err) {
        console.error("Error deleting customer:", err);
        alert('Lỗi khi xóa hội viên');
      }
    }
  };

  const toggleHistory = (customer) => {
    setHistoryCustomerName(customer.name);
    // Mock usage history for now (can be replaced with real API later)
    const mockHistory = [
      { 
        id: 1,
        date: new Date().toISOString().split('T')[0],
        checkIn: "08:00",
        checkOut: "09:30",
        services: ["Gym", "Cardio"],
        participationLevel: "Tích cực",
      }
    ];
    setHistoryData(mockHistory);
    setIsShowHistoryModal(true);
  };

  const onSubmitAdd = async (data) => {
    try {
      // Generate username if not provided
      let username = data.username;
      if (!username || username.trim() === "") {
        const timestamp = Date.now();
        if (data.email && data.email.includes("@")) {
          username = data.email.split("@")[0] + "_" + timestamp;
        } else if (data.name) {
          username = data.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() + "_" + timestamp;
        } else {
          username = "customer_" + timestamp;
        }
      }

      const customerData = {
        name: data.name,
        email: data.email,
        password: data.password || '123456', // Default password
        phone: data.phone,
        birthYear: parseInt(data.birthYear),
        role: 'member', // Set role as member for customers
        gender: data.gender || 'Other',
        username: username
      };
      
      const response = await register(
        customerData.name,
        customerData.email,
        customerData.password,
        customerData.phone,
        customerData.birthYear,
        customerData.role,
        customerData.gender,
        customerData.username
      );
      
      if (response.success) {
        setIsShowModalAddCustomer(false);
        fetchCustomers(); // Reload data
      } else {
        alert('Thêm hội viên thất bại: ' + response.message);
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      alert('Lỗi khi thêm hội viên');
    }
  };

  const onSubmitEdit = async (data) => {
    try {
      const customerData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthYear: parseInt(data.birthYear),
        gender: data.gender,
        username: data.username
      };
      
      const response = await updateUser(customerEdit._id, customerData);
      if (response.success) {
        setIsShowModalEditCustomer(false);
        fetchCustomers(); // Reload data
      } else {
        alert('Cập nhật hội viên thất bại: ' + response.message);
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      alert('Lỗi khi cập nhật hội viên');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter customers based on search term
    // This is done on frontend for now, can be moved to backend later
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  // Loading state
  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải danh sách hội viên...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Lỗi!</h4>
        <p>{error}</p>
        <button className="btn btn-outline-danger" onClick={fetchCustomers}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Danh sách hội viên</h3>
        <ButtonAddNew handleAdd={handleAddCustomer} label="Thêm mới" />
      </div>

      <form className="d-flex mt-2" role="search" onSubmit={handleSearch}>
        <input
          className="form-control"
          style={{ width: 200, marginRight: "10px" }}
          type="search"
          placeholder="Nhập tên khách hàng"
          aria-label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-outline-success" type="submit">
          Tìm kiếm
        </button>
      </form>

      <table className="table table-bordered mt-3">
        <thead className="table-light">
          <tr>
            <th>STT</th>
            <th>Họ và tên</th>
            <th>Tuổi</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Giới tính</th>
            <th>Username</th>
            <th>Ngày đăng ký</th>
            <th>Lịch sử tập luyện</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center text-muted">
                {searchTerm ? 'Không tìm thấy hội viên nào' : 'Chưa có hội viên nào'}
              </td>
            </tr>
          ) : (
            filteredCustomers.map((customer, index) => (
              <tr key={customer._id}>
                <td>{index + 1}</td>
                <td>{customer.name}</td>
                <td>{calculateAge(customer.birthYear)}</td>
                <td>{customer.email}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>{customer.gender === 'Male' ? 'Nam' : customer.gender === 'Female' ? 'Nữ' : 'Khác'}</td>
                <td>{customer.username}</td>
                <td>{formatDate(customer.createdAt)}</td>
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
                    onDelete={() => handleDeleteCustomer(customer._id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ModalForm
        show={isShowModalAddCustomer}
        handleClose={handleCloseAdd}
        title="Thêm mới hội viên"
        fields={customerFields}
        data={{}}
        onSubmit={onSubmitAdd}
      />

      <ModalForm
        show={isShowModalEditCustomer}
        handleClose={handleCloseEdit}
        title="Cập nhật thông tin hội viên"
        fields={customerEditFields}
        data={customerEdit}
        onSubmit={onSubmitEdit}
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
