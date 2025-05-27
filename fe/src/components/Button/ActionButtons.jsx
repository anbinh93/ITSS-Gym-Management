import { MdEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";

const ActionButtons = ({ onEdit, onDelete }) => {
  return (
    <div>
      <button className="btn btn-primary btn-sm me-1" onClick={onEdit}>
        <MdEdit size={16} />
      </button>
      <button className="btn btn-danger btn-sm" onClick={onDelete}>
        <FaRegTrashAlt size={16} />
      </button>
    </div>
  );
};

export default ActionButtons;
