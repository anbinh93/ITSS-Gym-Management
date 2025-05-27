import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, Modal } from 'react-bootstrap';

const Profile = () => {
    // State cho thông tin người dùng
    const [profile, setProfile] = useState({
        fullName: 'Nguyễn Thanh Hiếu',
        email: 'hieu@gmail.com',
        phone: '0912345678',
        dob: '2004-08-09',
        gender: 'male',
        address: 'Cổ Bi, Gia Lâm, Hà Nội',
        emergencyContact: '0987654321',
        membershipType: 'premium',
        startDate: '2023-01-01',
        expiryDate: '2025-01-01',
        fitnessGoals: 'Giảm cân, Tăng cơ',
        healthConditions: 'Không có',
        profileImage: 'https://via.placeholder.com/150'
    });

    // State cho chế độ chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);

    // State cho form tạm thời khi chỉnh sửa
    const [tempProfile, setTempProfile] = useState({ ...profile });

    // State cho thông báo
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // State cho loading
    const [loading, setLoading] = useState(false);

    // State cho modal xác nhận
    const [showConfirm, setShowConfirm] = useState(false);

    // Xử lý khi thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setTempProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Bắt đầu chế độ chỉnh sửa
    const handleEdit = () => {
        setTempProfile({ ...profile });
        setIsEditing(true);
    };

    // Hủy chỉnh sửa
    const handleCancel = () => {
        if (JSON.stringify(tempProfile) !== JSON.stringify(profile)) {
            setShowConfirm(true);
        } else {
            setIsEditing(false);
        }
    };

    // Xử lý khi xác nhận hủy
    const confirmCancel = () => {
        setIsEditing(false);
        setShowConfirm(false);
    };

    // Lưu thông tin sau khi chỉnh sửa
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Mô phỏng gọi API để lưu thông tin
        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setProfile({ ...tempProfile });
            setIsEditing(false);
            setNotification({
                show: true,
                message: 'Cập nhật thông tin thành công!',
                type: 'success'
            });

            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
        } catch (error) {
            setNotification({
                show: true,
                message: 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!',
                type: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            {/* Thông báo */}
            {notification.show && (
                <Alert variant={notification.type} dismissible onClose={() => setNotification({ show: false })}>
                    {notification.message}
                </Alert>
            )}

            <Row>
                {/* Phần thông tin cá nhân */}
                <Col lg={8}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Thông tin cá nhân</h5>
                            {!isEditing && (
                                <Button variant="light" size="sm" onClick={handleEdit}>
                                    <i className="bi bi-pencil me-1"></i> Chỉnh sửa
                                </Button>
                            )}
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Họ và tên</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fullName"
                                                value={isEditing ? tempProfile.fullName : profile.fullName}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={isEditing ? tempProfile.email : profile.email}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Số điện thoại</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="phone"
                                                value={isEditing ? tempProfile.phone : profile.phone}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ngày sinh</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="dob"
                                                value={isEditing ? tempProfile.dob : profile.dob}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Giới tính</Form.Label>
                                            <Form.Select
                                                name="gender"
                                                value={isEditing ? tempProfile.gender : profile.gender}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            >
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Liên hệ khẩn cấp</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="emergencyContact"
                                                value={isEditing ? tempProfile.emergencyContact : profile.emergencyContact}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="address"
                                        value={isEditing ? tempProfile.address : profile.address}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </Form.Group>

                                <hr className="my-4" />

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Loại thành viên</Form.Label>
                                            <Form.Select
                                                name="membershipType"
                                                value={isEditing ? tempProfile.membershipType : profile.membershipType}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            >
                                                <option value="basic">Cơ bản</option>
                                                <option value="standard">Tiêu chuẩn</option>
                                                <option value="premium">Premium</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ngày bắt đầu</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="startDate"
                                                value={isEditing ? tempProfile.startDate : profile.startDate}
                                                onChange={handleChange}
                                                disabled={true} // Không cho phép chỉnh sửa ngày bắt đầu
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ngày hết hạn</Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="expiryDate"
                                                value={isEditing ? tempProfile.expiryDate : profile.expiryDate}
                                                onChange={handleChange}
                                                disabled={true} // Không cho phép chỉnh sửa ngày hết hạn
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Mục tiêu tập luyện</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="fitnessGoals"
                                        value={isEditing ? tempProfile.fitnessGoals : profile.fitnessGoals}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Tình trạng sức khỏe cần lưu ý</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        name="healthConditions"
                                        value={isEditing ? tempProfile.healthConditions : profile.healthConditions}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </Form.Group>

                                {isEditing && (
                                    <div className="d-flex gap-2 mt-4">
                                        <Button type="submit" variant="primary" disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                'Lưu thay đổi'
                                            )}
                                        </Button>
                                        <Button type="button" variant="outline-secondary" onClick={handleCancel} disabled={loading}>
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Phần ảnh đại diện và thông tin ngắn gọn */}
                <Col lg={4}>
                    <Card className="shadow-sm mb-4 text-center">
                        <Card.Body>
                            <div className="mb-3">
                                <img
                                    src={profile.profileImage}
                                    alt="Profile"
                                    className="rounded-circle mb-3"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                                {isEditing && (
                                    <div>
                                        <Button variant="outline-primary" size="sm" className="mt-2">
                                            <i className="bi bi-upload me-1"></i> Thay đổi ảnh
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <h4>{profile.fullName}</h4>
                            <p className="text-muted mb-2">{profile.email}</p>
                            <div className="mb-3">
                                <span className="badge bg-success text-white px-3 py-2">
                                    {profile.membershipType === 'basic' && 'Hội viên cơ bản'}
                                    {profile.membershipType === 'standard' && 'Hội viên tiêu chuẩn'}
                                    {profile.membershipType === 'premium' && 'Hội viên Premium'}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between mt-4">
                                <div>
                                    <small className="text-muted d-block">Ngày bắt đầu</small>
                                    <strong>{new Date(profile.startDate).toLocaleDateString('vi-VN')}</strong>
                                </div>
                                <div>
                                    <small className="text-muted d-block">Ngày hết hạn</small>
                                    <strong>{new Date(profile.expiryDate).toLocaleDateString('vi-VN')}</strong>
                                </div>
                            </div>
                        </Card.Body>
                        <Card.Footer className="bg-white">
                            <Button variant="outline-primary" className="w-100" href="/user/package">
                                <i className="bi bi-arrow-repeat me-1"></i> Gia hạn thành viên
                            </Button>
                        </Card.Footer>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">Thông tin bổ sung</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <small className="text-muted d-block">Số lần check-in gần đây</small>
                                <div className="progress mt-1">
                                    <div className="progress-bar bg-success" role="progressbar" style={{ width: '75%' }} aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">15/20</div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <div>
                                    <small className="text-muted d-block">Lớp tham gia</small>
                                    <strong>3</strong>
                                </div>
                                <div>
                                    <small className="text-muted d-block">PT session</small>
                                    <strong>5</strong>
                                </div>
                                <div>
                                    <small className="text-muted d-block">Điểm thưởng</small>
                                    <strong>250</strong>
                                </div>
                            </div>

                            <Button variant="outline-primary" size="sm" className="w-100" href="/user/schedule">
                                <i className="bi bi-calendar-check me-1"></i> Xem lịch tập
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal xác nhận khi hủy chỉnh sửa */}
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận hủy</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn hủy thay đổi? Tất cả thông tin bạn đã nhập sẽ không được lưu lại.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Quay lại
                    </Button>
                    <Button variant="danger" onClick={confirmCancel}>
                        Hủy thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Profile;