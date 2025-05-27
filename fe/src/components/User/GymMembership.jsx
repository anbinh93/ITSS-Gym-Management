import React, { useState } from 'react';

const GymMembership = () => {
    // State management
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    // const [activeTab, setActiveTab] = useState('current');

    // Data for member's current active packages
    const memberPackages = [
        {
            id: 1,
            name: '1 Tháng',
            benefits: 'Tập Gym không giới hạn, Hỗ trợ HLV',
            startDate: '01/05/2025',
            expiration: '30/05/2025',
            status: 'active'
        },
        {
            id: 2,
            name: '3 Tháng',
            benefits: 'Tập Gym không giới hạn, Hỗ trợ HLV, Ưu đãi 10% dịch vụ',
            startDate: '01/06/2025',
            expiration: '30/08/2025',
            status: 'pending'
        }
    ];

    // Data for available packages to purchase
    const availablePackages = [
        {
            id: 3,
            name: '1 Tháng',
            benefits: 'Tập Gym không giới hạn, Hỗ trợ HLV',
            price: '1,500,000 VND'
        },
        {
            id: 4,
            name: '3 Tháng',
            benefits: 'Tập Gym không giới hạn, Hỗ trợ HLV, Ưu đãi 10% dịch vụ',
            price: '4,000,000 VND'
        },
        {
            id: 5,
            name: '6 Tháng',
            benefits: 'Tập Gym không giới hạn, Hỗ trợ HLV, Ưu đãi 15% dịch vụ, 2 buổi PT miễn phí',
            price: '7,000,000 VND'
        },
        {
            id: 6,
            name: '12 Tháng',
            benefits: 'Tập Gym không giới hạn, Hỗ trợ HLV, Ưu đãi 20% dịch vụ, 5 buổi PT miễn phí',
            price: '12,000,000 VND'
        }
    ];

    // History of membership packages
    const membershipHistory = [
        {
            id: 7,
            name: '1 Tháng',
            startDate: '01/01/2025',
            expiration: '31/01/2025',
            purchaseDate: '28/12/2024',
            price: '1,500,000 VND',
            status: 'expired'
        },
        {
            id: 8,
            name: '3 Tháng',
            startDate: '01/02/2025',
            expiration: '30/04/2025',
            purchaseDate: '25/01/2025',
            price: '4,000,000 VND',
            status: 'expired'
        },
        {
            id: 1,
            name: '1 Tháng',
            startDate: '01/05/2025',
            expiration: '30/05/2025',
            purchaseDate: '28/04/2025',
            price: '1,500,000 VND',
            status: 'active'
        },
        {
            id: 2,
            name: '3 Tháng',
            startDate: '01/06/2025',
            expiration: '30/08/2025',
            purchaseDate: '15/05/2025',
            price: '4,000,000 VND',
            status: 'pending'
        }
    ];

    // Modal handling functions
    const handleRegister = (pkg) => {
        setSelectedPackage(pkg);
        setShowPaymentModal(true);
    };

    const handleRenew = (pkg) => {
        // Find the corresponding package in availablePackages
        const packageToRenew = availablePackages.find(p => p.name === pkg.name);
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

    // Get benefits as list items
    const getBenefitsList = (benefits) => {
        return benefits.split(', ').map((benefit, index) => (
            <li key={index} className="mb-1">{benefit}</li>
        ));
    };

    return (
        <div className="container my-5">
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
                        {memberPackages.map((pkg) => (
                            <div className="col-md-6 col-lg-4 mb-4" key={pkg.id}>
                                <div className="card h-100 shadow-sm border-0">
                                    <div className="card-header bg-primary text-white">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">Gói {pkg.name}</h5>
                                            {renderStatusBadge(pkg.status)}
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h6 className="card-subtitle mb-3 text-muted">Đặc quyền hội viên:</h6>
                                        <ul className="list-unstyled">
                                            {getBenefitsList(pkg.benefits)}
                                        </ul>
                                        <div className="mt-3">
                                            <p className="mb-1"><strong>Ngày bắt đầu:</strong> {pkg.startDate}</p>
                                            <p><strong>Ngày hết hạn:</strong> {pkg.expiration}</p>
                                        </div>
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
                        ))}

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
                            <div className="col-md-6 col-lg-3 mb-4" key={pkg.id}>
                                <div className="card h-100 shadow-sm border-0 package-card">
                                    <div className="card-header text-center bg-light">
                                        <h5 className="mb-0">Gói {pkg.name}</h5>
                                    </div>
                                    <div className="card-body">
                                        <h6 className="card-subtitle mb-3 text-muted">Đặc quyền:</h6>
                                        <ul className="list-unstyled small">
                                            {getBenefitsList(pkg.benefits)}
                                        </ul>
                                        <div className="text-center mt-3">
                                            <h5 className="text-primary">{pkg.price}</h5>
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
                                                <p className="text-muted small">Đặc quyền:</p>
                                                <ul className="small">
                                                    {getBenefitsList(selectedPackage.benefits)}
                                                </ul>
                                                <p className="mt-3"><strong>Giá:</strong> {selectedPackage.price}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <h5>Thông tin cá nhân</h5>
                                        <form>
                                            <div className="mb-3">
                                                <label className="form-label">Họ và Tên</label>
                                                <input type="text" className="form-control" placeholder="Nhập họ và tên" defaultValue="Nguyễn Văn A" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Số Điện Thoại</label>
                                                <input type="text" className="form-control" placeholder="Nhập số điện thoại" defaultValue="0912345678" />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" placeholder="Nhập email" defaultValue="example@mail.com" />
                                            </div>

                                            <h5 className="mt-4">Phương thức thanh toán</h5>
                                            <div className="form-check mb-2">
                                                <input className="form-check-input" type="radio" name="paymentMethod" id="cardPayment" checked />
                                                <label className="form-check-label" htmlFor="cardPayment">
                                                    Thanh toán bằng thẻ
                                                </label>
                                            </div>
                                            <div className="form-check mb-2">
                                                <input className="form-check-input" type="radio" name="paymentMethod" id="bankTransfer" />
                                                <label className="form-check-label" htmlFor="bankTransfer">
                                                    Chuyển khoản ngân hàng
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="paymentMethod" id="cashPayment" />
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
                            <button type="button" className="btn btn-primary">Xác Nhận Thanh Toán</button>
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
                            <h5 className="modal-title">Lịch Sử Đăng Ký Gói Tập</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Tên Gói</th>
                                            <th>Ngày Mua</th>
                                            <th>Thời Gian Sử Dụng</th>
                                            <th>Giá</th>
                                            <th>Trạng Thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {membershipHistory.map((history, index) => (
                                            <tr key={index}>
                                                <td>Gói {history.name}</td>
                                                <td>{history.purchaseDate}</td>
                                                <td>{history.startDate} - {history.expiration}</td>
                                                <td>{history.price}</td>
                                                <td>{renderStatusBadge(history.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleClose}>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for this component */}
            <style jsx>{`
                .package-card:hover {
                    transform: translateY(-5px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                
                .modal {
                    transition: opacity 0.15s linear;
                }
                
                .modal.show {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default GymMembership;
