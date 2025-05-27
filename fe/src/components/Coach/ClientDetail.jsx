import React from 'react';

const ClientDetail = ({ client }) => (
    <div>
        <h2 className="text-xl font-bold">Thông tin chi tiết</h2>
        <p>Tên: {client.name}</p>
        <p>Tuổi: {client.age}</p>
        <p>Mục tiêu: {client.goal}</p>
    </div>
);

export default ClientDetail;