import { useState, useEffect } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ModalForm from "../Admin/Modal/ModalForm";
import ActionButtons from "../Button/ActionButtons";
import UsageHistoryModal from "../Admin/Modal/UsageHistoryModal";
import { getAllUsers, register, updateUser, deleteUser, getAllPackages } from '../../services/api';
import { registerMembership, getAllMemberships, updateCoach } from '../../services/membershipApi';

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

  // Register modal states
  const [isShowModalRegister, setIsShowModalRegister] = useState(false);
  const [registerUserId, setRegisterUserId] = useState("");
  const [packages, setPackages] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [registerMsg, setRegisterMsg] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [coachUpdateMsg, setCoachUpdateMsg] = useState("");
  const [coachUpdateError, setCoachUpdateError] = useState("");

  // New state for memberships
  const [memberships, setMemberships] = useState([]);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    fetchPackages();
    fetchCoaches();
    fetchMemberships();
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

  const fetchPackages = async () => {
    try {
      const res = await getAllPackages();
      setPackages(res.packages || []);
    } catch (err) {
      setPackages([]);
    }
  };

  const fetchCoaches = async () => {
    try {
      const res = await getAllUsers();
      const coachUsers = (res.users || []).filter(u => u.role === 'coach');
      setCoaches(coachUsers);
    } catch (err) {
      setCoaches([]);
    }
  };

  const fetchMemberships = async () => {
    try {
      const res = await getAllMemberships();
      setMemberships(res.data?.memberships || res.data || []);
    } catch (err) {
      setMemberships([]);
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
    { name: "password", label: "Mật khẩu", type: "password", placeholder: "Nhập mật khẩu", required: true },
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
        password: data.password,
        phone: data.phone,
        birthYear: parseInt(data.birthYear),
        role: 'user',
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

  const handleOpenRegister = (userId) => {
    setRegisterUserId(userId);
    setIsShowModalRegister(true);
    setRegisterMsg("");
    setRegisterError("");
    setSelectedPackageId("");
  };

  const handleCloseRegister = () => {
    setIsShowModalRegister(false);
    setRegisterUserId("");
    setRegisterMsg("");
    setRegisterError("");
    setSelectedPackageId("");
  };

  const selectedPackage = packages.find(pkg => pkg._id === selectedPackageId);
  const registerFields = [
    {
      name: "packageId",
      label: "Gói tập",
      type: "select",
      options: packages.map((pkg) => ({ label: pkg.name, value: pkg._id })),
      onChange: (e) => setSelectedPackageId(e.target.value),
    },
    ...(selectedPackage && selectedPackage.withTrainer ? [{
      name: "coach",
      label: "Huấn luyện viên phụ trách",
      type: "select",
      options: coaches.map((c) => ({ label: `${c.name} (${c.email})`, value: c._id })),
    }] : []),
    {
      name: "paymentStatus",
      label: "Tình trạng thanh toán",
      type: "radio",
      options: [
        { value: "paid", label: "Đã thanh toán" },
        { value: "unpaid", label: "Chưa thanh toán" },
      ],
    },
  ];

  const onSubmitRegister = async (data) => {
    setRegisterMsg("");
    setRegisterError("");
    try {
      const submitData = { ...data, userId: registerUserId };
      if (submitData.coach === "") delete submitData.coach;
      const res = await registerMembership(submitData);
      if (res.success) {
        setRegisterMsg("Đăng ký gói tập thành công!");
        setTimeout(() => handleCloseRegister(), 1200);
      } else {
        setRegisterError(res.message || "Đăng ký gói tập thất bại");
      }
    } catch (err) {
      setRegisterError("Đăng ký gói tập thất bại");
    }
  };

  // Helper: Lấy membership active withTrainer cho user
  const getActiveMembershipWithTrainer = (userId) => {
    const userMemberships = memberships.filter(m => m.user && m.user._id === userId);
    // Ưu tiên membership active, nếu không có thì lấy gần nhất có withTrainer
    const active = userMemberships.find(m => m.package?.withTrainer && m.status === 'active');
    if (active) return active;
    // Nếu không có active, lấy gần nhất có withTrainer
    return userMemberships.reverse().find(m => m.package?.withTrainer);
  };

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
            <th>Huấn luyện viên</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center text-muted">
                {searchTerm ? 'Không tìm thấy hội viên nào' : 'Chưa có hội viên nào'}
              </td>
            </tr>
          ) : (
            filteredCustomers.map((customer, index) => {
              const membership = getActiveMembershipWithTrainer(customer._id);
              return (
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
                    {membership && membership.package?.withTrainer ? (
                      <select
                        className="form-select form-select-sm"
                        value={membership.coach?._id || ''}
                        onChange={async (e) => {
                          const coachId = e.target.value;
                          setCoachUpdateMsg("");
                          setCoachUpdateError("");
                          try {
                            const res = await updateCoach(membership._id, coachId);
                            if (res.success) {
                              setCoachUpdateMsg("Cập nhật HLV thành công!");
                              fetchMemberships();
                            } else {
                              setCoachUpdateError(res.message || "Cập nhật HLV thất bại");
                            }
                          } catch (err) {
                            setCoachUpdateError("Cập nhật HLV thất bại");
                          }
                        }}
                      >
                        <option value="">-- Chọn HLV --</option>
                        {coaches.map(c => (
                          <option key={c._id} value={c._id}>
                            {c.name} ({c.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-muted small">Không áp dụng</span>
                    )}
                  </td>
                  <td>
                    <ActionButtons
                      onEdit={() => handleEditCustomer(customer)}
                      onDelete={() => handleDeleteCustomer(customer._id)}
                    />
                    <button className="btn btn-sm btn-outline-primary mt-1" onClick={() => handleOpenRegister(customer._id)}>
                      Đăng ký gói tập
                    </button>
                  </td>
                </tr>
              );
            })
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

      <ModalForm
        show={isShowModalRegister}
        handleClose={handleCloseRegister}
        title="Đăng ký gói tập cho hội viên"
        fields={registerFields}
        data={{}}
        onSubmit={onSubmitRegister}
      />

      {registerMsg && <div className="alert alert-success my-2">{registerMsg}</div>}
      {registerError && <div className="alert alert-danger my-2">{registerError}</div>}
      {coachUpdateMsg && <div className="alert alert-success my-2">{coachUpdateMsg}</div>}
      {coachUpdateError && <div className="alert alert-danger my-2">{coachUpdateError}</div>}
    </div>
  );
}
