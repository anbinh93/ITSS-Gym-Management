import { useState } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import './DeviceContent.css';
import ModalForm from "../Admin/Modal/ModalForm";
import ActionButtons from "../Button/ActionButtons";

export default function DeviceContent() {
  // Dữ liệu fake
  const devices = [
    { 
      id: 1,
      deviceCode: "D001",
      name: "Máy chạy",
      quantity: 5,
      importDate: "2022-03-01",
      warranty: "24 tháng",
      origin: "Nhật Bản",
      status: "Hỏng",
    },
    { 
      id: 2,
      deviceCode: "D002",
      name: "Tạ tay",
      quantity: 20,
      importDate: "2023-01-15",
      warranty: "12 tháng",
      origin: "Việt Nam",
      status: "Tốt",
    },
    { 
      id: 3,
      deviceCode: "D003",
      name: "Xà đơn",
      quantity: 10,
      importDate: "2021-12-20",
      warranty: "18 tháng",
      origin: "Hàn Quốc",
      status: "Bảo trì",
    },
  ];
  // Các trường của Modal
  const deviceFields = [
      { name: 'deviceCode', label: 'Mã thiết bị', placeholder: 'VD: D001' },
      { name: 'name', label: 'Tên thiết bị', placeholder: 'Nhập tên thiết bị' },
      { name: 'quantity', label: 'Số lượng', type: 'number', placeholder: 'Nhập số lượng' },
      { name: 'importDate', label: 'Ngày nhập', type: 'date'},
      { name: 'warranty', label: 'Thời gian bảo hành', placeholder: 'VD: 12 tháng'},
      { name: 'origin', label: 'Xuất xứ', placeholder: 'VD: Việt Nam'},
      {
        name: 'statusDevice',
        label: 'Tình trạng',
        type: 'select',
        options: [
          { label: 'Tốt', value: '1' },
          { label: 'Hỏng', value: '2' },
          { label: 'Bảo trì', value: '3' }
        ]
      }
    ];
  // Tên của Modal
  const titleModalAddDevice = 'Thêm mới thiết bị'
  const titleModalEditDevice = 'Cập nhật thiết bị'

  const [isShowModalAddDevice, setIsShowModalAddDevice] = useState(false);
  const [isShowModalEditDevice, setIsShowModalEditDevice] = useState(false);
  const [deviceEdit, setDeviceEdit] = useState({});

  const handleAddDevice = () => setIsShowModalAddDevice(true);
  const handleClose = () => setIsShowModalAddDevice(false);
  const handleCloseEdit = () => setIsShowModalEditDevice(false);

  const handleEditDevice = (device) => {
    setDeviceEdit(device);
    setIsShowModalEditDevice(true);
  };

  const onSubmit = (data) => {
      console.log("Submit thành công: ", data)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Quản lý thiết bị tập luyện</h3>
        <ButtonAddNew handleAdd={handleAddDevice} label="Thêm mới"/>
      </div>
      <table className="table table-bordered mt-2">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Mã thiết bị</th>
            <th>Tên thiết bị</th>
            <th>Số lượng</th>
            <th>Ngày nhập</th>
            <th>Bảo hành</th>
            <th>Xuất xứ</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{device.deviceCode}</td>
              <td>{device.name}</td>
              <td>{device.quantity}</td>
              <td>{device.importDate}</td>
              <td>{device.warranty}</td>
              <td>{device.origin}</td>
              <td>{device.status}</td>
              <td>
                <ActionButtons
                  onEdit={() => handleEditDevice(device)}
                  onDelete={() => {}}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ModalForm
        show={isShowModalAddDevice}
        handleClose={handleClose}
        title={titleModalAddDevice}
        fields={deviceFields}
        data={{}}
        onSubmit={onSubmit} 
      />
      <ModalForm
        show={isShowModalEditDevice}
        handleClose={handleCloseEdit}
        title={titleModalEditDevice}
        fields={deviceFields}
        data={deviceEdit}
        onSubmit={onSubmit} 
      />
    </div>
  );
}
