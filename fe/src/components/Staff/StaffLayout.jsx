import React from 'react';
import StaffSidebar from './StaffSidebar';
import StaffHeader from './StaffHeader';

const StaffLayout = ({ children }) => {
    return (
        <div className="d-flex bg-light" style={{ height: '100vh' }}>
            <StaffSidebar />
            <div className="flex-grow-1">
                <StaffHeader />

                {/* Hero section */}
                <div style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1594737625785-c84c4ec6ba4f')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                </div>

                <main className="p-4 overflow-auto" style={{marginTop: 100}}>{children}</main>
            </div>
        </div>
    );
};

export default StaffLayout;
