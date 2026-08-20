/**
 * DỮ LIỆU ĐỊNH MỨC PHÁP LÝ & HẰNG SỐ KẾ TOÁN - NHÂN SỰ VIỆT NAM
 * Cập nhật theo Bộ luật Lao động 2019, Luật Thuế TNCN & Luật BHXH
 */

const LEGAL_CONSTANTS = {
  // Mức giảm trừ gia cảnh thuế TNCN (VND/tháng)
  TAX_DEDUCTION: {
    PERSONAL: 11000000,    // Bản thân: 11 triệu
    DEPENDENT: 4400000     // Mỗi người phụ thuộc: 4.4 triệu
  },

  // Mức lương tối thiểu vùng (VND/tháng)
  MIN_WAGE_REGIONS: {
    1: { name: "Vùng I (Hà Nội, TP.HCM, Hải Phòng, Bình Dương, Đồng Nai...)", monthly: 4960000, hourly: 23800 },
    2: { name: "Vùng II (Đà Nẵng, Cần Thơ, Nha Trang, Huế, Vũng Tàu...)", monthly: 4410000, hourly: 21200 },
    3: { name: "Vùng III (Các TP/Thị xã trực thuộc tỉnh còn lại...)", monthly: 3860000, hourly: 18600 },
    4: { name: "Vùng IV (Các địa bàn còn lại)", monthly: 3450000, hourly: 16600 }
  },

  // Mức lương cơ sở (VND/tháng)
  BASE_SALARY: 2340000, // Cập nhật mức 2.34 triệu từ 01/07/2024

  // Tỷ lệ trích đóng bảo hiểm đối với Người Lao Động (NLĐ)
  EMPLOYEE_RATES: {
    BHXH: 0.08,   // 8%
    BHYT: 0.015,  // 1.5%
    BHTN: 0.01,   // 1%
    TOTAL: 0.105  // 10.5%
  },

  // Tỷ lệ trích đóng bảo hiểm đối với Doanh Nghiệp (DN)
  EMPLOYER_RATES: {
    BHXH: 0.14,        // 14% Hưu trí - Tử tuất
    BHTNLD_BNN: 0.005, // 0.5% Tai nạn LĐ - Bệnh nghề nghiệp
    BHYT: 0.03,        // 3%
    BHTN: 0.01,        // 1%
    CONG_DOAN: 0.02,   // 2% Kinh phí công đoàn
    TOTAL: 0.205       // 20.5% (+ 2% công đoàn = 22.5%)
  },

  // Mức trần đóng bảo hiểm
  MAX_INSURANCE: {
    // Trần BHXH & BHYT: Tối đa 20 lần mức lương cơ sở
    BHXH_BHYT_CAP: 20 * 2340000, // 46,800,000 VND
    // Trần BHTN: Tối đa 20 lần mức lương tối thiểu vùng tương ứng
    getBHTNCap: function(regionId) {
      const minWage = LEGAL_CONSTANTS.MIN_WAGE_REGIONS[regionId]?.monthly || 4960000;
      return 20 * minWage;
    }
  },

  // Biểu thuế lũy tiến từng phần Thuế TNCN
  PROGRESSIVE_TAX_BRACKETS: [
    { level: 1, max: 5000000, rate: 0.05, subtract: 0, label: "Đến 5 triệu" },
    { level: 2, max: 10000000, rate: 0.10, subtract: 250000, label: "Trên 5 đến 10 triệu" },
    { level: 3, max: 18000000, rate: 0.15, subtract: 750000, label: "Trên 10 đến 18 triệu" },
    { level: 4, max: 32000000, rate: 0.20, subtract: 1650000, label: "Trên 18 đến 32 triệu" },
    { level: 5, max: 52000000, rate: 0.25, subtract: 3250000, label: "Trên 32 đến 52 triệu" },
    { level: 6, max: 80000000, rate: 0.30, subtract: 5850000, label: "Trên 52 đến 80 triệu" },
    { level: 7, max: Infinity, rate: 0.35, subtract: 9850000, label: "Trên 80 triệu" }
  ],

  // Hệ số tính làm thêm giờ (OT)
  OT_RATES: {
    NORMAL_DAY: 1.5,
    WEEKEND: 2.0,
    HOLIDAY: 3.0,
    NIGHT_BONUS: 0.3
  },

  // Danh mục lịch nộp thuế định kỳ
  TAX_CALENDAR_EVENTS: [
    {
      period: "Hàng tháng (Hạn ngày 20)",
      title: "Tờ khai Thuế GTGT & Thuế TNCN tháng trước",
      desc: "Áp dụng cho doanh nghiệp kê khai thuế theo tháng. Hạn chót nộp tờ khai và tiền thuế phát sinh.",
      tag: "Hàng tháng",
      color: "blue"
    },
    {
      period: "Quý 1 (Hạn 30/04)",
      title: "Tờ khai Thuế GTGT, TNCN Quý 1 & Tạm nộp TNDN Quý 1",
      desc: "Nộp tờ khai thuế GTGT, TNCN Quý 1 cho DN kê khai theo quý. Tạm nộp thuế TNDN quý 1.",
      tag: "Quý 1",
      color: "emerald"
    },
    {
      period: "Quý 2 (Hạn 30/07)",
      title: "Tờ khai Thuế GTGT, TNCN Quý 2 & Tạm nộp TNDN Quý 2",
      desc: "Nộp tờ khai thuế Quý 2 cho DN kê khai theo quý. Tạm nộp thuế TNDN quý 2.",
      tag: "Quý 2",
      color: "emerald"
    },
    {
      period: "Quý 3 (Hạn 31/10)",
      title: "Tờ khai Thuế GTGT, TNCN Quý 3 & Tạm nộp TNDN Quý 3",
      desc: "Nộp tờ khai thuế Quý 3. Tạm nộp thuế TNDN quý 3 (Đảm bảo tạm nộp 4 quý tối thiểu 80% tổng thuế TNDN cả năm).",
      tag: "Quý 3",
      color: "emerald"
    },
    {
      period: "Quý 4 & Năm (Hạn 30/01 năm sau)",
      title: "Tờ khai Thuế GTGT, TNCN Quý 4 & Tạm nộp TNDN Quý 4",
      desc: "Nộp tờ khai thuế Quý 4 và tạm nộp tiền thuế TNDN quý 4.",
      tag: "Quý 4",
      color: "amber"
    },
    {
      period: "Quyết toán năm (Hạn 31/03 năm sau)",
      title: "Quyết toán Thuế TNCN, TNDN & Nộp Báo cáo Tài chính Năm",
      desc: "Thời hạn cuối cùng nộp Bộ Báo cáo tài chính năm, Quyết toán thuế TNDN và Quyết toán thuế TNCN.",
      tag: "Quan trọng",
      color: "rose"
    }
  ]
};
