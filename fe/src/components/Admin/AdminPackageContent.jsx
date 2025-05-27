import { useState } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ActionButtons from "../Button/ActionButtons";
import ModalForm from "./Modal/ModalForm";

export default function AdminPackageContent() {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: "Gói 3 tháng",
      duration: 3,
      type: "Thông thường",
      price: 1500000,
    },
    {
      id: 2,
      name: "Gói tập cá nhân VIP",
      duration: 1,
      type: "Huấn luyện viên riêng",
      price: 3000000,
    },
  ]);

  const [registrations, setRegistrations] = useState([
    {
      id: 1,
      customerName: "Nguyễn Văn A",
      packageName: "Gói 3 tháng",
      registerDate: "2024-05-10",
      status: "Đã thanh toán",
    },
  ]);

  const [isShowModalAddPackage, setIsShowModalAddPackage] = useState(false);
  const [isShowModalAddRegistration, setIsShowModalAddRegistration] = useState(false);
  const [packageEdit, setPackageEdit] = useState({});

  const packageFields = [
    { name: "name", label: "Tên gói", placeholder: "VD: Gói 6 tháng" },
    { name: "duration", label: "Thời hạn (tháng)", type: "number", placeholder: "VD: 6" },
    {
      name: "type",
      label: "Loại gói",
      type: "select",
      options: [
        { label: "Theo buổi", value: "buoi" },
        { label: "Thông thường", value: "thongthuong" },
        { label: "VIP", value: "vip" },
        { label: "Huấn luyện viên riêng", value: "pt" },
      ],
    },
    { name: "price", label: "Giá tiền (VNĐ)", type: "number", placeholder: "VD: 1000000" },
  ];

  const registrationFields = [
    { name: "customerName", label: "Họ tên khách hàng", placeholder: "VD: Trần Thị B" },
    {
      name: "packageName",
      label: "Gói tập",
      type: "select",
      options: packages.map((pkg) => ({
        label: pkg.name,
        value: pkg.name,
      })),
    },
    { name: "registerDate", label: "Ngày đăng ký", type: "date" },
    {
      name: "status",
      label: "Tình trạng thanh toán",
      type: "radio",
      options: [
        { value: "Đã thanh toán", label: "Đã thanh toán" },
        { value: "Chưa thanh toán", label: "Chưa thanh toán" },
      ],
    },
  ];

  const handleAddPackage = () => setIsShowModalAddPackage(true);
  const handleAddRegistration = () => setIsShowModalAddRegistration(true);
  const handleClose = () => {
    setIsShowModalAddPackage(false);
    setIsShowModalAddRegistration(false);
  };

  const handleEditPackage = (pkg) => {
    setPackageEdit(pkg);
    setIsShowModalAddPackage(true);
  };

  const handleDeletePackage = (id) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  const onSubmitPackage = (data) => {
    console.log("Gói tập mới:", data);
    setPackages([...packages, { ...data, id: Date.now() }]);
    setIsShowModalAddPackage(false);
  };

  const onSubmitRegistration = (data) => {
    console.log("Đăng ký mới:", data);
    setRegistrations([...registrations, { ...data, id: Date.now() }]);
    setIsShowModalAddRegistration(false);
  };

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
            <th>ID</th>
            <th>Tên gói</th>
            <th>Thời hạn (tháng)</th>
            <th>Loại</th>
            <th>Giá (VNĐ)</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg) => (
            <tr key={pkg.id}>
              <td>{pkg.id}</td>
              <td>{pkg.name}</td>
              <td>{pkg.duration}</td>
              <td>{pkg.type}</td>
              <td>{pkg.price.toLocaleString()}</td>
              <td>
                <ActionButtons
                  onEdit={() => handleEditPackage(pkg)}
                  onDelete={() => handleDeletePackage(pkg.id)}
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
            <th>Ngày đăng ký</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id}>
              <td>{reg.id}</td>
              <td>{reg.customerName}</td>
              <td>{reg.packageName}</td>
              <td>{reg.registerDate}</td>
              <td>{reg.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
    </div>
  );
}
