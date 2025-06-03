import { useEffect, useState } from "react";
import ButtonAddNew from "../Button/ButtonAddNew";
import ActionButtons from "../Button/ActionButtons";
import ModalForm from "../Admin/Modal/ModalForm";
import { getAllGymRooms, createGymRoom, updateGymRoom, deleteGymRoom } from '../../services/api';

export default function GymRoomContent() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isShowModalAddRoom, setIsShowModalAddRoom] = useState(false);
  const [isShowModalEditRoom, setIsShowModalEditRoom] = useState(false);
  const [roomEdit, setRoomEdit] = useState({});

  // Lấy danh sách phòng tập
  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllGymRooms();
      setRooms(res.rooms || []);
    } catch (err) {
      setError(err.message || "Lỗi tải phòng tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const roomFields = [
    { name: 'name', label: 'Tên phòng', placeholder: 'Nhập tên phòng', required: true },
    { name: 'location', label: 'Vị trí', placeholder: 'Nhập vị trí' },
    { name: 'capacity', label: 'Sức chứa', type: 'number', placeholder: 'Nhập sức chứa' },
    { name: 'description', label: 'Mô tả', placeholder: 'Nhập mô tả' },
    { name: 'status', label: 'Tình trạng', type: 'select', options: [
      { value: 'available', label: 'Sẵn sàng' },
      { value: 'unavailable', label: 'Không sẵn sàng' }
    ], required: true }
  ];

  const titleModalAddRoom = "Thêm mới phòng tập";
  const titleModalEditRoom = "Cập nhật phòng tập";

  const handleAddRoom = () => {
    setRoomEdit({});
    setIsShowModalAddRoom(true);
  };
  const handleClose = () => setIsShowModalAddRoom(false);
  const handleCloseEdit = () => setIsShowModalEditRoom(false);

  const handleEditRoom = (room) => {
    setRoomEdit(room);
    setIsShowModalEditRoom(true);
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Bạn có muốn xóa phòng này không?")) return;
    setLoading(true);
    setError("");
    try {
      await deleteGymRoom(id);
      await fetchRooms();
    } catch (err) {
      setError(err.message || "Lỗi xóa phòng");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      if (isShowModalAddRoom) {
        await createGymRoom(data);
        setIsShowModalAddRoom(false);
      } else if (isShowModalEditRoom && roomEdit && roomEdit._id) {
        await updateGymRoom(roomEdit._id, data);
        setIsShowModalEditRoom(false);
      }
      await fetchRooms();
    } catch (err) {
      setError(err.message || "Lỗi lưu phòng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Quản lý thông tin phòng tập</h3>
        <ButtonAddNew handleAdd={handleAddRoom} label="Thêm mới"/>
      </div>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-danger">{error}</div>}
      <table className="table table-bordered mt-2">
        <thead className="table-light">
          <tr>
            <th>Tên phòng</th>
            <th>Vị trí</th>
            <th>Sức chứa</th>
            <th>Mô tả</th>
            <th>Tình trạng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room._id}>
              <td>{room.name}</td>
              <td>{room.location}</td>
              <td>{room.capacity}</td>
              <td>{room.description}</td>
              <td>{room.status === 'available' ? 'Sẵn sàng' : 'Không sẵn sàng'}</td>
              <td>
                <ActionButtons
                  onEdit={() => handleEditRoom(room)}
                  onDelete={() => handleDeleteRoom(room._id)}
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
