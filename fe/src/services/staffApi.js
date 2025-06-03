import { API_BASE } from './config';
import { fetchWithAuth } from './api';

// Lấy danh sách thành viên
export async function getMembers() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/members`);
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('getMembers error:', error);
        return {
            success: false,
            error: error.message || 'Lấy danh sách thành viên thất bại'
        };
    }
}

// Lấy thông tin chi tiết thành viên
export async function getMemberDetail(memberId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/members/${memberId}`);
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('getMemberDetail error:', error);
        return {
            success: false,
            error: error.message || 'Lấy thông tin thành viên thất bại'
        };
    }
}

// Cập nhật thông tin thành viên
export async function updateMember(memberId, data) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/members/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('updateMember error:', error);
        return {
            success: false,
            error: error.message || 'Cập nhật thông tin thành viên thất bại'
        };
    }
}

// Lấy danh sách check-in/check-out
export async function getAttendanceRecords() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/attendance`);
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('getAttendanceRecords error:', error);
        return {
            success: false,
            error: error.message || 'Lấy danh sách điểm danh thất bại'
        };
    }
}

// Check-in thành viên
export async function checkInMember(memberId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/attendance/check-in`, {
            method: 'POST',
            body: JSON.stringify({ memberId })
        });
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('checkInMember error:', error);
        return {
            success: false,
            error: error.message || 'Check-in thất bại'
        };
    }
}

// Check-out thành viên
export async function checkOutMember(memberId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/attendance/check-out`, {
            method: 'POST',
            body: JSON.stringify({ memberId })
        });
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('checkOutMember error:', error);
        return {
            success: false,
            error: error.message || 'Check-out thất bại'
        };
    }
}

// Lấy danh sách feedback cần xử lý
export async function getPendingFeedbacks() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/feedbacks/pending`);
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('getPendingFeedbacks error:', error);
        return {
            success: false,
            error: error.message || 'Lấy danh sách feedback thất bại'
        };
    }
}

// Xử lý feedback
export async function handleFeedback(feedbackId, response) {
    try {
        const apiResponse = await fetchWithAuth(`${API_BASE}/api/staff/feedbacks/${feedbackId}/handle`, {
            method: 'POST',
            body: JSON.stringify({ response })
        });
        return {
            success: true,
            data: apiResponse.data || apiResponse
        };
    } catch (error) {
        console.error('handleFeedback error:', error);
        return {
            success: false,
            error: error.message || 'Xử lý feedback thất bại'
        };
    }
}

// Lấy thống kê công việc của staff
export async function getStaffStats() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/staff/stats`);
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('getStaffStats error:', error);
        return {
            success: false,
            error: error.message || 'Lấy thống kê thất bại'
        };
    }
} 