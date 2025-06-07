import React, { useState, useEffect } from 'react';
import './GymReview.css';
import { submitFeedback, getFeedbacksByTarget, getAllUsers } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const GymReview = () => {
    const { user } = useAuth();
    // State for managing which review form is active
    const [activeReviewType, setActiveReviewType] = useState(null);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [recentReviews, setRecentReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch real data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch all users to get trainers and staff
                const usersRes = await getAllUsers();
                if (usersRes.success) {
                    const allUsers = usersRes.users || usersRes.data || [];
                    
                    // Filter trainers (coaches)
                    const trainerList = allUsers.filter(u => u.role === 'coach').map(trainer => ({
                        id: trainer._id,
                        name: trainer.name,
                        specialization: 'Huấn luyện viên',
                        image: trainer.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
                    }));
                    setTrainers(trainerList);

                    // Filter staff
                    const staffList = allUsers.filter(u => u.role === 'staff').map(staffMember => ({
                        id: staffMember._id,
                        name: staffMember.name,
                        department: 'Nhân viên hỗ trợ',
                        image: staffMember.avatar || 'https://randomuser.me/api/portraits/women/1.jpg'
                    }));
                    setStaff(staffList);
                }

                // Fetch recent reviews for display
                await fetchRecentReviews();
                
            } catch (err) {
                setError('Lỗi tải dữ liệu: ' + (err.message || 'Unknown error'));
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch recent reviews from API
    const fetchRecentReviews = async () => {
        try {
            const gymReviews = await getFeedbacksByTarget('GYM');
            const staffReviews = await getFeedbacksByTarget('STAFF'); 
            const trainerReviews = await getFeedbacksByTarget('TRAINER');

            const allReviews = [
                ...(gymReviews.feedbacks || []).map(fb => ({
                    id: fb._id,
                    type: 'gym',
                    userName: fb.user?.name || 'Ẩn danh',
                    rating: fb.rating,
                    date: new Date(fb.createdAt).toLocaleDateString('vi-VN'),
                    comment: fb.message
                })),
                ...(staffReviews.feedbacks || []).map(fb => ({
                    id: fb._id,
                    type: 'staff',
                    staffName: fb.relatedUser?.name,
                    userName: fb.user?.name || 'Ẩn danh',
                    rating: fb.rating,
                    date: new Date(fb.createdAt).toLocaleDateString('vi-VN'),
                    comment: fb.message
                })),
                ...(trainerReviews.feedbacks || []).map(fb => ({
                    id: fb._id,
                    type: 'trainer',
                    trainerName: fb.relatedUser?.name,
                    userName: fb.user?.name || 'Ẩn danh',
                    rating: fb.rating,
                    date: new Date(fb.createdAt).toLocaleDateString('vi-VN'),
                    comment: fb.message
                }))
            ];

            // Sort by creation date (newest first)
            allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            setRecentReviews(allReviews.slice(0, 6)); // Show only 6 most recent
        } catch (err) {
            console.error('Error fetching recent reviews:', err);
        }
    };

    // Handle selecting a review type
    const handleSelectReviewType = (type) => {
        setActiveReviewType(type);
        resetForm();
    };

    // Reset form fields
    const resetForm = () => {
        setRating(0);
        setHoverRating(0);
        setReviewText('');
        setSelectedTrainer(null);
        setSelectedStaff(null);
        setReviewSubmitted(false);
        setError('');
    };

    // Handle trainer selection
    const handleSelectTrainer = (trainer) => {
        setSelectedTrainer(trainer);
    };

    // Handle staff selection
    const handleSelectStaff = (staffMember) => {
        setSelectedStaff(staffMember);
    };

    // Handle star rating hover and click
    const handleSetRating = (value) => {
        setRating(value);
    };

    const handleMouseOver = (value) => {
        setHoverRating(value);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    // Submit review
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        // Enhanced authentication check with fallback
        let currentUser = user;
        
        // If AuthContext user is null, try getting from authService
        if (!currentUser) {
            currentUser = authService.getCurrentUser();
            console.log('AuthContext user is null, trying authService:', currentUser);
        }

        // Debug logging
        console.log('AuthContext user:', user);
        console.log('AuthService user:', authService.getCurrentUser());
        console.log('Token exists:', !!authService.getToken());
        console.log('Is authenticated:', authService.isAuthenticated());

        if (!currentUser) {
            setError('Bạn cần đăng nhập để gửi đánh giá');
            return;
        }

        if (rating === 0) {
            setError('Vui lòng chọn số sao đánh giá');
            return;
        }

        if (!reviewText.trim()) {
            setError('Vui lòng nhập nội dung đánh giá');
            return;
        }

        // Validate specific requirements for each type
        if (activeReviewType === 'trainer' && !selectedTrainer) {
            setError('Vui lòng chọn huấn luyện viên');
            return;
        }

        if (activeReviewType === 'staff' && !selectedStaff) {
            setError('Vui lòng chọn nhân viên');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const feedbackData = {
                userId: currentUser.id || currentUser._id,
                rating: rating,
                message: reviewText,
                target: activeReviewType.toUpperCase(),
                relatedUser: null
            };

            // Set relatedUser for trainer or staff feedback
            if (activeReviewType === 'trainer') {
                feedbackData.relatedUser = selectedTrainer.id;
            } else if (activeReviewType === 'staff') {
                feedbackData.relatedUser = selectedStaff.id;
            }

            const result = await submitFeedback(feedbackData);

            if (result.success) {
                setReviewSubmitted(true);
                
                // Refresh recent reviews to show the new one
                await fetchRecentReviews();

                // Reset form after 3 seconds
                setTimeout(() => {
                    resetForm();
                    setActiveReviewType(null);
                }, 3000);
            } else {
                setError('Gửi đánh giá thất bại: ' + (result.message || 'Lỗi không xác định'));
            }

        } catch (err) {
            setError('Lỗi kết nối: ' + (err.message || 'Không thể gửi đánh giá'));
            console.error('Error submitting review:', err);
        } finally {
            setLoading(false);
        }
    };

    // Render stars for rating input
    const renderStarRating = () => {
        return (
            <div className="star-rating mb-3">
                {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                        <span
                            key={index}
                            className={`star ${ratingValue <= (hoverRating || rating) ? 'filled' : ''}`}
                            onClick={() => handleSetRating(ratingValue)}
                            onMouseOver={() => handleMouseOver(ratingValue)}
                            onMouseLeave={handleMouseLeave}
                        >
                            ★
                        </span>
                    );
                })}
                <span className="ms-2 text-muted">
                    {rating > 0 ? `${rating}/5` : 'Chưa đánh giá'}
                </span>
            </div>
        );
    };

    // Render staff selection list
    const renderStaffSelection = () => {
        return (
            <div className="staff-selection mb-4">
                <label className="form-label">Chọn Nhân Viên:</label>
                <div className="row row-cols-1 row-cols-md-3 g-3">
                    {staff.map(staffMember => (
                        <div className="col" key={staffMember.id}>
                            <div
                                className={`card h-100 staff-card ${selectedStaff?.id === staffMember.id ? 'selected' : ''}`}
                                onClick={() => handleSelectStaff(staffMember)}
                            >
                                <div className="row g-0">
                                    <div className="col-4">
                                        <img
                                            src={staffMember.image}
                                            className="rounded-start staff-img"
                                            alt={staffMember.name}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body py-2">
                                            <h6 className="card-title mb-1">{staffMember.name}</h6>
                                            <p className="card-text small text-muted">{staffMember.department}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {staff.length === 0 && (
                    <div className="text-muted text-center py-3">
                        Không có nhân viên nào để đánh giá
                    </div>
                )}
                {selectedStaff && (
                    <div className="mt-2 text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Đã chọn: {selectedStaff.name}
                    </div>
                )}
            </div>
        );
    };

    // Render trainer selection list
    const renderTrainerSelection = () => {
        return (
            <div className="trainer-selection mb-4">
                <label className="form-label">Chọn Huấn Luyện Viên:</label>
                <div className="row row-cols-1 row-cols-md-3 g-3">
                    {trainers.map(trainer => (
                        <div className="col" key={trainer.id}>
                            <div
                                className={`card h-100 trainer-card ${selectedTrainer?.id === trainer.id ? 'selected' : ''}`}
                                onClick={() => handleSelectTrainer(trainer)}
                            >
                                <div className="row g-0">
                                    <div className="col-4">
                                        <img
                                            src={trainer.image}
                                            className="rounded-start trainer-img"
                                            alt={trainer.name}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body py-2">
                                            <h6 className="card-title mb-1">{trainer.name}</h6>
                                            <p className="card-text small text-muted">{trainer.specialization}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {trainers.length === 0 && (
                    <div className="text-muted text-center py-3">
                        Không có huấn luyện viên nào để đánh giá
                    </div>
                )}
                {selectedTrainer && (
                    <div className="mt-2 text-success">
                        <i className="bi bi-check-circle-fill me-1"></i>
                        Đã chọn: {selectedTrainer.name}
                    </div>
                )}
            </div>
        );
    };

    // Render gym review form
    const renderGymReviewForm = () => {
        return (
            <div className="gym-review-form">
                <h4 className="mb-4">Đánh Giá Phòng Gym</h4>

                {reviewSubmitted ? (
                    <div className="alert alert-success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Cảm ơn bạn đã gửi đánh giá! Phản hồi của bạn rất quan trọng đối với chúng tôi.
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview}>
                        <div className="mb-3">
                            <label className="form-label">Chất lượng tổng thể:</label>
                            {renderStarRating()}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="reviewText" className="form-label">Nhận xét của bạn:</label>
                            <textarea
                                className="form-control"
                                id="reviewText"
                                rows="4"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Hãy chia sẻ trải nghiệm của bạn về cơ sở vật chất, trang thiết bị, dịch vụ, nhân viên,..."
                                required
                            ></textarea>
                        </div>

                        {error && (
                            <div className="alert alert-danger mb-3">
                                {error}
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button 
                                type="submit" 
                                className="btn btn-primary" 
                                disabled={rating === 0 || loading}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setActiveReviewType(null)}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    // Render trainer review form
    const renderTrainerReviewForm = () => {
        return (
            <div className="trainer-review-form">
                <h4 className="mb-4">Đánh Giá Huấn Luyện Viên</h4>

                {reviewSubmitted ? (
                    <div className="alert alert-success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Cảm ơn bạn đã gửi đánh giá! Phản hồi của bạn giúp các huấn luyện viên của chúng tôi không ngừng cải thiện.
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview}>
                        {renderTrainerSelection()}

                        <div className="mb-3">
                            <label className="form-label">Đánh giá huấn luyện viên:</label>
                            {renderStarRating()}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="reviewText" className="form-label">Nhận xét của bạn:</label>
                            <textarea
                                className="form-control"
                                id="reviewText"
                                rows="4"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Hãy chia sẻ trải nghiệm của bạn về chuyên môn, phương pháp giảng dạy, thái độ phục vụ của huấn luyện viên,..."
                                required
                            ></textarea>
                        </div>

                        {error && (
                            <div className="alert alert-danger mb-3">
                                {error}
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={rating === 0 || !selectedTrainer || loading}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setActiveReviewType(null)}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    // Render review stars display (for recent reviews)
    const renderStars = (rating) => {
        return (
            <div className="review-stars">
                {[...Array(5)].map((_, index) => (
                    <span key={index} className={`star-display ${index < rating ? 'filled' : ''}`}>★</span>
                ))}
            </div>
        );
    };

    // Render staff review form
    const renderStaffReviewForm = () => {
        return (
            <div className="staff-review-form">
                <h4 className="mb-4">Đánh Giá Nhân Viên</h4>

                {reviewSubmitted ? (
                    <div className="alert alert-success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Cảm ơn bạn đã gửi đánh giá! Phản hồi của bạn giúp chúng tôi cải thiện chất lượng dịch vụ.
                    </div>
                ) : (
                    <form onSubmit={handleSubmitReview}>
                        {renderStaffSelection()}

                        <div className="mb-3">
                            <label className="form-label">Đánh giá nhân viên:</label>
                            {renderStarRating()}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="reviewText" className="form-label">Nhận xét của bạn:</label>
                            <textarea
                                className="form-control"
                                id="reviewText"
                                rows="4"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Hãy chia sẻ trải nghiệm của bạn về thái độ phục vụ, hỗ trợ, và chuyên môn của nhân viên,..."
                                required
                            ></textarea>
                        </div>

                        {error && (
                            <div className="alert alert-danger mb-3">
                                {error}
                            </div>
                        )}

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={rating === 0 || !selectedStaff || loading}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setActiveReviewType(null)}
                                disabled={loading}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    };

    // Render recent reviews section
    const renderRecentReviews = () => {
        return (
            <div className="recent-reviews mt-5">
                <h4 className="mb-3">Đánh Giá Gần Đây</h4>

                {recentReviews.length === 0 ? (
                    <p className="text-muted">Chưa có đánh giá nào.</p>
                ) : (
                    <div className="row">
                        {recentReviews.map(review => (
                            <div className="col-md-6 mb-3" key={review.id}>
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <div>
                                            <span className="badge bg-primary me-2">
                                                {review.type === 'gym' ? 'Phòng Gym' : 
                                                 review.type === 'trainer' ? 'Huấn Luyện Viên' : 'Nhân Viên'}
                                            </span>
                                            {review.trainerName && <span className="text-muted small">- {review.trainerName}</span>}
                                            {review.staffName && <span className="text-muted small">- {review.staffName}</span>}
                                        </div>
                                        <small className="text-muted">{review.date}</small>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <h6 className="card-subtitle">{review.userName}</h6>
                                            {renderStars(review.rating)}
                                        </div>
                                        <p className="card-text">{review.comment}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container my-5">
            {/* Page header */}
            <div className="row mb-4">
                <div className="col">
                    <p className="text-muted">
                        Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện dịch vụ.
                    </p>
                </div>
            </div>

            {/* Review type selection */}
            {!activeReviewType && (
                <div className="row mb-5">
                    <div className="col-12">
                        <h4 className="mb-4">Bạn muốn đánh giá điều gì?</h4>
                    </div>
                    <div className="col-md-6 mb-3">
                        <div
                            className="card h-100 review-option-card"
                            onClick={() => handleSelectReviewType('gym')}
                        >
                            <div className="card-body text-center p-5">
                                <div className="review-icon mb-3">
                                    <i className="bi bi-building fs-1 text-primary"></i>
                                </div>
                                <h5 className="card-title">Đánh Giá Phòng Gym</h5>
                                <p className="card-text text-muted">
                                    Chia sẻ cảm nhận của bạn về cơ sở vật chất, trang thiết bị, và dịch vụ
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <div
                            className="card h-100 review-option-card"
                            onClick={() => handleSelectReviewType('trainer')}
                        >
                            <div className="card-body text-center p-5">
                                <div className="review-icon mb-3">
                                    <i className="bi bi-person-fill fs-1 text-primary"></i>
                                </div>
                                <h5 className="card-title">Đánh Giá Huấn Luyện Viên</h5>
                                <p className="card-text text-muted">
                                    Chia sẻ trải nghiệm của bạn với huấn luyện viên tại phòng gym
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <div
                            className="card h-100 review-option-card"
                            onClick={() => handleSelectReviewType('staff')}
                        >
                            <div className="card-body text-center p-5">
                                <div className="review-icon mb-3">
                                    <i className="bi bi-people-fill fs-1 text-primary"></i>
                                </div>
                                <h5 className="card-title">Đánh Giá Nhân Viên</h5>
                                <p className="card-text text-muted">
                                    Chia sẻ trải nghiệm của bạn với nhân viên hỗ trợ và dịch vụ khách hàng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review forms */}
            {activeReviewType && (
                <div className="review-form-container bg-light p-4 rounded mb-4">
                    {activeReviewType === 'gym' && renderGymReviewForm()}
                    {activeReviewType === 'trainer' && renderTrainerReviewForm()}
                    {activeReviewType === 'staff' && renderStaffReviewForm()}
                </div>
            )}

            {/* Recent reviews */}
            {renderRecentReviews()}
        </div>
    );
};

export default GymReview;