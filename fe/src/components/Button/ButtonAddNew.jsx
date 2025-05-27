import { FaPlus } from "react-icons/fa";

const ButtonAddNew = ({ handleAdd, label }) => {
    return (
        <button 
            className="btn btn-success btn-css"
            style={{ whiteSpace: 'nowrap'}}
            onClick={handleAdd}
        >
            <FaPlus/> <span style={{marginLeft: 5}}>{label}</span>
        </button>
    )
}


export default ButtonAddNew