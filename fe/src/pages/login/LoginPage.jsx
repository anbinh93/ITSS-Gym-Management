import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError, selectAuthLoading, selectAuthError, selectIsLoggedIn } from '../../redux/authSlice';
import authService from '../../services/authService';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import DemoInstructions from '../../components/DemoInstructions';
import './login.css';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const isLoggedIn = useSelector(selectIsLoggedIn);

    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(false);

    // Demo accounts for easy testing
    const demoAccounts = authService.getDemoAccounts();

    useEffect(() => {
        if (isLoggedIn) {
            const user = authService.getCurrentUser();
            if (user) {
                // Redirect based on user role
                switch (user.role) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'staff':
                        navigate('/staff/dashboard');
                        break;
                    case 'coach':
                        navigate('/coach/dashboard');
                        break;
                    case 'user':
                        navigate('/user/dashboard');
                        break;
                    default:
                        navigate('/');
                }
            }
        }
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        // Clear error when component mounts
        dispatch(clearError());
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (error) {
            dispatch(clearError());
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.emailOrUsername.trim() || !formData.password.trim()) {
            return;
        }

        dispatch(loginUser({
            emailOrUsername: formData.emailOrUsername.trim(),
            password: formData.password
        }));
    };

    const handleDemoLogin = (account) => {
        setFormData({
            emailOrUsername: account.email,
            password: account.username + '123', // Following the pattern from authService
            rememberMe: false
        });
        setShowDemoAccounts(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <DemoInstructions />
            <div className="login-container">
                <div className="login-background">
                    <div className="login-overlay"></div>
                </div>
            
            <div className="container-fluid h-100">
                <div className="row h-100 align-items-center justify-content-center">
                    <div className="col-lg-10 col-xl-8">
                        <div className="row h-100">
                            {/* Left Side - Branding */}
                            <div className="col-lg-6 d-flex align-items-center justify-content-center login-left">
                                <div className="text-center text-white p-5">
                                    <div className="mb-4">
                                        <div className="login-logo">
                                            <div className="logo-icon">
                                                <i className="fas fa-dumbbell"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <h1 className="display-4 fw-bold mb-4">
                                        FitnessPro
                                        <span className="d-block fs-3 fw-normal mt-2 text-accent">
                                            Your Ultimate Gym Experience
                                        </span>
                                    </h1>
                                    <p className="lead mb-4 opacity-90">
                                        Transform your fitness journey with our comprehensive gym management system.
                                        Train smart, stay strong, achieve your goals.
                                    </p>
                                    <div className="login-features">
                                        <div className="feature-item">
                                            <CheckCircle size={20} className="me-2" />
                                            <span>Professional Training Programs</span>
                                        </div>
                                        <div className="feature-item">
                                            <CheckCircle size={20} className="me-2" />
                                            <span>Modern Equipment & Facilities</span>
                                        </div>
                                        <div className="feature-item">
                                            <CheckCircle size={20} className="me-2" />
                                            <span>Personal Progress Tracking</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Login Form */}
                            <div className="col-lg-6 d-flex align-items-center justify-content-center">
                                <div className="login-form-container">
                                    <div className="card login-card">
                                        <div className="card-body p-5">
                                            <div className="text-center mb-4">
                                                <h2 className="fw-bold text-primary mb-2">Welcome Back</h2>
                                                <p className="text-muted">Sign in to access your account</p>
                                            </div>

                                            {error && (
                                                <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                                                    <AlertCircle size={20} className="me-2" />
                                                    <span>{error}</span>
                                                </div>
                                            )}

                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label htmlFor="emailOrUsername" className="form-label fw-medium">
                                                        Email or Username
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text">
                                                            <Mail size={20} />
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="emailOrUsername"
                                                            name="emailOrUsername"
                                                            value={formData.emailOrUsername}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter your email or username"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label htmlFor="password" className="form-label fw-medium">
                                                        Password
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text">
                                                            <Lock size={20} />
                                                        </span>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            className="form-control"
                                                            id="password"
                                                            name="password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter your password"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={togglePasswordVisibility}
                                                        >
                                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                        </button>
                                                    </div>
                                                </div>

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
                                                        <label className="form-check-label" htmlFor="rememberMe">
                                                            Remember me for 30 days
                                                        </label>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="btn btn-primary w-100 mb-3 py-2 fw-medium"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader size={20} className="spinner-border spinner-border-sm me-2" />
                                                            Signing in...
                                                        </>
                                                    ) : (
                                                        'Sign In'
                                                    )}
                                                </button>
                                            </form>

                                            <div className="text-center">
                                                <hr className="my-4" />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary w-100"
                                                    onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                                                >
                                                    <User size={20} className="me-2" />
                                                    View Demo Accounts
                                                </button>
                                            </div>

                                            {/* Demo Accounts Section */}
                                            {showDemoAccounts && (
                                                <div className="mt-4">
                                                    <div className="card bg-light">
                                                        <div className="card-header">
                                                            <h6 className="mb-0 fw-medium">Demo Accounts</h6>
                                                        </div>
                                                        <div className="card-body p-3">
                                                            <small className="text-muted d-block mb-3">
                                                                Click on any account to auto-fill the form:
                                                            </small>
                                                            {demoAccounts.map((account) => (
                                                                <div
                                                                    key={account.id}
                                                                    className="demo-account-item"
                                                                    onClick={() => handleDemoLogin(account)}
                                                                >
                                                                    <div className="d-flex align-items-center">
                                                                        <img
                                                                            src={account.avatar}
                                                                            alt={account.name}
                                                                            className="demo-avatar me-3"
                                                                        />
                                                                        <div className="flex-grow-1">
                                                                            <div className="fw-medium">{account.name}</div>
                                                                            <small className="text-muted">
                                                                                {account.email} • {account.role}
                                                                            </small>
                                                                        </div>
                                                                        <small className="text-primary">Click to use</small>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default LoginPage;