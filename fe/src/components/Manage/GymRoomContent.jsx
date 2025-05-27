import { useState } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ActionButtons from "../Button/ActionButtons";
import ModalForm from "../Admin/Modal/ModalForm";

export default function GymRoomContent() {
  const rooms = [
    {
      id: 1,
      roomCode: "GYM001",
      name: "Phòng Gym 1",
      roomType: "Gym",
      quantity: 2,
      status: "Hoạt động"
    },
    {
      id: 2,
      roomCode: "YOGA001",
      name: "Phòng Yoga 1",
      roomType: "Yoga",
      quantity: 1,
      status: "Không hoạt động"
    },
  ];

  const roomFields = [
    { name: 'roomCode', label: 'Mã phòng', placeholder: 'VD: GYM001' },
    { name: 'name', label: 'Tên phòng', placeholder: 'Nhập tên phòng' },
    {
      name: 'roomType',
      label: 'Loại phòng',
      type: 'select',
      options: [
        { label: 'Gym', value: 'Gym' },
        { label: 'Yoga', value: 'Yoga' },
        { label: 'Boxing', value: 'Boxing' },
      ]
    },
    { name: 'quantity', label: 'Số lượng', type: 'number', placeholder: 'Nhập số lượng' },
    {
      name: 'status',
      label: 'Trạng thái',
      type: 'radio',
      options: [
        { label: 'Hoạt động', value: 'Hoạt động' },
        { label: 'Bảo trì', value: 'Bảo trì' },
        { label: 'Không hoạt động', value: 'Không hoạt động' }
      ]
    }
  ];

  const titleModalAddRoom = "Thêm mới phòng tập";
  const titleModalEditRoom = "Cập nhật phòng tập";

  const [isShowModalAddRoom, setIsShowModalAddRoom] = useState(false);
  const [isShowModalEditRoom, setIsShowModalEditRoom] = useState(false);
  const [roomEdit, setRoomEdit] = useState({});

  const handleAddRoom = () => setIsShowModalAddRoom(true);
  const handleClose = () => setIsShowModalAddRoom(false);
  const handleCloseEdit = () => setIsShowModalEditRoom(false);

  const handleEditRoom = (room) => {
    setRoomEdit(room);
    setIsShowModalEditRoom(true);
  };

  const handleDeleteRoom = (id) => {
    alert(`Bạn có muốn xóa phòng có id ${id} này không?`);
  }

  const onSubmit = (data) => {
    console.log("Submit thành công:", data);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Quản lý thông tin phòng tập</h3>
        <ButtonAddNew handleAdd={handleAddRoom} label="Thêm mới"/>
      </div>
      <table className="table table-bordered mt-2">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Mã phòng</th>
            <th>Tên phòng</th>
            <th>Loại phòng</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.id}</td>
              <td>{room.roomCode}</td>
              <td>{room.name}</td>
              <td>{room.roomType}</td>
              <td>{room.quantity}</td>
              <td>
                <span
                  className={`badge ${
                    room.status === "Hoạt động"
                      ? "bg-success"
                      : room.status === "Bảo trì"
                      ? "bg-warning text-dark"
                      : "bg-danger"
                  }`}
                >
                  {room.status}
                </span>
              </td>
              <td>
                <ActionButtons
                  onEdit={() => handleEditRoom(room)}
                  onDelete={() => handleDeleteRoom(room.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalForm
        show={isShowModalAddRoom}
        handleClose={handleClose}
        title={titleModalAddRoom}
        fields={roomFields}
        data={{}}
        onSubmit={onSubmit}
      />
      <ModalForm
        show={isShowModalEditRoom}
        handleClose={handleCloseEdit}
        title={titleModalEditRoom}
        fields={roomFields}
        data={roomEdit}
        onSubmit={onSubmit}
      />
    </div>
  );
}
