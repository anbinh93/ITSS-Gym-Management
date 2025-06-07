import mongoose from "mongoose";

const packageChangeSchema = new mongoose.Schema({
  // Thông tin cơ bản
  membership: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Membership", 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  oldPackage: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Package", 
    required: true 
  },
  newPackage: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Package", 
    required: true 
  },
  
  // Thông tin yêu cầu
  requestDate: { 
    type: Date, 
    default: Date.now 
  },
  reason: { 
    type: String, 
    maxlength: 500 
  },
  
  // Trạng thái xử lý
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  approvedDate: Date,
  rejectedDate: Date,
  adminNote: { 
    type: String, 
    maxlength: 500 
  },
  
  // Tính toán tài chính
  priceDifference: { 
    type: Number, 
    required: true 
  }, // Chênh lệch giá gói mới - gói cũ
  remainingDays: { 
    type: Number, 
    required: true 
  }, // Số ngày còn lại của gói cũ
  refundAmount: { 
    type: Number, 
    required: true 
  }, // Số tiền hoàn lại từ gói cũ
  newPeriodCost: { 
    type: Number, 
    required: true 
  }, // Chi phí gói mới cho thời gian còn lại
  netAmount: { 
    type: Number, 
    required: true 
  }, // Số tiền thực tế cần thanh toán hoặc hoàn lại
  
  // Tính toán sessions
  oldSessionsRemaining: { 
    type: Number 
  },
  newSessionsCalculated: { 
    type: Number 
  }, // Số sessions tương ứng với gói mới
  
  // Metadata
  changeType: { 
    type: String, 
    enum: ['upgrade', 'downgrade', 'same-tier'], 
    default: function() {
      return this.priceDifference > 0 ? 'upgrade' : 
             this.priceDifference < 0 ? 'downgrade' : 'same-tier';
    }
  }
}, { 
  timestamps: true 
});

// Index để tìm kiếm nhanh
packageChangeSchema.index({ user: 1, status: 1 });
packageChangeSchema.index({ status: 1, createdAt: -1 });

export const packageChangeModel = mongoose.models.PackageChange || 
       mongoose.model("PackageChange", packageChangeSchema);
