import React from 'react';
import UserSidebar from './UserSidebar';
import UserHeader from './UserHeader';

const UserLayout = ({ children }) => {
    return (
        <div className="d-flex bg-light">
            <UserSidebar />
            <div className="flex-grow-1">
                <UserHeader  />

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

                <main className="p-4 overflow-auto">{children}</main>
            </div>
        </div>
    );
};

export default UserLayout;
