
const db = require('../models/index')

const getHomePage = async (req, res) => {
    try {
        const member = await db.member.findAll();
        console.log('All members:', JSON.stringify(member, null, 2));
        
        return res.send(member)
    } catch (error) {

        console.error("❌ Lỗi khi lấy danh sách members:", error);
        return res.status(500).send("Lỗi server");
    }
}

module.exports = {
    getHomePage
}