import React, { useState, useEffect } from 'react';
import './GymReview.css';

const GymReview = () => {
    // State for managing which review form is active
    const [activeReviewType, setActiveReviewType] = useState(null);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [recentReviews, setRecentReviews] = useState([]);

    // Mock data for trainers
    useEffect(() => {
        // This would typically come from an API
        const mockTrainers = [
            { id: 1, name: 'Patrick Nguyễn ', specialization: 'Cardio & HIIT', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
            { id: 2, name: 'Patrick Nguyễn ', specialization: 'Yoga & Pilates', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
            { id: 3, name: 'Patrick Nguyễn', specialization: 'Strength & Conditioning', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
            { id: 4, name: 'Patrick Nguyễn', specialization: 'CrossFit', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
            { id: 5, name: 'Patrick Nguyễn', specialization: 'Nutrition & Weight Loss', image: 'https://randomuser.me/api/portraits/men/1.jpg' }
        ];
        setTrainers(mockTrainers);

        // Mock recent reviews
        const mockReviews = [
            {
                id: 1,
                type: 'gym',
                userName: 'PMQ',
                rating: 5,
                date: '15/05/2025',
                comment: 'Phòng gym rất sạch sẽ, trang thiết bị hiện đại và đầy đủ. Nhân viên phục vụ nhiệt tình.'
            },
            {
                id: 2,
                type: 'trainer',
                trainerName: 'PatrickNguyen',
                userName: 'Wean Lee',
                rating: 4,
                date: '10/05/2025',
                comment: 'HLV rất chuyên nghiệp, nhiệt tình hướng dẫn và theo dõi tiến độ của tôi.'
            },
            {
                id: 3,
                type: 'gym',
                userName: 'Quyết Phạm',
                rating: 4,
                date: '05/05/2025',
                comment: 'Không gian tập luyện rộng rãi, thoáng mát. Có nhiều loại máy tập đa dạng.'
            }
        ];
        setRecentReviews(mockReviews);
    }, []);

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
        setUserName('');
        setUserEmail('');
        setReviewSubmitted(false);
    };

    // Handle trainer selection
    const handleSelectTrainer = (trainer) => {
        setSelectedTrainer(trainer);
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
    const handleSubmitReview = (e) => {
        e.preventDefault();

        // Here you would typically send the review data to your backend
        console.log('Review submitted:', {
            type: activeReviewType,
            trainer: selectedTrainer,
            rating,
            reviewText,
            userName,
            userEmail
        });

        // For demo purposes, we'll just show a success message
        setReviewSubmitted(true);

        // Add the new review to recent reviews (in a real app, this would come from the server)
        const newReview = {
            id: recentReviews.length + 1,
            type: activeReviewType,
            trainerName: selectedTrainer?.name,
            userName,
            rating,
            date: new Date().toLocaleDateString('vi-VN'),
            comment: reviewText
        };

        setRecentReviews([newReview, ...recentReviews]);

        // Reset form after 3 seconds
        setTimeout(() => {
            resetForm();
            setActiveReviewType(null);
        }, 3000);
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

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor="userName" className="form-label">Họ tên:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="userName"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="userEmail" className="form-label">Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="userEmail"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={rating === 0}>
                                Gửi Đánh Giá
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setActiveReviewType(null)}
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

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label htmlFor="userName" className="form-label">Họ tên:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="userName"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="userEmail" className="form-label">Email:</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="userEmail"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={rating === 0 || !selectedTrainer}
                            >
                                Gửi Đánh Giá
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => setActiveReviewType(null)}
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
                                                {review.type === 'gym' ? 'Phòng Gym' : 'Huấn Luyện Viên'}
                                            </span>
                                            {review.trainerName && <span className="text-muted small">- {review.trainerName}</span>}
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
                </div>
            )}

            {/* Review forms */}
            {activeReviewType && (
                <div className="review-form-container bg-light p-4 rounded mb-4">
                    {activeReviewType === 'gym' ? renderGymReviewForm() : renderTrainerReviewForm()}
                </div>
            )}

            {/* Recent reviews */}
            {renderRecentReviews()}
        </div>
    );
};

export default GymReview;