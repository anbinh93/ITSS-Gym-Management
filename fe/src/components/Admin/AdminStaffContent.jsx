import { useState } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ActionButtons from "../Button/ActionButtons";
import ModalForm from "./Modal/ModalForm";

export default function AdminStaffContent() {
  // Dữ liệu fake
  const staffs = [
    {
      id: 1,
      username: "admin",
      name: "Vu Ngoc Duc",
      email: "admin@gmail.com",
      phone: "0922123131",
      role: "Quản lý hệ thống",
      status: "active",
      group: "Quản lý"
    },
    {
      id: 2,
      username: "hieujr",
      name: "Nguyen Thanh Hieu",
      email: "hieu@gmail.com",
      phone: "09225423131",
      role: "Nhân viên",
      status: "inactive",
      group: "Nhân viên kinh doanh"
    },
  ];

  // Các trường trong Modal
  const staffFields = [
    { name: 'username', label: 'Tên đăng nhập', placeholder: 'staff123' },
    { name: 'name', label: 'Họ và tên', placeholder: 'Nguyễn Văn A' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'abc@gmail.com' },
    { name: 'phone', label: 'Số điện thoại', placeholder: '0245789123' },
    {
      name: 'role',
      label: 'Vai trò',
      type: 'select',
      options: [
        { label: 'Quản lý hệ thống', value: 'admin' },
        { label: 'Nhân viên kinh doanh', value: 'sales' },
        { label: 'Chăm sóc khách hàng', value: 'support' },
        { label: 'Huấn luyện viên cá nhân', value: 'trainer' }
      ]
    },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'radio',
      options: [
        { value: 'active', label: 'Đang hoạt động' },
        { value: 'inactive', label: 'Không hoạt động' },
      ]
    }
  ];

  // Tên của Modal
  const titleModalAddStaff = 'Thêm mới nhân sự';
  const titleModalEditStaff = 'Cập nhật nhân sự';

  // State
  const [isShowModalAddStaff, setIsShowModalAddStaff] = useState(false);
  const [isShowModalEditStaff, setIsShowModalEditStaff] = useState(false);
  const [staffEdit, setStaffEdit] = useState({});

  const handleAddStaff = () => setIsShowModalAddStaff(true);
  const handleClose = () => setIsShowModalAddStaff(false);
  const handleCloseEdit = () => setIsShowModalEditStaff(false);

  const handleEditStaff = (staff) => {
    setStaffEdit(staff);
    setIsShowModalEditStaff(true);
  };

  const handleDeleteStaff = (id) => {
    alert(`Bạn có muốn xóa nhân sự có id ${id} này không?`);
  };

  const onSubmit = (data) => {
    console.log("Submit thành công: ", data);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h3>Danh sách nhân sự</h3>
        <ButtonAddNew handleAdd={handleAddStaff} label="Thêm mới"/>
      </div>

      <form className="d-flex flex-wrap mt-2 gap-2" role="search">
        <input className="form-control" style={{ width: 200 }} type="text" placeholder="Tên tài khoản" />
        <input className="form-control" style={{ width: 200 }} type="text" placeholder="Số điện thoại" />
        <input className="form-control" style={{ width: 200 }} type="text" placeholder="Vai trò" />
        <button className="btn btn-outline-success" type="submit">Tìm kiếm</button>
      </form>

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên đăng nhập</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
            <th>Nhóm</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {staffs.map((staff) => (
            <tr key={staff.id}>
              <td>{staff.id}</td>
              <td>{staff.username}</td>
              <td>{staff.name}</td>
              <td>{staff.email}</td>
              <td>{staff.phone}</td>
              <td>{staff.role}</td>
              <td>{staff.group}</td>
              <td>{staff.status}</td>
              <td>
                <ActionButtons
                  onEdit={() => handleEditStaff(staff)}
                  onDelete={() => handleDeleteStaff(staff.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalForm
        show={isShowModalAddStaff}
        handleClose={handleClose}
        title={titleModalAddStaff}
        fields={staffFields}
        data={{}}
        onSubmit={onSubmit}
      />
      <ModalForm
        show={isShowModalEditStaff}
        handleClose={handleCloseEdit}
        title={titleModalEditStaff}
        fields={staffFields}
        data={staffEdit}
        onSubmit={onSubmit}
      />
    </div>
  );
}
