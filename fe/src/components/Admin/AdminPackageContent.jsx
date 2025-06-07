import { useState, useEffect } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ActionButtons from "../Button/ActionButtons";
import ModalForm from "./Modal/ModalForm";
import { getAllPackages, createPackage, updatePackage, deletePackage, getAllUsers } from '../../services/api';
import { getAllMemberships, registerMembership, updatePaymentStatus, updateCoach } from '../../services/membershipApi';

export default function AdminPackageContent() {
  const [packages, setPackages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [memberships, setMemberships] = useState([]);

  const [isShowModalAddPackage, setIsShowModalAddPackage] = useState(false);
  const [isShowModalAddRegistration, setIsShowModalAddRegistration] = useState(false);
  const [packageEdit, setPackageEdit] = useState({});

  const [coaches, setCoaches] = useState([]);
  const [isShowModalEditCoach, setIsShowModalEditCoach] = useState(false);
  const [membershipEdit, setMembershipEdit] = useState({});

  // Fetch packages and users from backend
  const fetchPackages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllPackages();
      setPackages(res.packages || []);
    } catch (err) {
      setError(err.message || "Lỗi tải gói tập");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllUsers();
      // Lọc chỉ lấy user/member
      const customerUsers = (res.users || []).filter(u => u.role === 'user' || u.role === 'member');
      setUsers(customerUsers);
    } catch (err) {
      setError(err.message || "Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllUsers();
      const coachUsers = (res.users || []).filter(u => u.role === 'coach');
      setCoaches(coachUsers);
    } catch (err) {
      setError(err.message || "Lỗi tải danh sách HLV");
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllMemberships();
      setMemberships(res.data?.memberships || []);
    } catch (err) {
      setError(err.message || "Lỗi tải danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchUsers();
    fetchCoaches();
    fetchMemberships();
  }, []);

  const packageFields = [
    { name: "name", label: "Tên gói", placeholder: "VD: Gói 6 tháng" },
    { name: "durationInDays", label: "Thời hạn (ngày)", type: "number", placeholder: "VD: 180" },
    { name: "sessionLimit", label: "Số buổi tập", type: "number", placeholder: "VD: 30" },
    { name: "price", label: "Giá tiền (VNĐ)", type: "number", placeholder: "VD: 1000000" },
    { name: "withTrainer", label: "Có HLV riêng?", type: "select", options: [
      { label: "Không", value: false },
      { label: "Có", value: true }
    ] },
  ];

  const [selectedPackageId, setSelectedPackageId] = useState("");
  const selectedPackage = packages.find(pkg => pkg._id === selectedPackageId);
  const registrationFields = [
    {
      name: "userId",
      label: "Khách hàng",
      type: "select",
      options: users.map((u) => ({ label: `${u.name} (${u.email})`, value: u._id })),
    },
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

  const handleAddPackage = () => {
    setPackageEdit({}); // Clear any existing package edit data
    setIsShowModalAddPackage(true);
  };
  const handleAddRegistration = () => setIsShowModalAddRegistration(true);
  const handleClose = () => {
    setIsShowModalAddPackage(false);
    setIsShowModalAddRegistration(false);
    setIsShowModalEditCoach(false);
    setPackageEdit({}); // Clear package edit data when modal closes
  };

  const handleEditPackage = (pkg) => {
    setPackageEdit(pkg);
    setIsShowModalAddPackage(true);
  };

  const handleDeletePackage = async (id) => {
    setLoading(true);
    setError("");
    try {
      await deletePackage(id);
      await fetchPackages();
    } catch (err) {
      setError(err.message || "Lỗi xóa gói tập");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPackage = async (data) => {
    setLoading(true);
    setError("");
    try {
      if (packageEdit && packageEdit._id) {
        await updatePackage(packageEdit._id, data);
      } else {
        await createPackage(data);
      }
      setIsShowModalAddPackage(false);
      await fetchPackages();
    } catch (err) {
      setError(err.message || "Lỗi lưu gói tập");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRegistration = async (data) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const submitData = { ...data };
      if (submitData.coach === "") delete submitData.coach;
      const res = await registerMembership(submitData);
      if (res.success) {
        setSuccessMsg("Đăng ký gói tập thành công!");
        setIsShowModalAddRegistration(false);
        fetchMemberships();
      } else {
        setError(res.message || "Đăng ký gói tập thất bại");
      }
    } catch (err) {
      setError(err.message || "Đăng ký gói tập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await updatePaymentStatus(id, 'paid');
      if (res.success) {
        setSuccessMsg('Cập nhật trạng thái thành công!');
        fetchMemberships();
      } else {
        setError(res.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (err) {
      setError(err.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCoach = (membership) => {
    setMembershipEdit(membership);
    setIsShowModalEditCoach(true);
  };

  const handleCloseCoach = () => {
    setIsShowModalEditCoach(false);
    setMembershipEdit({});
  };

  const onSubmitCoach = async (formData) => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await updateCoach(membershipEdit._id, formData.coach);
      if (res.success) {
        setSuccessMsg('Cập nhật HLV thành công!');
        setIsShowModalEditCoach(false);
        fetchMemberships();
      } else {
        setError(res.message || 'Cập nhật HLV thất bại');
      }
    } catch (err) {
      setError(err.message || 'Cập nhật HLV thất bại');
    } finally {
      setLoading(false);
    }
  };

  const coachFields = [
    {
      name: "coach",
      label: "Huấn luyện viên",
      type: "select",
      options: [
        { label: "Không có HLV", value: "" },
        ...coaches.map((c) => ({ label: `${c.name} (${c.email})`, value: c._id })),
      ],
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h3>Quản lý gói tập</h3>
        <div className="d-flex gap-2">
          <ButtonAddNew handleAdd={handleAddPackage} label="Thêm gói tập" />
          <ButtonAddNew handleAdd={handleAddRegistration} label="Đăng ký mới" />
        </div>
      </div>

      <h5 className="mt-4">Danh sách gói tập</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Tên gói</th>
            <th>Thời hạn (ngày)</th>
            <th>Số buổi tập</th>
            <th>Giá (VNĐ)</th>
            <th>HLV riêng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg._id}>
              <td>{pkg.name}</td>
              <td>{pkg.durationInDays}</td>
              <td>{pkg.sessionLimit}</td>
              <td>{pkg.price?.toLocaleString()}</td>
              <td>{pkg.withTrainer ? 'Có' : 'Không'}</td>
              <td>
                <ActionButtons
                  onEdit={() => handleEditPackage(pkg)}
                  onDelete={() => handleDeletePackage(pkg._id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h5 className="mt-4">Đăng ký và thanh toán</h5>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Gói tập</th>
            <th>HLV phụ trách</th>
            <th>Ngày đăng ký</th>
            <th>Ngày kết thúc</th>
            <th>Trạng thái thanh toán</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((m) => (
            <tr key={m._id}>
              <td>{m._id}</td>
              <td>{m.user?.name || ''}</td>
              <td>{m.package?.name || ''}</td>
              <td>{m.coach?.name || 'Chưa có'}</td>
              <td>{m.startDate ? new Date(m.startDate).toLocaleDateString() : ''}</td>
              <td>{m.endDate ? new Date(m.endDate).toLocaleDateString() : ''}</td>
              <td>{m.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  {m.paymentStatus === 'unpaid' && (
                    <button className="btn btn-sm btn-success" onClick={() => handleMarkAsPaid(m._id)}>
                      Đánh dấu đã thanh toán
                    </button>
                  )}
                  <button className="btn btn-sm btn-primary" onClick={() => handleEditCoach(m)}>
                    Chỉnh sửa HLV
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <div className="alert alert-danger my-2">{error}</div>}
      {successMsg && <div className="alert alert-success my-2">{successMsg}</div>}

      <ModalForm
        show={isShowModalAddPackage}
        handleClose={handleClose}
        title="Thiết lập gói tập"
        fields={packageFields}
        data={packageEdit}
        onSubmit={onSubmitPackage}
      />

      <ModalForm
        show={isShowModalAddRegistration}
        handleClose={handleClose}
        title="Đăng ký gói tập"
        fields={registrationFields}
        data={{}}
        onSubmit={onSubmitRegistration}
      />

      <ModalForm
        show={isShowModalEditCoach}
        handleClose={handleCloseCoach}
        title="Chỉnh sửa huấn luyện viên"
        fields={coachFields}
        data={{ coach: membershipEdit.coach?._id || "" }}
        onSubmit={onSubmitCoach}
      />
    </div>
  );
}
