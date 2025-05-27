import React from 'react';
import TrainerSidebar from './TrainerSidebar';
import TrainerHeader from './TrainerHeader';

const TrainerLayout = ({ children }) => {
    return (
        <div className="d-flex bg-light">
            <TrainerSidebar />
            <div className="flex-grow-1">
                <TrainerHeader />

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

export default TrainerLayout;
