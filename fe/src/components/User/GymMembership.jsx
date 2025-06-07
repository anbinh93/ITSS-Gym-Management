import React, { useState, useEffect } from 'react';
import { getActiveMembership, getMembershipHistory, registerMembership } from '../../services/membershipApi';
import { getAllPackages } from '../../services/api';
import { getUserWorkoutProgress } from '../../services/workoutSessionApi';
import authService from '../../services/authService';

const GymMembership = () => {
    // State management
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [availablePackages, setAvailablePackages] = useState([]);
    const [memberPackages, setMemberPackages] = useState([]); // active & pending
    const [membershipHistory, setMembershipHistory] = useState([]);
    const [workoutProgress, setWorkoutProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = authService.getCurrentUser();
    const [registering, setRegistering] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

    useEffect(() => {
        if (!user || !user._id) {
            setError('Không tìm thấy thông tin hội viên. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
        }
        console.log('User ID for membership fetch:', user._id);
        setLoading(true);
        Promise.all([
            getAllPackages(),
            getActiveMembership(user._id),
            getMembershipHistory(user._id),
            getUserWorkoutProgress(user._id)
        ]).then(([pkgRes, activeRes, historyRes, progressRes]) => {
            setAvailablePackages(pkgRes.packages || []);
            
            // Xử lý active memberships với dữ liệu thực
            let activeList = [];
            if (activeRes.success && Array.isArray(activeRes.memberships)) {
                activeList = activeRes.memberships.map(m => ({
                    id: m._id,
                    package: m.package,
                    coach: m.coach,
                    startDate: m.startDate ? new Date(m.startDate).toLocaleDateString('vi-VN') : '',
                    endDate: m.endDate ? new Date(m.endDate).toLocaleDateString('vi-VN') : '',
                    sessionsRemaining: m.sessionsRemaining,
                    status: m.paymentStatus === 'paid' ? 'active' : 'pending',
                    paymentStatus: m.paymentStatus,
                    isActive: m.isActive
                }));
            }
            setMemberPackages(activeList);
            
            // Lịch sử với dữ liệu thực
            let historyList = [];
            if (historyRes.success && Array.isArray(historyRes.memberships)) {
                historyList = historyRes.memberships.map(m => ({
                    id: m._id,
                    package: m.package,
                    coach: m.coach,
                    startDate: m.startDate ? new Date(m.startDate).toLocaleDateString('vi-VN') : '',
                    endDate: m.endDate ? new Date(m.endDate).toLocaleDateString('vi-VN') : '',
                    purchaseDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '',
                    sessionsRemaining: m.sessionsRemaining,
                    status: m.paymentStatus === 'paid' ? 
                        (new Date(m.endDate) < new Date() ? 'expired' : 'active') : 'pending',
                    paymentStatus: m.paymentStatus
                }));
            }
            setMembershipHistory(historyList);
            
            // Xử lý workout progress
            if (progressRes && progressRes.success) {
                setWorkoutProgress(progressRes);
            }
        }).catch(err => {
            setError('Không thể kết nối tới server hoặc tải dữ liệu gói tập.');
        }).finally(() => setLoading(false));
    }, [user]);

    // Modal handling functions
    const handleRegister = (pkg) => {
        setSelectedPackage(pkg);
        setShowPaymentModal(true);
    };

    const handleRenew = (pkg) => {
        const packageToRenew = availablePackages.find(p => p._id === pkg.id || p._id === pkg._id);
        setSelectedPackage(packageToRenew);
        setShowPaymentModal(true);
    };

    const handleClose = () => {
        setShowPaymentModal(false);
        setShowHistoryModal(false);
        setSelectedPackage(null);
    };

    const showHistory = () => {
        setShowHistoryModal(true);
    };

    // Status badge renderer
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="badge bg-success">Đang hoạt động</span>;
            case 'pending':
                return <span className="badge bg-warning text-dark">Chờ kích hoạt</span>;
            case 'expired':
                return <span className="badge bg-secondary">Đã hết hạn</span>;
            default:
                return null;
        }
    };

    // Hiển thị các trường gói tập giống admin
    const renderPackageDetails = (pkg) => (
        <ul className="list-unstyled small">
            <li><strong>Thời hạn:</strong> {pkg.durationInDays} ngày</li>
            <li><strong>Số buổi tập:</strong> {pkg.sessionLimit}</li>
            <li><strong>HLV riêng:</strong> {pkg.withTrainer ? 'Có' : 'Không'}</li>
        </ul>
    );

    // Lấy package chi tiết từ membership hoặc availablePackages
    const getPackageDetails = (membership) => {
        // Nếu membership đã populate package, ưu tiên dùng
        if (membership.package && typeof membership.package === 'object') {
            return membership.package;
        }
        // Nếu không, tìm theo packageId trong availablePackages
        const packageId = membership.package?._id || membership.packageId || membership.package;
        return availablePackages.find(pkg => pkg._id === packageId) || {};
    };

    // Xác nhận đăng ký gói tập
    const handleConfirmRegister = async () => {
        if (!user || !selectedPackage) return;
        setRegistering(true);
        setRegisterError('');
        setRegisterSuccess('');
        try {
            const res = await registerMembership({
                userId: user._id,
                packageId: selectedPackage._id,
                paymentStatus: 'paid', // hoặc 'unpaid' nếu muốn cho phép admin xác nhận sau
            });
            if (res.success) {
                setRegisterSuccess('Đăng ký gói tập thành công!');
                setShowPaymentModal(false);
                // Refetch lại membership
                const [activeRes, historyRes] = await Promise.all([
                    getActiveMembership(user._id),
                    getMembershipHistory(user._id)
                ]);
                let activeList = [];
                if (activeRes.success && Array.isArray(activeRes.memberships)) {
                    activeList = activeRes.memberships.map(m => ({
                        id: m._id,
                        package: m.package,
                        coach: m.coach,
                        startDate: m.startDate ? new Date(m.startDate).toLocaleDateString('vi-VN') : '',
                        endDate: m.endDate ? new Date(m.endDate).toLocaleDateString('vi-VN') : '',
                        sessionsRemaining: m.sessionsRemaining,
                        status: m.paymentStatus === 'paid' ? 'active' : 'pending',
                        paymentStatus: m.paymentStatus,
                        isActive: m.isActive
                    }));
                }
                setMemberPackages(activeList);
                let historyList = [];
                if (historyRes.success && Array.isArray(historyRes.memberships)) {
                    historyList = historyRes.memberships.map(m => ({
                        id: m._id,
                        package: m.package,
                        coach: m.coach,
                        startDate: m.startDate ? new Date(m.startDate).toLocaleDateString('vi-VN') : '',
                        endDate: m.endDate ? new Date(m.endDate).toLocaleDateString('vi-VN') : '',
                        purchaseDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '',
                        sessionsRemaining: m.sessionsRemaining,
                        status: m.paymentStatus === 'paid' ? 
                            (new Date(m.endDate) < new Date() ? 'expired' : 'active') : 'pending',
                        paymentStatus: m.paymentStatus
                    }));
                }
                setMembershipHistory(historyList);
            } else {
                setRegisterError(res.message || 'Đăng ký gói tập thất bại');
            }
        } catch (err) {
            setRegisterError('Đăng ký gói tập thất bại');
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="container my-5">
            {error && <div className="alert alert-danger">{error}</div>}
            {/* Active membership section */}
            <div className="row mb-4">
                <div className="col-12 d-flex justify-content-between align-items-center mb-3">
                    <h3>Gói Tập Của Bạn</h3>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={showHistory}
                    >
                        <i className="bi bi-clock-history me-1"></i>
                        Xem lịch sử đăng ký
                    </button>
                </div>

                <div className="col-12">
                    <div className="row">
                        {memberPackages.map((pkg) => {
                            // Lấy chi tiết package
                            const pkgDetail = getPackageDetails(pkg);
                            return (
                                <div className="col-md-6 col-lg-4 mb-4" key={pkg.id}>
                                    <div className="card h-100 shadow-sm border-0">
                                        <div className="card-header bg-primary text-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">Gói {pkgDetail.name || 'Không xác định'}</h5>
                                                {renderStatusBadge(pkg.status)}
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <ul className="list-unstyled small mb-2">
                                                <li><strong>Thời hạn:</strong> {pkgDetail.durationInDays ? pkgDetail.durationInDays + ' ngày' : ''}</li>
                                                <li><strong>Số buổi tập:</strong> {pkgDetail.sessionLimit ?? ''}</li>
                                                <li><strong>Số buổi còn lại:</strong> {pkg.sessionsRemaining ?? 'Không giới hạn'}</li>
                                                <li><strong>HLV phụ trách:</strong> {pkg.coach ? pkg.coach.name : 'Chưa có'}</li>
                                                <li><strong>HLV riêng:</strong> {pkgDetail.withTrainer ? 'Có' : 'Không'}</li>
                                                <li><strong>Giá:</strong> {pkgDetail.price ? pkgDetail.price.toLocaleString() + ' VNĐ' : ''}</li>
                                            </ul>
                                            <div className="mt-3">
                                                <p className="mb-1"><strong>Ngày bắt đầu:</strong> {pkg.startDate}</p>
                                                <p className="mb-1"><strong>Ngày hết hạn:</strong> {pkg.endDate}</p>
                                            </div>
                                            
                                            {/* Tiến độ tập luyện mới */}
                                            {workoutProgress && workoutProgress.progress && (
                                                <div className="mt-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <small><strong>Tiến độ tập luyện:</strong></small>
                                                        <small className="text-primary font-weight-bold">
                                                            {workoutProgress.progress.sessionsCompleted}/{workoutProgress.progress.totalSessions} buổi
                                                        </small>
                                                    </div>
                                                    <div className="progress" style={{height: '8px'}}>
                                                        <div 
                                                            className="progress-bar bg-primary" 
                                                            role="progressbar" 
                                                            style={{width: `${workoutProgress.progress.completionPercentage}%`}}
                                                            aria-valuenow={workoutProgress.progress.completionPercentage} 
                                                            aria-valuemin="0" 
                                                            aria-valuemax="100"
                                                        ></div>
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-1">
                                                        <small className="text-muted">
                                                            Còn lại: {workoutProgress.progress.sessionsRemaining} buổi
                                                        </small>
                                                        <small className="text-muted">
                                                            {workoutProgress.progress.completionPercentage.toFixed(1)}%
                                                        </small>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-footer bg-white border-0">
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={() => handleRenew(pkg)}
                                            >
                                                Gia Hạn
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {memberPackages.length === 0 && (
                            <div className="col-12">
                                <div className="alert alert-info">
                                    Bạn chưa có gói tập nào. Hãy đăng ký gói tập bên dưới.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Available packages section */}
            <div className="row mb-5">
                <div className="col-12 mb-3">
                    <h3 className="border-bottom pb-2">Các Gói Tập</h3>
                </div>

                <div className="col-12">
                    <div className="row">
                        {availablePackages.map((pkg) => (
                            <div className="col-md-6 col-lg-3 mb-4" key={pkg._id}>
                                <div className="card h-100 shadow-sm border-0 package-card">
                                    <div className="card-header text-center bg-light">
                                        <h5 className="mb-0">Gói {pkg.name}</h5>
                                    </div>
                                    <div className="card-body">
                                        {renderPackageDetails(pkg)}
                                        <div className="text-center mt-3">
                                            <h5 className="text-primary">{pkg.price?.toLocaleString()} VNĐ</h5>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-white border-0">
                                        <button
                                            className="btn btn-success w-100"
                                            onClick={() => handleRegister(pkg)}
                                        >
                                            Đăng Ký
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <div className={`modal fade ${showPaymentModal ? 'show' : ''}`}
                tabIndex="-1"
                role="dialog"
                style={{
                    display: showPaymentModal ? 'block' : 'none',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}
            >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Thanh Toán Gói Tập</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body">
                            {selectedPackage && (
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card mb-4">
                                            <div className="card-header bg-light">
                                                <h5 className="mb-0">Thông tin gói tập</h5>
                                            </div>
                                            <div className="card-body">
                                                <h6>Gói {selectedPackage.name}</h6>
                                                {renderPackageDetails(selectedPackage)}
                                                <p className="mt-3"><strong>Giá:</strong> {selectedPackage.price?.toLocaleString()} VNĐ</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <h5>Thông tin cá nhân</h5>
                                        <form>
                                            <div className="mb-3">
                                                <label className="form-label">Họ và Tên</label>
                                                <input type="text" className="form-control" value={user?.name || ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Số Điện Thoại</label>
                                                <input type="text" className="form-control" value={user?.phone || ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" value={user?.email || ''} readOnly />
                                            </div>

                                            <h5 className="mt-4">Phương thức thanh toán</h5>
                                            <div className="form-check mb-2">
                                                <input className="form-check-input" type="radio" name="paymentMethod" id="cardPayment" checked readOnly />
                                                <label className="form-check-label" htmlFor="cardPayment">
                                                    Thanh toán bằng thẻ
                                                </label>
                                            </div>
                                            <div className="form-check mb-2">
                                                <input className="form-check-input" type="radio" name="paymentMethod" id="bankTransfer" readOnly />
                                                <label className="form-check-label" htmlFor="bankTransfer">
                                                    Chuyển khoản ngân hàng
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="paymentMethod" id="cashPayment" readOnly />
                                                <label className="form-check-label" htmlFor="cashPayment">
                                                    Tiền mặt tại quầy
                                                </label>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>Đóng</button>
                            <button type="button" className="btn btn-primary" onClick={handleConfirmRegister} disabled={registering}>
                                {registering ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
                            </button>
                            {registerError && <div className="text-danger mt-2">{registerError}</div>}
                            {registerSuccess && <div className="text-success mt-2">{registerSuccess}</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* History Modal */}
            <div className={`modal fade ${showHistoryModal ? 'show' : ''}`}
                tabIndex="-1"
                role="dialog"
                style={{
                    display: showHistoryModal ? 'block' : 'none',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                }}
            >
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Lịch Sử Đăng Ký</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body">
                            {membershipHistory.map((history) => {
                                const pkgDetail = getPackageDetails(history);
                                return (
                                    <div key={history.id} className="card mb-3">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6>Gói {pkgDetail.name || 'Không xác định'}</h6>
                                                    <p className="mb-1"><strong>Ngày bắt đầu:</strong> {history.startDate}</p>
                                                    <p className="mb-1"><strong>Ngày hết hạn:</strong> {history.endDate}</p>
                                                    <p className="mb-1"><strong>Ngày mua:</strong> {history.purchaseDate}</p>
                                                    <p className="mb-1"><strong>HLV phụ trách:</strong> {history.coach ? history.coach.name : 'Chưa có'}</p>
                                                    <p className="mb-1"><strong>Số buổi tập:</strong> {history.sessionsRemaining ?? 'Không giới hạn'}</p>
                                                    <p className="mb-0"><strong>Giá:</strong> {pkgDetail.price ? pkgDetail.price.toLocaleString() + ' VNĐ' : ''}</p>
                                                </div>
                                                <div>
                                                    {renderStatusBadge(history.status)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {membershipHistory.length === 0 && (
                                <div className="alert alert-info">
                                    Bạn chưa có lịch sử đăng ký gói tập nào.
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .container {
                    max-width: 1200px;
                }

                .package-card {
                    transition: transform 0.2s;
                }

                .package-card:hover {
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

export default GymMembership;