import React from 'react';
import AdminSideBar from './AdminSideBar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children }) => {
    return (
        <div className="d-flex bg-light" style={{ height: '100vh' }}>
            <AdminSideBar />
            <div className="flex-grow-1">
                <AdminHeader />

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

export default AdminLayout;
