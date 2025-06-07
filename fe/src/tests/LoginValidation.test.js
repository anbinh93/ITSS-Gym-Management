/**
 * Test file for Login Validation fixes
 * Tests the validateField function to ensure it handles undefined/null values safely
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '../pages/login/LoginPage';
import authSlice from '../redux/authSlice';

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        currentUser: null,
        isLoggedIn: false,
        loading: false,
        error: null,
        token: null,
        lastLogin: null,
        ...initialState
      }
    }
  });
};

// Test component wrapper
const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('LoginPage Validation Fixes', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
  });

  test('should render login form without errors', () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    expect(screen.getByText('Hệ thống quản lý phòng tập Gym')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập email hoặc tên đăng nhập')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nhập mật khẩu')).toBeInTheDocument();
  });

  test('should handle empty form submission without crashing', async () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Đăng nhập');
    
    // Submit empty form - should not crash and should show validation errors
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email hoặc tên đăng nhập là bắt buộc')).toBeInTheDocument();
      expect(screen.getByText('Mật khẩu là bắt buộc')).toBeInTheDocument();
    });
  });

  test('should handle undefined/null values in form inputs without crashing', async () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Nhập email hoặc tên đăng nhập');
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

    // Test typing and then clearing inputs (simulating undefined/null scenarios)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(emailInput, { target: { value: '' } });
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(passwordInput, { target: { value: '' } });

    // Should not crash and should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Email hoặc tên đăng nhập là bắt buộc')).toBeInTheDocument();
      expect(screen.getByText('Mật khẩu là bắt buộc')).toBeInTheDocument();
    });
  });

  test('should validate email format correctly', async () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Nhập email hoặc tên đăng nhập');

    // Test invalid email format
    fireEvent.change(emailInput, { target: { value: 'invalid-email@' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText('Định dạng email không hợp lệ')).toBeInTheDocument();
    });

    // Test valid email format
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.queryByText('Định dạng email không hợp lệ')).not.toBeInTheDocument();
    });
  });

  test('should validate password length correctly', async () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

    // Test short password
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText('Mật khẩu phải có ít nhất 8 ký tự')).toBeInTheDocument();
    });

    // Test valid password
    fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.queryByText('Mật khẩu phải có ít nhất 8 ký tự')).not.toBeInTheDocument();
    });
  });

  test('should handle demo account login correctly', async () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    // Open demo accounts
    const demoButton = screen.getByText('Xem tài khoản demo');
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    // Click on admin demo account
    const adminAccount = screen.getByText('Admin User').closest('button');
    fireEvent.click(adminAccount);

    // Check if form is populated correctly
    const emailInput = screen.getByPlaceholderText('Nhập email hoặc tên đăng nhập');
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

    expect(emailInput.value).toBe('admin@gym.com');
    expect(passwordInput.value).toBe('admin123');
  });

  test('should handle form submission with valid data', async () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Nhập email hoặc tên đăng nhập');
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
    const submitButton = screen.getByText('Đăng nhập');

    // Fill in valid data
    fireEvent.change(emailInput, { target: { value: 'admin@gym.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });

    // Submit form
    fireEvent.click(submitButton);

    // Should not show validation errors
    expect(screen.queryByText('Email hoặc tên đăng nhập là bắt buộc')).not.toBeInTheDocument();
    expect(screen.queryByText('Mật khẩu là bắt buộc')).not.toBeInTheDocument();
  });

  test('should toggle password visibility correctly', () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
    const toggleButton = passwordInput.parentElement.querySelector('button');

    // Initially password should be hidden
    expect(passwordInput.type).toBe('password');

    // Click toggle button
    fireEvent.click(toggleButton);

    // Password should now be visible
    expect(passwordInput.type).toBe('text');

    // Click toggle button again
    fireEvent.click(toggleButton);

    // Password should be hidden again
    expect(passwordInput.type).toBe('password');
  });

  test('should handle remember me checkbox correctly', () => {
    render(
      <TestWrapper store={store}>
        <LoginPage />
      </TestWrapper>
    );

    const rememberMeCheckbox = screen.getByLabelText('Ghi nhớ đăng nhập trong 30 ngày');

    // Initially unchecked
    expect(rememberMeCheckbox.checked).toBe(false);

    // Click checkbox
    fireEvent.click(rememberMeCheckbox);

    // Should be checked
    expect(rememberMeCheckbox.checked).toBe(true);

    // Click again
    fireEvent.click(rememberMeCheckbox);

    // Should be unchecked
    expect(rememberMeCheckbox.checked).toBe(false);
  });
});
