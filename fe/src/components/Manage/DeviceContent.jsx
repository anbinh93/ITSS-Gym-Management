import { useState, useEffect } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import './DeviceContent.css';
import ModalForm from "../Admin/Modal/ModalForm";
import ActionButtons from "../Button/ActionButtons";
import { getAllDevices, createDevice, updateDevice, deleteDevice } from '../../services/api';

export default function DeviceContent() {
  // State management
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [isShowModalAddDevice, setIsShowModalAddDevice] = useState(false);
  const [isShowModalEditDevice, setIsShowModalEditDevice] = useState(false);
  const [deviceEdit, setDeviceEdit] = useState({});

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAllDevices();
      if (response.success) {
        setDevices(response.equipment || []);
      } else {
        setError("Không thể tải danh sách thiết bị");
      }
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError("Lỗi kết nối API");
    } finally {
      setLoading(false);
    }
  };

  // Mapping backend fields to frontend display
  const getStatusDisplay = (condition) => {
    switch (condition) {
      case 'Good': return 'Tốt';
      case 'Needs Maintenance': return 'Bảo trì';
      case 'Broken': return 'Hỏng';
      default: return condition;
    }
  };

  const getConditionFromStatus = (status) => {
    switch (status) {
      case '1': return 'Good';
      case '2': return 'Broken';
      case '3': return 'Needs Maintenance';
      default: return 'Good';
    }
  };

  // Các trường của Modal (cập nhật để phù hợp với backend model)
  const deviceFields = [
    { name: 'name', label: 'Tên thiết bị', placeholder: 'Nhập tên thiết bị' },
    { name: 'quantity', label: 'Số lượng', type: 'number', placeholder: 'Nhập số lượng' },
    { name: 'purchaseDate', label: 'Ngày mua', type: 'date'},
    { name: 'warrantyExpiry', label: 'Hết hạn bảo hành', type: 'date'},
    { name: 'notes', label: 'Ghi chú', placeholder: 'VD: Thiết bị dành cho cardio'},
    {
      name: 'condition',
      label: 'Tình trạng',
      type: 'select',
      options: [
        { label: 'Tốt', value: '1' },
        { label: 'Hỏng', value: '2' },
        { label: 'Bảo trì', value: '3' }
      ]
    }
  ];

  // Event handlers
  const handleAddDevice = () => setIsShowModalAddDevice(true);
  const handleClose = () => setIsShowModalAddDevice(false);
  const handleCloseEdit = () => setIsShowModalEditDevice(false);

  const handleEditDevice = (device) => {
    // Transform device data for form
    const editData = {
      ...device,
      condition: device.condition === 'Good' ? '1' : 
                 device.condition === 'Broken' ? '2' : '3',
      purchaseDate: device.purchaseDate ? new Date(device.purchaseDate).toISOString().split('T')[0] : '',
      warrantyExpiry: device.warrantyExpiry ? new Date(device.warrantyExpiry).toISOString().split('T')[0] : ''
    };
    setDeviceEdit(editData);
    setIsShowModalEditDevice(true);
  };

  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      try {
        const response = await deleteDevice(deviceId);
        if (response.success) {
          fetchDevices(); // Reload data
        } else {
          alert('Xóa thiết bị thất bại: ' + response.message);
        }
      } catch (err) {
        console.error("Error deleting device:", err);
        alert('Lỗi khi xóa thiết bị');
      }
    }
  };

  const onSubmitAdd = async (data) => {
    try {
      const deviceData = {
        ...data,
        condition: getConditionFromStatus(data.condition),
        quantity: parseInt(data.quantity)
      };
      
      const response = await createDevice(deviceData);
      if (response.success) {
        setIsShowModalAddDevice(false);
        fetchDevices(); // Reload data
      } else {
        alert('Thêm thiết bị thất bại: ' + response.message);
      }
    } catch (err) {
      console.error("Error creating device:", err);
      alert('Lỗi khi thêm thiết bị');
    }
  };

  const onSubmitEdit = async (data) => {
    try {
      const deviceData = {
        ...data,
        condition: getConditionFromStatus(data.condition),
        quantity: parseInt(data.quantity)
      };
      
      const response = await updateDevice(deviceEdit._id, deviceData);
      if (response.success) {
        setIsShowModalEditDevice(false);
        fetchDevices(); // Reload data
      } else {
        alert('Cập nhật thiết bị thất bại: ' + response.message);
      }
    } catch (err) {
      console.error("Error updating device:", err);
      alert('Lỗi khi cập nhật thiết bị');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải danh sách thiết bị...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Lỗi!</h4>
        <p>{error}</p>
        <button className="btn btn-outline-danger" onClick={fetchDevices}>
          Thử lại
        </button>
      </div>
    );
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
            <th>STT</th>
            <th>Tên thiết bị</th>
            <th>Số lượng</th>
            <th>Ngày mua</th>
            <th>Hết hạn bảo hành</th>
            <th>Ghi chú</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {devices.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center text-muted">
                Chưa có thiết bị nào
              </td>
            </tr>
          ) : (
            devices.map((device, index) => (
              <tr key={device._id}>
                <td>{index + 1}</td>
                <td>{device.name}</td>
                <td>{device.quantity}</td>
                <td>{device.purchaseDate ? new Date(device.purchaseDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>{device.warrantyExpiry ? new Date(device.warrantyExpiry).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>{device.notes || 'Không có'}</td>
                <td>
                  <span className={`badge ${
                    device.condition === 'Good' ? 'bg-success' :
                    device.condition === 'Needs Maintenance' ? 'bg-warning' : 'bg-danger'
                  }`}>
                    {getStatusDisplay(device.condition)}
                  </span>
                </td>
                <td>
                  <ActionButtons
                    onEdit={() => handleEditDevice(device)}
                    onDelete={() => handleDeleteDevice(device._id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <ModalForm
        show={isShowModalAddDevice}
        handleClose={handleClose}
        title="Thêm mới thiết bị"
        fields={deviceFields}
        data={{}}
        onSubmit={onSubmitAdd} 
      />
      
      <ModalForm
        show={isShowModalEditDevice}
        handleClose={handleCloseEdit}
        title="Cập nhật thiết bị"
        fields={deviceFields}
        data={deviceEdit}
        onSubmit={onSubmitEdit} 
      />
    </div>
  );
}
