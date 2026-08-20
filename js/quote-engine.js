/**
 * MODULE TÍNH TOÁN CHI PHÍ LĂN BÁNH, TRẢ GÓP & MÃ VIETQR
 */

const QuoteEngine = {
  /**
   * Định dạng tiền VND
   */
  formatVND: function(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return "0 đ";
    return Math.round(amount).toLocaleString('vi-VN') + " đ";
  },

  /**
   * Chuyển đổi số tiền thành chữ Tiếng Việt
   */
  numberToVietnameseWords: function(number) {
    if (number === 0) return "Không đồng";
    const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

    function readGroup(group) {
      let read = "";
      const hundred = Math.floor(group / 100);
      const ten = Math.floor((group % 100) / 10);
      const unit = group % 10;

      if (hundred > 0 || group > 0) {
        read += digits[hundred] + " trăm ";
      }
      if (ten > 1) {
        read += digits[ten] + " mươi ";
        if (unit === 1) read += "mốt ";
        else if (unit === 5) read += "lăm ";
        else if (unit > 0) read += digits[unit] + " ";
      } else if (ten === 1) {
        read += "mười ";
        if (unit === 5) read += "lăm ";
        else if (unit > 0) read += digits[unit] + " ";
      } else if (ten === 0 && unit > 0 && hundred > 0) {
        read += "lẻ " + digits[unit] + " ";
      } else if (ten === 0 && unit > 0 && hundred === 0) {
        read += digits[unit] + " ";
      }
      return read.trim();
    }

    let numStr = Math.round(number).toString();
    let groups = [];
    while (numStr.length > 0) {
      groups.push(parseInt(numStr.slice(-3)));
      numStr = numStr.slice(0, -3);
    }

    let result = "";
    for (let i = groups.length - 1; i >= 0; i--) {
      if (groups[i] > 0) {
        result += readGroup(groups[i]) + " " + units[i] + " ";
      }
    }

    result = result.trim() + " đồng";
    return result.charAt(0).toUpperCase() + result.slice(1);
  },

  /**
   * Lấy danh sách toàn bộ gói quà tặng cập nhật từ LocalStorage hoặc dữ liệu gốc
   */
  getAllGifts: function() {
    const saved = localStorage.getItem('thaco_custom_gifts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return typeof THACO_CARS_DATA !== 'undefined' ? JSON.parse(JSON.stringify(THACO_CARS_DATA.defaultGifts)) : [];
  },

  /**
   * Lấy danh sách toàn bộ xe cập nhật từ LocalStorage hoặc dữ liệu gốc
   */
  getAllCars: function() {
    const saved = localStorage.getItem('thaco_custom_cars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return typeof THACO_CARS_DATA !== 'undefined' ? Object.values(THACO_CARS_DATA.models) : [];
  },

  /**
   * Tìm dòng xe an toàn theo carId hoặc VehicleCode
   */
  getCar: function(carId) {
    const allCars = this.getAllCars();
    let car = allCars.find(c => (c.id === carId || c.VehicleCode === carId));
    if (!car && typeof THACO_CARS_DATA !== 'undefined' && THACO_CARS_DATA.models[carId]) {
      car = THACO_CARS_DATA.models[carId];
    }
    if (!car && allCars.length > 0) {
      car = allCars[0];
    }
    return car || {
      id: "mazda-cx5",
      name: "Mazda CX-5 2.0L Premium Active",
      listPrice: 829000000,
      segment: "C-SUV 5 Chỗ",
      engine: "SkyActiv-G 2.0L",
      warranty: "5 năm hoặc 150.000 km",
      colors: [{ id: "soul-red", name: "Đỏ Pha Lê", hex: "#b31010", extraFee: 8000000 }],
      realPhotos: []
    };
  },

  /**
   * Tính toán Toàn Bộ Chi Phí Lăn Bánh
   */
  calcOnTheRoad: function(params) {
    const {
      carId = "mazda-cx5",
      colorId = "soul-red",
      provinceId = "hcm",
      customDiscount = 0,
      includePhysicalIns = true,
      includeServiceFee = true
    } = params;

    const car = this.getCar(carId);
    const colors = car.colors && car.colors.length > 0 ? car.colors : [{ id: "soul-red", name: "Đỏ Pha Lê", hex: "#b31010", extraFee: 8000000 }];
    const color = colors.find(c => c.id === colorId) || colors[0];
    const province = THACO_CARS_DATA.provinces.find(p => p.id === provinceId) || THACO_CARS_DATA.provinces[0];

    // 1. Giá xe cơ bản
    const listPrice = car.listPrice;
    const colorExtraFee = color.extraFee || 0;
    const actualListPrice = listPrice + colorExtraFee;
    const discount = Math.max(0, Number(customDiscount) || 0);
    const invoicePrice = Math.max(0, actualListPrice - discount); // Giá xuất hóa đơn sau giảm giá

    // 2. Chi phí lăn bánh bắt buộc theo luật
    const registrationTax = Math.round(actualListPrice * province.taxRate); // Thuế trước bạ tính trên giá niêm yết
    const plateFee = province.plateFee;
    const inspectionFee = THACO_CARS_DATA.mandatoryFees.inspection;
    const roadMaintenanceFee = THACO_CARS_DATA.mandatoryFees.roadMaintenance;
    const tndsFee = car.seats > 5 ? THACO_CARS_DATA.mandatoryFees.tnds7Seats : THACO_CARS_DATA.mandatoryFees.tnds5Seats;

    // 3. Chi phí tùy chọn
    const physicalInsFee = includePhysicalIns ? Math.round(invoicePrice * THACO_CARS_DATA.mandatoryFees.physicalInsuranceRate) : 0;
    const serviceFee = includeServiceFee ? THACO_CARS_DATA.mandatoryFees.serviceFee : 0;

    // Tổng chi phí đăng ký xe
    const totalRegistrationFees = registrationTax + plateFee + inspectionFee + roadMaintenanceFee + tndsFee + physicalInsFee + serviceFee;

    // Tổng tiền lăn bánh trọn gói
    const totalOnTheRoad = invoicePrice + totalRegistrationFees;

    return {
      car,
      color,
      province,
      listPrice,
      colorExtraFee,
      actualListPrice,
      discount,
      invoicePrice,
      fees: {
        registrationTax,
        plateFee,
        inspectionFee,
        roadMaintenanceFee,
        tndsFee,
        physicalInsFee,
        includePhysicalIns,
        serviceFee,
        includeServiceFee,
        totalRegistrationFees
      },
      totalOnTheRoad,
      totalOnTheRoadWords: this.numberToVietnameseWords(totalOnTheRoad)
    };
  },

  /**
   * Tính Toán Phương Án Mua Xe Trả Góp (Vay Ngân Hàng)
   */
  calcInstallment: function(totalOnTheRoad, invoicePrice, loanPercent = 80, loanYears = 8, interestRateYear = 7.5) {
    loanPercent = Math.min(85, Math.max(10, Number(loanPercent) || 80));
    loanYears = Math.min(8, Math.max(1, Number(loanYears) || 8));
    interestRateYear = Math.max(1, Number(interestRateYear) || 7.5);

    const totalMonths = loanYears * 12;
    const monthlyRate = (interestRateYear / 100) / 12;

    // Số tiền ngân hàng cho vay (tính trên giá xuất hóa đơn xe)
    const loanAmount = Math.round((invoicePrice * loanPercent) / 100);

    // Số tiền mặt tự có tối thiểu cần chuẩn bị (Bao gồm phần tiền xe còn lại + Toàn bộ chi phí lăn bánh)
    const upfrontPayment = totalOnTheRoad - loanAmount;

    // Tiền gốc trả hàng tháng (đều hàng tháng)
    const monthlyPrincipal = Math.round(loanAmount / totalMonths);

    // Tiền lãi tháng đầu tiên (cao nhất)
    const firstMonthInterest = Math.round(loanAmount * monthlyRate);

    // Tổng tiền gốc + lãi tháng đầu
    const firstMonthTotalPayment = monthlyPrincipal + firstMonthInterest;

    // Tiền lãi tháng cuối cùng (thấp nhất)
    const lastMonthInterest = Math.round(monthlyPrincipal * monthlyRate);
    const lastMonthTotalPayment = monthlyPrincipal + lastMonthInterest;

    // Ước tính tổng tiền lãi phải trả trong toàn bộ thời gian vay (dư nợ giảm dần)
    const totalInterestPaid = Math.round(((firstMonthInterest + lastMonthInterest) / 2) * totalMonths);

    // Tổng số tiền trả cả gốc + lãi ngân hàng
    const totalLoanCost = loanAmount + totalInterestPaid;

    return {
      loanPercent,
      loanYears,
      totalMonths,
      interestRateYear,
      loanAmount,
      upfrontPayment,
      monthlyPrincipal,
      firstMonthInterest,
      firstMonthTotalPayment,
      lastMonthTotalPayment,
      totalInterestPaid,
      totalLoanCost
    };
  },

  /**
   * Sinh URL Mã VietQR Chuyển Khoản Đặt Cọc
   */
  getVietQRUrl: function(amount = 20000000, customerName = "Khach Hang", carName = "Mazda CX-5", phone = "") {
    const bankCode = "970436"; // Vietcombank BIN code
    const accountNo = "0071001234567";
    const template = "compact2";
    const rawContent = `THACO ${customerName} cọc xe ${carName} ${phone}`.trim();
    const cleanContent = encodeURIComponent(rawContent.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
    const accountName = encodeURIComponent("CONG TY CO PHAN O TO TRUONG HAI");

    return `https://img.vietqr.io/image/${bankCode}-${accountNo}-${template}.png?amount=${amount}&addInfo=${cleanContent}&accountName=${accountName}`;
  }
};
