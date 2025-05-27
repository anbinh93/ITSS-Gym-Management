import React from 'react';

const Profile = () => (
    <div className="container rounded bg-white mt-5 mb-5">
        <div className="row">
            <div className="col-md-3 border-end">
                <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                    <img className="rounded-circle mt-5" width="150px" src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg" alt="profile" />
                    <span className="fw-bold">Edogaru</span>
                    <span className="text-black-50">edogaru@mail.com.my</span>
                </div>
            </div>
            <div className="col-md-5 border-end">
                <div className="p-3 py-5">
                    <h4 className="mb-3">Profile Settings</h4>
                    <div className="row mb-3">
                        <div className="col-md-6"><label className="form-label">Tên đệm</label><input type="text" className="form-control" placeholder="First Name" /></div>
                        <div className="col-md-6"><label className="form-label">Tên</label><input type="text" className="form-control" placeholder="Surname" /></div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-12"><label className="form-label">Số Điện Thoại</label><input type="text" className="form-control" placeholder="Enter phone number" /></div>
                        <div className="col-md-12"><label className="form-label">Địa chỉ</label><input type="text" className="form-control" placeholder="Enter address" /></div>
                        <div className="col-md-12"><label className="form-label">Email</label><input type="email" className="form-control" placeholder="Enter email " /></div>
                        <div className="col-md-12"><label className="form-label">Học vấn</label><input type="text" className="form-control" placeholder="Education" /></div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6"><label className="form-label">Quốc tịch</label><input type="text" className="form-control" placeholder="Country" /></div>
                        <div className="col-md-6"><label className="form-label">Thành phố</label><input type="text" className="form-control" placeholder="State/Region" /></div>
                    </div>
                    <div className="text-center"><button className="btn btn-primary" type="button">Save Profile</button></div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="p-3 py-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span>Kinh nghiệm</span>
                    </div>
                    <div className="mb-3"><label className="form-label">Kinh nghiệm huấn luyện</label><input type="text" className="form-control" placeholder="Experience" /></div>
                    <div><label className="form-label">Chi tiết bổ sung</label><input type="text" className="form-control" placeholder="Additional details" /></div>
                </div>
            </div>
        </div>
    </div>
);

export default Profile;