import { fetchWithAuth } from './authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Yêu cầu đổi gói tập
export async function requestPackageChange(data) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/package-change/request`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return { success: true, ...response };
    } catch (error) {
        console.error('requestPackageChange error:', error);
        return { success: false, message: error.message || 'Yêu cầu đổi gói tập thất bại' };
    }
}

// Lấy danh sách yêu cầu đổi gói của user
export async function getPackageChangesByUser(userId) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/package-change/user/${userId}`);
        return { success: true, ...response };
    } catch (error) {
        console.error('getPackageChangesByUser error:', error);
        return { success: false, message: error.message || 'Lấy danh sách yêu cầu đổi gói thất bại' };
    }
}

// Phê duyệt/từ chối yêu cầu đổi gói (Admin)
export async function approvePackageChange(changeId, data) {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/package-change/${changeId}/approve`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        return { success: true, ...response };
    } catch (error) {
        console.error('approvePackageChange error:', error);
        return { success: false, message: error.message || 'Xử lý yêu cầu đổi gói thất bại' };
    }
}

// Lấy tất cả yêu cầu đổi gói (Admin)
export async function getAllPackageChanges() {
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/package-change/all`);
        return { success: true, ...response };
    } catch (error) {
        console.error('getAllPackageChanges error:', error);
        return { success: false, message: error.message || 'Lấy danh sách yêu cầu đổi gói thất bại' };
    }
}

// Tính toán preview đổi gói
export function calculatePackageChangePreview(currentMembership, newPackage) {
    const today = new Date();
    const endDate = new Date(currentMembership.endDate);
    const remainingDays = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    
    if (remainingDays <= 0) {
        return {
            error: 'Gói tập hiện tại đã hết hạn'
        };
    }

    const currentPackage = currentMembership.package;
    const priceDifference = newPackage.price - currentPackage.price;
    
    // Tính toán theo tỷ lệ thời gian
    const totalDays = currentPackage.durationInDays;
    const usedDays = totalDays - remainingDays;
    const usedAmount = (currentPackage.price / totalDays) * usedDays;
    const refundAmount = currentPackage.price - usedAmount;
    
    // Chi phí gói mới cho thời gian còn lại
    const newPeriodCost = (newPackage.price / newPackage.durationInDays) * remainingDays;
    const netAmount = newPeriodCost - refundAmount;
    
    // Tính toán sessions
    const currentSessionsRatio = currentMembership.sessionsRemaining / currentPackage.sessionLimit;
    const newSessionsCalculated = Math.floor(currentSessionsRatio * newPackage.sessionLimit);
    
    return {
        success: true,
        preview: {
            currentPackage: currentPackage.name,
            newPackage: newPackage.name,
            remainingDays,
            priceDifference,
            refundAmount: Math.round(refundAmount),
            newPeriodCost: Math.round(newPeriodCost),
            netAmount: Math.round(netAmount),
            currentSessionsRemaining: currentMembership.sessionsRemaining,
            newSessionsCalculated,
            changeType: priceDifference > 0 ? 'upgrade' : 
                       priceDifference < 0 ? 'downgrade' : 'same-tier'
        }
    };
}
