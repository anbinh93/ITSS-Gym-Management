import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import authService from '../../services/authService';
import { getUserById, updateUser, getUserProgress, getWorkoutByUser } from '../../services/api';
import { getActiveMembership } from '../../services/membershipApi';

const Profile = () => {
    // State cho thông tin người dùng
    const [profile, setProfile] = useState(null);
    
    // State cho membership information
    const [membershipInfo, setMembershipInfo] = useState(null);
    
    // State cho workout progress
    const [workoutStats, setWorkoutStats] = useState(null);
    
    // State cho workout data
    const [workoutData, setWorkoutData] = useState([]);

    // State cho chế độ chỉnh sửa
    const [isEditing, setIsEditing] = useState(false);

    // State cho form tạm thời khi chỉnh sửa
    const [tempProfile, setTempProfile] = useState(profile ? { ...profile } : {});

    // State cho thông báo
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // State cho loading
    const [loading, setLoading] = useState(false);
    const [membershipLoading, setMembershipLoading] = useState(false);

    // State cho modal xác nhận
    const [showConfirm, setShowConfirm] = useState(false);

    // Lấy userId từ localStorage hoặc authService
    const user = authService.getCurrentUser();

    useEffect(() => {
        if (!user || !user._id) return;
        setLoading(true);
        
        // Fetch user profile data
        getUserById(user._id)
            .then(res => {
                if (res && res.user) {
                    setProfile({
                        fullName: res.user.name || '',
                        email: res.user.email || '',
                        phone: res.user.phone || '',
                        dob: res.user.dob ? res.user.dob.slice(0, 10) : '',
                        gender: res.user.gender || 'male',
                        address: res.user.address || '',
                        emergencyContact: res.user.emergencyContact || '',
                        membershipType: res.user.membershipType || 'basic',
                        startDate: res.user.startDate ? res.user.startDate.slice(0, 10) : '',
                        expiryDate: res.user.expiryDate ? res.user.expiryDate.slice(0, 10) : '',
                        fitnessGoals: res.user.fitnessGoals || '',
                        healthConditions: res.user.healthConditions || '',
                        profileImage: res.user.profileImage || 'https://via.placeholder.com/150',
                    });
                }
            })
            .catch(() => setNotification({ show: true, message: 'Không thể tải thông tin người dùng', type: 'danger' }))
            .finally(() => setLoading(false));
            
        // Fetch membership information
        setMembershipLoading(true);
        getActiveMembership(user._id)
            .then(res => {
                if (res && res.success && res.memberships && res.memberships.length > 0) {
                    setMembershipInfo(res.memberships[0]);
                }
            })
            .catch(() => console.log('No active membership found'))
            .finally(() => setMembershipLoading(false));
            
        // Fetch workout progress/stats
        getUserProgress(user._id)
            .then(res => {
                if (res && res.success) {
                    setWorkoutStats(res.data);
                }
            })
            .catch(() => console.log('No workout progress found'));
            
        // Fetch workout history
        getWorkoutByUser(user._id)
            .then(res => {
                if (res && res.success && res.workouts) {
                    setWorkoutData(res.workouts);
                }
            })
            .catch(() => console.log('No workout history found'));
    }, [user]);

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
        try {
            const updateData = { ...tempProfile, name: tempProfile.fullName };
            delete updateData.fullName;
            const res = await updateUser(user._id, updateData);
            if (res && res.user) {
                setProfile({
                    fullName: res.user.name || '',
                    email: res.user.email || '',
                    phone: res.user.phone || '',
                    dob: res.user.dob ? res.user.dob.slice(0, 10) : '',
                    gender: res.user.gender || 'male',
                    address: res.user.address || '',
                    emergencyContact: res.user.emergencyContact || '',
                    membershipType: res.user.membershipType || 'basic',
                    startDate: res.user.startDate ? res.user.startDate.slice(0, 10) : '',
                    expiryDate: res.user.expiryDate ? res.user.expiryDate.slice(0, 10) : '',
                    fitnessGoals: res.user.fitnessGoals || '',
                    healthConditions: res.user.healthConditions || '',
                    profileImage: res.user.profileImage || 'https://via.placeholder.com/150',
                });
                // Cập nhật localStorage
                const localUser = JSON.parse(localStorage.getItem('gym_user') || '{}');
                localUser.name = res.user.name;
                localUser.email = res.user.email;
                localUser.phone = res.user.phone;
                localStorage.setItem('gym_user', JSON.stringify(localUser));
                setIsEditing(false);
                setNotification({
                    show: true,
                    message: 'Cập nhật thông tin thành công!',
                    type: 'success'
                });
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            } else {
                setNotification({
                    show: true,
                    message: 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!',
                    type: 'danger'
                });
            }
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

    if (!profile) return <div className="text-center py-5"><Spinner animation="border" /></div>;

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
                    <Card className="shadow-lg mb-4 border-0">
                        <Card.Header 
                            className="text-white d-flex justify-content-between align-items-center border-0"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '12px 12px 0 0'
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle me-2 fs-5"></i>
                                <h5 className="mb-0 fw-semibold">Thông tin cá nhân</h5>
                            </div>
                            {!isEditing && (
                                <Button 
                                    variant="light" 
                                    size="sm" 
                                    onClick={handleEdit}
                                    className="fw-semibold"
                                    style={{
                                        borderRadius: '8px',
                                        padding: '6px 12px'
                                    }}
                                >
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
                    <Card className="shadow-lg mb-4 text-center border-0" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
                        <Card.Body className="p-4">
                            <div className="mb-4">
                                <div className="position-relative d-inline-block">
                                    <img
                                        src={profile.profileImage}
                                        alt="Profile"
                                        className="rounded-circle mb-3 border border-4 border-white shadow-sm"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                    {isEditing && (
                                        <div className="position-absolute bottom-0 end-0">
                                            <Button variant="primary" size="sm" className="rounded-circle p-2">
                                                <i className="bi bi-camera"></i>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <div>
                                        <Button variant="outline-primary" size="sm" className="mt-2 fw-semibold">
                                            <i className="bi bi-upload me-1"></i> Thay đổi ảnh
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <h4 className="fw-bold text-dark mb-2">{profile.fullName}</h4>
                            <p className="text-muted mb-3 fw-medium">{profile.email}</p>
                            
                            {/* Membership Status */}
                            {membershipLoading ? (
                                <div className="mb-4">
                                    <div className="d-flex align-items-center justify-content-center">
                                        <Spinner animation="border" size="sm" className="me-2" /> 
                                        <small className="text-muted">Đang tải thông tin thành viên...</small>
                                    </div>
                                </div>
                            ) : membershipInfo ? (
                                <div className="mb-4">
                                    <div className="bg-white rounded-4 p-3 mb-3 shadow-sm">
                                        <Badge 
                                            className="px-3 py-2 mb-3 fs-6 fw-semibold"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none'
                                            }}
                                        >
                                            <i className="bi bi-star-fill me-1"></i>
                                            {membershipInfo.package?.name || 'Gói tập hiện tại'}
                                        </Badge>
                                        <div className="small">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-muted">Trạng thái:</span>
                                                <span className={`fw-bold ${membershipInfo.status === 'ACTIVE' ? 'text-success' : 'text-warning'}`}>
                                                    <i className={`bi ${membershipInfo.status === 'ACTIVE' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-1`}></i>
                                                    {membershipInfo.status === 'ACTIVE' ? 'Đang hoạt động' : membershipInfo.status}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-muted">Thanh toán:</span>
                                                <span className={`fw-bold ${membershipInfo.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                                                    <i className={`bi ${membershipInfo.paymentStatus === 'paid' ? 'bi-check-circle-fill' : 'bi-clock-fill'} me-1`}></i>
                                                    {membershipInfo.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <div className="bg-white rounded-4 p-3 shadow-sm">
                                        <Badge bg="warning" className="px-3 py-2 fs-6 fw-semibold">
                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                            Chưa có gói tập
                                        </Badge>
                                    </div>
                                </div>
                            )}
                            
                            {/* Membership Dates */}
                            <div className="bg-white rounded-4 p-3 mb-4 shadow-sm">
                                <Row>
                                    <Col xs={6} className="text-start">
                                        <small className="text-muted d-block fw-semibold">Ngày bắt đầu</small>
                                        <div className="fw-bold text-dark">
                                            {membershipInfo && membershipInfo.startDate 
                                                ? new Date(membershipInfo.startDate).toLocaleDateString('vi-VN')
                                                : profile.startDate 
                                                    ? new Date(profile.startDate).toLocaleDateString('vi-VN')
                                                    : '---'
                                            }
                                        </div>
                                    </Col>
                                    <Col xs={6} className="text-end">
                                        <small className="text-muted d-block fw-semibold">Ngày hết hạn</small>
                                        <div className="fw-bold text-dark">
                                            {membershipInfo && membershipInfo.endDate 
                                                ? new Date(membershipInfo.endDate).toLocaleDateString('vi-VN')
                                                : profile.expiryDate 
                                                    ? new Date(profile.expiryDate).toLocaleDateString('vi-VN')
                                                    : '---'
                                            }
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-0 pb-4">
                            <Button 
                                variant="primary" 
                                className="w-100 fw-semibold py-2"
                                href="/user/package"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '12px'
                                }}
                            >
                                <i className="bi bi-arrow-repeat me-2"></i> 
                                Gia hạn thành viên
                            </Button>
                        </Card.Footer>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Header className="bg-gradient text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                            <div className="d-flex align-items-center">
                                <i className="bi bi-activity me-2"></i>
                                <h5 className="mb-0">Thống kê tập luyện</h5>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {/* Total workouts with visual progress */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted fw-semibold">Tổng số buổi tập</small>
                                    <span className="badge bg-primary fs-6">{workoutData.length}</span>
                                </div>
                                <div className="progress" style={{height: '8px'}}>
                                    <div 
                                        className="progress-bar bg-gradient" 
                                        role="progressbar" 
                                        style={{ 
                                            width: workoutData.length > 0 ? '100%' : '0%',
                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                                        }} 
                                        aria-valuenow="100" 
                                        aria-valuemin="0" 
                                        aria-valuemax="100"
                                    ></div>
                                </div>
                            </div>

                            {/* Workout frequency stats */}
                            <Row className="mb-4">
                                <Col xs={4} className="text-center">
                                    <div className="border rounded-3 p-3 h-100" style={{backgroundColor: '#f8f9ff'}}>
                                        <div className="fs-4 fw-bold text-primary mb-1">
                                            {workoutData.filter(w => {
                                                const workoutDate = new Date(w.date);
                                                const weekAgo = new Date();
                                                weekAgo.setDate(weekAgo.getDate() - 7);
                                                return workoutDate >= weekAgo;
                                            }).length}
                                        </div>
                                        <small className="text-muted fw-semibold">Tuần này</small>
                                    </div>
                                </Col>
                                <Col xs={4} className="text-center">
                                    <div className="border rounded-3 p-3 h-100" style={{backgroundColor: '#fff8f0'}}>
                                        <div className="fs-4 fw-bold text-warning mb-1">
                                            {workoutData.filter(w => {
                                                const workoutDate = new Date(w.date);
                                                const monthAgo = new Date();
                                                monthAgo.setMonth(monthAgo.getMonth() - 1);
                                                return workoutDate >= monthAgo;
                                            }).length}
                                        </div>
                                        <small className="text-muted fw-semibold">Tháng này</small>
                                    </div>
                                </Col>
                                <Col xs={4} className="text-center">
                                    <div className="border rounded-3 p-3 h-100" style={{backgroundColor: '#f0fff4'}}>
                                        <div className="fs-4 fw-bold text-success mb-1">
                                            {Math.round(workoutData.reduce((total, w) => total + (w.durationMinutes || 0), 0) / 60) || 0}
                                        </div>
                                        <small className="text-muted fw-semibold">Tổng giờ</small>
                                    </div>
                                </Col>
                            </Row>

                            {/* Average workout duration */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted fw-semibold">Thời gian tập trung bình</small>
                                    <span className="text-info fw-bold">
                                        {workoutData.length > 0 
                                            ? Math.round(workoutData.reduce((total, w) => total + (w.durationMinutes || 0), 0) / workoutData.length)
                                            : 0
                                        } phút
                                    </span>
                                </div>
                                <div className="progress" style={{height: '6px'}}>
                                    <div 
                                        className="progress-bar bg-info" 
                                        role="progressbar" 
                                        style={{ 
                                            width: workoutData.length > 0 
                                                ? `${Math.min((workoutData.reduce((total, w) => total + (w.durationMinutes || 0), 0) / workoutData.length) / 60 * 100, 100)}%`
                                                : '0%'
                                        }}
                                    ></div>
                                </div>
                            </div>

                            {/* Recent workout activity */}
                            {workoutData.length > 0 && (
                                <div className="mb-3">
                                    <small className="text-muted fw-semibold d-block mb-2">Hoạt động gần đây</small>
                                    <div className="bg-light rounded-3 p-3">
                                        {workoutData.slice(0, 3).map((workout, index) => (
                                            <div key={index} className={`d-flex justify-content-between align-items-center ${index < 2 ? 'mb-2 pb-2 border-bottom' : ''}`}>
                                                <div>
                                                    <div className="fw-semibold text-dark" style={{fontSize: '0.9rem'}}>
                                                        {new Date(workout.date).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <small className="text-muted">
                                                        {workout.notes || 'Buổi tập luyện'}
                                                    </small>
                                                </div>
                                                <span className="badge bg-secondary">
                                                    {workout.durationMinutes || 0} phút
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="d-grid gap-2">
                                <Button 
                                    variant="outline-primary" 
                                    href="/user/progress"
                                    className="fw-semibold"
                                    style={{borderWidth: '2px'}}
                                >
                                    <i className="bi bi-graph-up me-2"></i> 
                                    Xem chi tiết tiến độ
                                </Button>
                                <Button 
                                    variant="success" 
                                    href="/user/workout"
                                    className="fw-semibold"
                                    size="sm"
                                >
                                    <i className="bi bi-plus-circle me-2"></i> 
                                    Thêm buổi tập mới
                                </Button>
                            </div>
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