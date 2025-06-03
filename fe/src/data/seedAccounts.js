export const seedAccounts = {
    admin: {
        username: "admin",
        email: "admin@gym.com",
        password: "Admin@123",
        name: "Admin",
        role: "ADMIN",
        phone: "0123456789",
        birthYear: 1990,
        gender: "MALE"
    },
    staff: [
        {
            username: "staff1",
            email: "staff1@gym.com",
            password: "Staff@123",
            name: "Nhân viên 1",
            role: "STAFF",
            phone: "0123456781",
            birthYear: 1995,
            gender: "FEMALE"
        },
        {
            username: "staff2",
            email: "staff2@gym.com",
            password: "Staff@123",
            name: "Nhân viên 2",
            role: "STAFF",
            phone: "0123456782",
            birthYear: 1992,
            gender: "MALE"
        }
    ],
    members: [
        {
            username: "member1",
            email: "member1@gmail.com",
            password: "Member@123",
            name: "Hội viên 1",
            role: "MEMBER",
            phone: "0987654321",
            birthYear: 1998,
            gender: "MALE",
            membership: {
                packageName: "Basic", // Reference by logical name
                paymentMethod: "CASH"
            }
        },
        {
            username: "member2",
            email: "member2@gmail.com",
            password: "Member@123",
            name: "Hội viên 2",
            role: "MEMBER",
            phone: "0987654322",
            birthYear: 1997,
            gender: "FEMALE",
            membership: {
                packageName: "Standard", // Reference by logical name
                paymentMethod: "CASH"
            }
        },
        {
            username: "member3",
            email: "member3@gmail.com",
            password: "Member@123",
            name: "Hội viên 3",
            role: "MEMBER",
            phone: "0987654323",
            birthYear: 1996,
            gender: "MALE",
            membership: {
                packageName: "Premium", // Reference by logical name
                paymentMethod: "CASH"
            }
        }
    ]
}; 