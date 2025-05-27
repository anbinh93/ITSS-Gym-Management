// components/common/ModalForm.js
import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalForm = ({ 
  show, 
  handleClose, 
  title, 
  fields = [], // Các field của 1 input
  data = {}, // Dữ liệu truyền vào modal
  onSubmit 
}) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data); 
  }, [data]);

  const handleChange = (e, field) => {
    const { name, type, checked, value } = e.target;
    if (field.type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    onSubmit(formData);
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {fields.map((field, idx) => {
            const value = formData[field.name] ?? (field.type === 'checkbox' ? false : '');
            
            return (
              <Form.Group key={idx} className="mb-3">
                {field.type !== 'radio' && (
                  <Form.Label>{field.label}</Form.Label>
                )}

                {field.type === 'select' ? (
                  <Form.Select
                    name={field.name}
                    value={value}
                    onChange={(e) => handleChange(e, field)}
                  >
                    <option value="">-- Chọn --</option>
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                  </Form.Select>
                ) : field.type === 'radio' ? (
                  <div>
                    {field.options.map((opt, i) => (
                      <Form.Check
                        key={i}
                        inline
                        type="radio"
                        label={opt.label}
                        name={field.name}
                        value={opt.value}
                        checked={formData[field.name] === opt.value}
                        onChange={(e) => handleChange(e, field)}
                      />
                      ))
                    } 
                  </div>
                ) : (
                  <Form.Control
                    type={field.type || 'text'}
                    placeholder={field.placeholder || ''}
                    name={field.name}
                    value={value}
                    onChange={(e) => handleChange(e, field)}
                  />
                )}
              </Form.Group>
            );
          })}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>Hủy</Button>
        <Button variant="primary" onClick={handleSave}>Lưu</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalForm;
