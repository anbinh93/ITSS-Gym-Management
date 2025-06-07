# Repeat Schedule Functionality

## Tổng quan
Chức năng lặp lại lịch tập cho phép huấn luyện viên (coach) dễ dàng sao chép một lịch tập đã có sang nhiều ngày khác, giúp tiết kiệm thời gian khi tạo lịch tập định kỳ.

## Tính năng chính

### 1. Nút "Lặp lại" 
- Xuất hiện bên cạnh nút "Chỉnh sửa" trong mỗi lịch tập
- Chỉ hiển thị khi đã chọn một học viên cụ thể
- Icon: Copy từ lucide-react

### 2. Modal lặp lịch
- **Header**: Tiêu đề với icon CalendarDays
- **Preview**: Hiển thị thông tin lịch tập gốc (tên, mô tả, thời gian)
- **Calendar Grid**: Lưới chọn ngày trong 30 ngày tới
- **Quick Actions**: Nút "Chọn tất cả" và "Bỏ chọn tất cả"

### 3. Date Selection Logic
- **Ngăn chặn**: Không cho chọn ngày hiện tại
- **Cảnh báo**: Hiển thị badge "Có lịch" cho ngày đã có lịch tập
- **Visual Feedback**: Các trạng thái khác nhau (disabled, has-conflict, selected)

### 4. Save Process
- **Confirmation**: Hỏi xác nhận trước khi lưu
- **Progress**: Hiển thị spinner loading khi đang lưu
- **Bulk Creation**: Tạo lịch cho tất cả ngày đã chọn
- **Session Creation**: Tự động tạo workout session nếu lịch gốc có enabled

## Thành phần kỹ thuật

### State Management
```javascript
const [showRepeatModal, setShowRepeatModal] = useState(false);
const [selectedWorkoutToRepeat, setSelectedWorkoutToRepeat] = useState(null);
const [selectedDatesToRepeat, setSelectedDatesToRepeat] = useState([]);
const [repeatSaving, setRepeatSaving] = useState(false);
```

### Core Functions
1. **handleRepeatSchedule(workout)**: Khởi tạo modal repeat
2. **handleDateToggleForRepeat(date)**: Xử lý chọn/bỏ chọn ngày
3. **handleSaveRepeatedSchedule()**: Lưu lịch lặp lại
4. **getRepeatCalendarDays()**: Tạo danh sách 30 ngày tới

### API Integration
- **createUserWorkoutSchedule**: Tạo lịch tập mới
- **createWorkoutSession**: Tạo buổi tập theo dõi (nếu cần)
- **fetchScheduleForTrainee**: Refresh dữ liệu sau khi lưu

## Luồng sử dụng

1. Coach chọn một học viên
2. Xem lịch tập trong ngày cụ thể
3. Click nút "Lặp lại" trên lịch tập muốn sao chép
4. Modal mở ra hiển thị preview lịch tập
5. Chọn các ngày muốn lặp lại (có thể dùng "Chọn tất cả")
6. Click "Lưu lịch lặp lại"
7. Hệ thống hiển thị confirmation dialog
8. Sau khi xác nhận, hệ thống tạo lịch cho tất cả ngày đã chọn
9. Hiển thị thông báo thành công và refresh dữ liệu

## UI/UX Features

### Visual Indicators
- 🔄 Badge "Hiện tại" cho ngày hiện tại (disabled)
- ⚠️ Badge "Có lịch" cho ngày đã có lịch tập
- ✅ Highlight màu xanh cho ngày đã chọn
- 📋 Preview box hiển thị thông tin lịch gốc

### Responsive Design
- Grid layout tự động điều chỉnh theo screen size
- Modal responsive trên mobile
- Proper spacing và typography

### Error Handling
- Validation: Yêu cầu chọn ít nhất 1 ngày
- Confirmation: Xác nhận trước khi ghi đè lịch có sẵn
- Progress feedback: Loading spinner khi đang lưu
- Success/Error messages với emoji icons

## CSS Classes
- `.repeat-modal-backdrop`: Background với blur effect
- `.repeat-calendar-grid`: Container cho grid chọn ngày
- `.repeat-date-option`: Style cho từng option ngày
- `.repeat-workout-preview`: Preview box lịch tập gốc

## Dependencies
- React hooks: useState, useEffect
- Lucide React icons: Copy, CalendarDays, Save, X
- Bootstrap classes cho modal và responsive
- Custom CSS cho styling

## Future Enhancements
1. **Template System**: Lưu lịch tập thành template để tái sử dụng
2. **Batch Operations**: Áp dụng cho nhiều học viên cùng lúc
3. **Weekly Pattern**: Lặp theo pattern tuần (thứ 2, 4, 6)
4. **Smart Scheduling**: Tự động tránh conflict với lịch có sẵn
5. **Export/Import**: Xuất/nhập lịch tập hàng loạt
