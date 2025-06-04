import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle, Loader, Dumbbell } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, selectIsLoggedIn, selectCurrentUser, selectAuthError, selectAuthLoading } from '../../redux/authSlice';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const currentUser = useSelector(selectCurrentUser);
    const authError = useSelector(selectAuthError);
    const authLoading = useSelector(selectAuthLoading);

    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    // Demo accounts for easy testing
    const demoAccounts = [
        { id: 1, name: 'Admin User', email: 'admin@gym.com', username: 'admin', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face' },
        { id: 2, name: 'Staff Member', email: 'staff@gym.com', username: 'staff', role: 'staff', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face' },
        { id: 3, name: 'Coach John', email: 'coach@gym.com', username: 'coach', role: 'coach', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' },
        { id: 4, name: 'Member User', email: 'user@gym.com', username: 'user', role: 'user', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' }
    ];

    useEffect(() => {
        if (isLoggedIn && currentUser) {
            // Điều hướng theo role
            switch (currentUser.role) {
                case 'admin':
                    navigate('/admin/dashboard', { replace: true });
                    break;
                case 'staff':
                    navigate('/staff/dashboard', { replace: true });
                    break;
                case 'coach':
                    navigate('/coach/dashboard', { replace: true });
                    break;
                case 'user':
                    navigate('/user/dashboard', { replace: true });
                    break;
                default:
                    navigate('/login', { replace: true });
            }
        }
    }, [isLoggedIn, currentUser, navigate]);

    const validateField = (name, value) => {
        const errors = { ...validationErrors };
        
        switch (name) {
            case 'emailOrUsername':
                if (!value.trim()) {
                    errors[name] = 'Email hoặc tên đăng nhập là bắt buộc';
                } else if (value.includes('@') && !/\S+@\S+\.\S+/.test(value)) {
                    errors[name] = 'Định dạng email không hợp lệ';
                } else {
                    delete errors[name];
                }
                break;
            case 'password':
                if (!value.trim()) {
                    errors[name] = 'Mật khẩu là bắt buộc';
                } else if (value.length < 8) {
                    errors[name] = 'Mật khẩu phải có ít nhất 8 ký tự';
                } else {
                    delete errors[name];
                }
                break;
            default:
                break;
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        
        // Validate field on change
        if (name !== 'rememberMe') {
            validateField(name, newValue);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isEmailValid = validateField('emailOrUsername', formData.emailOrUsername);
        const isPasswordValid = validateField('password', formData.password);
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        // Gọi redux action loginUser
        dispatch(loginUser(formData));
    };

    const handleDemoLogin = (account) => {
        const demoData = {
            emailOrUsername: account.email,
            password: account.username + '123',
            rememberMe: false
        };
        
        setFormData(demoData);
        setValidationErrors({});
        setShowDemoAccounts(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getInputClassName = (fieldName) => {
        let baseClass = 'form-control';
        if (validationErrors[fieldName]) {
            baseClass += ' is-invalid';
        }
        return baseClass;
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" 
             style={{
                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                 fontFamily: 'Arial, sans-serif'
             }}>
            
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '1rem' }}>
                            <div className="card-body p-5">
                                {/* Header Section */}
                                <div className="text-center mb-4">
                                    <div className="mb-3">
                                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3"
                                             style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                            <Dumbbell size={40} />
                                        </div>
                                    </div>
                                    <h1 className="h3 fw-bold text-dark mb-2">
                                        Hệ thống quản lý phòng tập Gym
                                    </h1>
                                    <p className="text-muted small mb-0">
                                        Đăng nhập để truy cập vào hệ thống
                                    </p>
                                </div>

                                {/* Error Alert */}
                                {authError && (
                                    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                        <AlertCircle size={20} className="me-2 flex-shrink-0" />
                                        <span className="small">{authError}</span>
                                    </div>
                                )}

                                {/* Login Form */}
                                <form onSubmit={handleSubmit}>
                                    {/* Email/Username Field */}
                                    <div className="mb-3">
                                        <label htmlFor="emailOrUsername" className="form-label fw-medium small">
                                            Email hoặc tên đăng nhập <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <Mail size={18} className="text-muted" />
                                            </span>
                                            <input
                                                type="text"
                                                className={getInputClassName('emailOrUsername')}
                                                id="emailOrUsername"
                                                name="emailOrUsername"
                                                value={formData.emailOrUsername}
                                                onChange={handleInputChange}
                                                placeholder="Nhập email hoặc tên đăng nhập"
                                                style={{ fontSize: '14px' }}
                                                autoComplete="username"
                                                required
                                            />
                                        </div>
                                        {validationErrors.emailOrUsername && (
                                            <div className="invalid-feedback d-block small">
                                                {validationErrors.emailOrUsername}
                                            </div>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label fw-medium small">
                                            Mật khẩu <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <Lock size={18} className="text-muted" />
                                            </span>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className={getInputClassName('password')}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                placeholder="Nhập mật khẩu"
                                                style={{ fontSize: '14px' }}
                                                autoComplete="current-password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary border-start-0"
                                                onClick={togglePasswordVisibility}
                                                tabIndex="-1"
                                                style={{ fontSize: '14px' }}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {validationErrors.password && (
                                            <div className="invalid-feedback d-block small">
                                                {validationErrors.password}
                                            </div>
                                        )}
                                    </div>

                                    {/* Remember Me */}
                                    <div className="mb-4">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="rememberMe"
                                                name="rememberMe"
                                                checked={formData.rememberMe}
                                                onChange={handleInputChange}
                                            />
                                            <label className="form-check-label small" htmlFor="rememberMe">
                                                Ghi nhớ đăng nhập trong 30 ngày
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2 fw-medium mb-3"
                                        disabled={authLoading || Object.keys(validationErrors).length > 0}
                                        style={{ fontSize: '14px' }}
                                    >
                                        {authLoading ? (
                                            <>
                                                <Loader size={18} className="spinner-border spinner-border-sm me-2" />
                                                Đang đăng nhập...
                                            </>
                                        ) : (
                                            'Đăng nhập'
                                        )}
                                    </button>
                                </form>

                                {/* Demo Accounts Toggle */}
                                <div className="text-center">
                                    <hr className="my-4" />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary w-100"
                                        onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                                        style={{ fontSize: '14px' }}
                                    >
                                        <User size={18} className="me-2" />
                                        {showDemoAccounts ? 'Ẩn tài khoản demo' : 'Xem tài khoản demo'}
                                    </button>
                                </div>

                                {/* Demo Accounts Section */}
                                {showDemoAccounts && (
                                    <div className="mt-4">
                                        <div className="card bg-light border">
                                            <div className="card-header bg-transparent border-bottom">
                                                <h6 className="mb-0 fw-medium small">Tài khoản demo</h6>
                                            </div>
                                            <div className="card-body p-3">
                                                <p className="small text-muted mb-3">
                                                    Nhấp vào tài khoản để tự động điền form:
                                                </p>
                                                <div className="d-grid gap-2">
                                                    {demoAccounts.map((account) => (
                                                        <button
                                                            key={account.id}
                                                            type="button"
                                                            className="btn btn-light text-start border p-3"
                                                            onClick={() => handleDemoLogin(account)}
                                                            style={{ fontSize: '14px' }}
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <img
                                                                    src={account.avatar}
                                                                    alt={account.name}
                                                                    className="rounded-circle me-3"
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                />
                                                                <div className="flex-grow-1">
                                                                    <div className="fw-medium text-dark">{account.name}</div>
                                                                    <small className="text-muted">
                                                                        {account.email} • {account.role}
                                                                    </small>
                                                                </div>
                                                                <small className="text-primary">Nhấp để sử dụng</small>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="text-center mt-4">
                                    <small className="text-muted">
                                        © 2025 Hệ thống quản lý phòng tập Gym
                                        <br />
                                        Đại học Bách Khoa Hà Nội
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;