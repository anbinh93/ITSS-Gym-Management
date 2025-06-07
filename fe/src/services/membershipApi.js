import { API_BASE } from './config';
import { fetchWithAuth } from './api';

// Helper function to get auth headers - can be removed if fetchWithAuth handles it fully
// const getAuthHeaders = () => {
//     const token = localStorage.getItem('gym_token');
//     return {
//         'Content-Type': 'application/json',
//         'Authorization': token ? `Bearer ${token}` : ''
//     };
// };

// Lấy danh sách gói tập
export async function getPackages() {
    try {
        // Assuming fetchWithAuth now correctly parses JSON and throws on HTTP error
        const response = await fetchWithAuth(`${API_BASE}/api/packages`);
        // If fetchWithAuth returns data directly on success:
        return { success: true, data: response.data || response }; // Adjust based on fetchWithAuth actual return
    } catch (error) {
        console.error('getPackages error in membershipApi:', error);
        return { success: false, message: error.message || 'Lấy danh sách gói tập thất bại', data: [] };
    }
}

// Lấy gói tập đang active của user
export async function getActiveMembership(userId) {
    if (!userId) {
        return { success: false, message: 'User ID is required' };
    }
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/membership/active/${userId}`);
        return response; // Backend already returns { success: true, memberships }
    } catch (error) {
        console.error('getActiveMembership error:', error);
        return { success: false, message: error.message || 'Lấy thông tin gói tập thất bại' };
    }
}

// Lấy lịch sử gói tập của user
export async function getMembershipHistory(userId) {
    if (!userId) {
        return { success: false, message: 'User ID is required' };
    }
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/membership/user/${userId}`);
        return { success: true, ...response }; 
    } catch (error) {
        console.error('getMembershipHistory error:', error);
        return { success: false, message: error.message || 'Lấy lịch sử gói tập thất bại' };
    }
}

// Đăng ký gói tập mới
export async function registerMembership(data) {
    if (!data.userId || !data.packageId) {
        return { success: false, message: 'User ID and Package ID are required (client-side check).' };
    }
    try {
        // fetchWithAuth will throw an error if !res.ok, and the error will have a message
        // from the parsed JSON if possible (due to recent api.js changes).
        const responseData = await fetchWithAuth(`${API_BASE}/api/membership/`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        // If fetchWithAuth was successful, responseData is the parsed JSON body.
        // We assume a successful response from this specific endpoint implies success.
        return { success: true, ...responseData }; 
    } catch (error) {
        console.error('registerMembership error in membershipApi:', error);
        // The error.message should be relatively informative now thanks to fetchWithAuth updates.
        return { success: false, message: error.message || 'Đăng ký gói tập thất bại do lỗi không xác định.' };
    }
}

// Gia hạn gói tập
export async function renewMembership(membershipId) {
    if (!membershipId) {
        return { success: false, message: 'Membership ID is required' };
    }
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/memberships/${membershipId}/renew`, {
            method: 'POST'
        });
        return { success: true, ...response };
    } catch (error) {
        console.error('renewMembership error:', error);
        return { success: false, message: error.message || 'Gia hạn gói tập thất bại' };
    }
}

// Hủy gói tập
export async function cancelMembership(membershipId) {
    if (!membershipId) {
        return { success: false, message: 'Membership ID is required' };
    }
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/memberships/${membershipId}/cancel`, {
            method: 'POST'
        });
        return { success: true, ...response };
    } catch (error) {
        console.error('cancelMembership error:', error);
        return { success: false, message: error.message || 'Hủy gói tập thất bại' };
    }
}

// Function to get all memberships (for admin display)
export async function getAllMemberships() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/membership/all`); // Đúng endpoint backend
        return { success: true, data: response.data || response };
    } catch (error) {
        console.error('getAllMemberships error:', error);
        return { success: false, message: error.message || 'Không thể tải danh sách đăng ký thành viên.', data: [] };
    }
}

export async function updatePaymentStatus(id, paymentStatus) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/membership/${id}/payment-status`, {
            method: 'PATCH',
            body: JSON.stringify({ paymentStatus })
        });
        return response;
    } catch (error) {
        console.error('updatePaymentStatus error:', error);
        return { success: false, message: error.message || 'Cập nhật trạng thái thanh toán thất bại.' };
    }
}

export async function getMembershipsByCoach(coachId) {
    if (!coachId) {
        return { success: false, message: 'Coach ID is required' };
    }
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/membership/all?coach=${coachId}`);
        // Response structure is { success: true, memberships: [...] }
        const memberships = response.memberships || [];
        return { success: true, data: memberships };
    } catch (error) {
        console.error('getMembershipsByCoach error:', error);
        return { success: false, message: error.message || 'Không thể tải danh sách hội viên theo HLV.', data: [] };
    }
}

export async function updateCoach(membershipId, coachId) {
    if (!membershipId) {
        return { success: false, message: 'Membership ID là bắt buộc' };
    }
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/membership/${membershipId}/coach`, {
            method: 'PATCH',
            body: JSON.stringify({ coach: coachId || null })
        });
        return response;
    } catch (error) {
        console.error('updateCoach error:', error);
        return { success: false, message: error.message || 'Cập nhật HLV thất bại.' };
    }
}

export async function updateMembershipStatus(membershipId, status) {
    if (!membershipId || !status) {
        return { success: false, message: 'Membership ID và trạng thái là bắt buộc' };
    }
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/membership/${membershipId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        return response;
    } catch (error) {
        console.error('updateMembershipStatus error:', error);
        return { success: false, message: error.message || 'Cập nhật trạng thái membership thất bại.' };
    }
} 