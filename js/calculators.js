/**
 * MODULE TÍNH TOÁN KẾ TOÁN & NHÂN SỰ VIỆT NAM
 */

const Calculators = {
  /**
   * Định dạng tiền tệ VND
   */
  formatVND: function(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return "0 đ";
    return Math.round(amount).toLocaleString('vi-VN') + " đ";
  },

  /**
   * Tính Thuế TNCN lũy tiến từ Thu nhập tính thuế
   */
  calcTaxFromTaxableIncome: function(taxableIncome) {
    if (taxableIncome <= 0) {
      return { totalTax: 0, breakdown: [] };
    }

    let remaining = taxableIncome;
    let totalTax = 0;
    const breakdown = [];
    const brackets = [
      { max: 5000000, rate: 0.05, label: "Bậc 1 (Đến 5tr - 5%)" },
      { max: 5000000, rate: 0.10, label: "Bậc 2 (5tr đến 10tr - 10%)" },
      { max: 8000000, rate: 0.15, label: "Bậc 3 (10tr đến 18tr - 15%)" },
      { max: 14000000, rate: 0.20, label: "Bậc 4 (18tr đến 32tr - 20%)" },
      { max: 20000000, rate: 0.25, label: "Bậc 5 (32tr đến 52tr - 25%)" },
      { max: 28000000, rate: 0.30, label: "Bậc 6 (52tr đến 80tr - 30%)" },
      { max: Infinity, rate: 0.35, label: "Bậc 7 (Trên 80tr - 35%)" }
    ];

    for (let i = 0; i < brackets.length; i++) {
      const b = brackets[i];
      if (remaining > 0) {
        const taxableAmountInBracket = Math.min(remaining, b.max);
        const taxInBracket = taxableAmountInBracket * b.rate;
        totalTax += taxInBracket;
        breakdown.push({
          level: i + 1,
          label: b.label,
          amount: taxableAmountInBracket,
          rate: b.rate * 100,
          tax: taxInBracket
        });
        remaining -= taxableAmountInBracket;
      } else {
        break;
      }
    }

    return { totalTax, breakdown };
  },

  /**
   * Tính Lương GROSS sang NET
   */
  calcGrossToNet: function(grossSalary, regionId = 1, dependentsCount = 0, insuranceSalaryOption = "gross", customInsuranceSalary = 0) {
    grossSalary = Math.max(0, Number(grossSalary) || 0);
    dependentsCount = Math.max(0, Number(dependentsCount) || 0);

    // Xác định mức lương đóng bảo hiểm
    let insSalary = grossSalary;
    if (insuranceSalaryOption === "custom") {
      insSalary = Math.max(0, Number(customInsuranceSalary) || 0);
    } else if (insuranceSalaryOption === "min") {
      insSalary = LEGAL_CONSTANTS.MIN_WAGE_REGIONS[regionId]?.monthly || 4960000;
    }

    // Tính trần bảo hiểm
    const bhxhCap = LEGAL_CONSTANTS.MAX_INSURANCE.BHXH_BHYT_CAP;
    const bhtnCap = LEGAL_CONSTANTS.MAX_INSURANCE.getBHTNCap(regionId);

    const salaryForBHXH_BHYT = Math.min(insSalary, bhxhCap);
    const salaryForBHTN = Math.min(insSalary, bhtnCap);

    // Các khoản bảo hiểm NLĐ đóng
    const employeeBHXH = salaryForBHXH_BHYT * LEGAL_CONSTANTS.EMPLOYEE_RATES.BHXH;
    const employeeBHYT = salaryForBHXH_BHYT * LEGAL_CONSTANTS.EMPLOYEE_RATES.BHYT;
    const employeeBHTN = salaryForBHTN * LEGAL_CONSTANTS.EMPLOYEE_RATES.BHTN;
    const totalEmployeeInsurance = employeeBHXH + employeeBHYT + employeeBHTN;

    // Thu nhập trước thuế
    const incomeBeforeTax = grossSalary - totalEmployeeInsurance;

    // Các khoản giảm trừ gia cảnh
    const personalDeduction = LEGAL_CONSTANTS.TAX_DEDUCTION.PERSONAL;
    const dependentDeduction = dependentsCount * LEGAL_CONSTANTS.TAX_DEDUCTION.DEPENDENT;
    const totalDeductions = personalDeduction + dependentDeduction;

    // Thu nhập tính thuế (TNTT)
    const taxableIncome = Math.max(0, incomeBeforeTax - totalDeductions);

    // Tính thuế TNCN
    const taxResult = this.calcTaxFromTaxableIncome(taxableIncome);
    const pitTax = taxResult.totalTax;

    // Lương thực nhận (NET)
    const netSalary = incomeBeforeTax - pitTax;

    // Các khoản bảo hiểm Doanh nghiệp đóng (Chi phí người sử dụng LĐ)
    const employerBHXH = salaryForBHXH_BHYT * LEGAL_CONSTANTS.EMPLOYER_RATES.BHXH;
    const employerBHTNLD = salaryForBHXH_BHYT * LEGAL_CONSTANTS.EMPLOYER_RATES.BHTNLD_BNN;
    const employerBHYT = salaryForBHXH_BHYT * LEGAL_CONSTANTS.EMPLOYER_RATES.BHYT;
    const employerBHTN = salaryForBHTN * LEGAL_CONSTANTS.EMPLOYER_RATES.BHTN;
    const employerCongDoan = salaryForBHXH_BHYT * LEGAL_CONSTANTS.EMPLOYER_RATES.CONG_DOAN;
    const totalEmployerInsurance = employerBHXH + employerBHTNLD + employerBHYT + employerBHTN + employerCongDoan;

    // Tổng chi phí công ty chi trả cho 1 nhân sự
    const totalEmployerCost = grossSalary + totalEmployerInsurance;

    return {
      grossSalary,
      netSalary,
      insuranceSalary: insSalary,
      employee: {
        bhxh: employeeBHXH,
        bhyt: employeeBHYT,
        bhtn: employeeBHTN,
        totalInsurance: totalEmployeeInsurance
      },
      deductions: {
        personal: personalDeduction,
        dependents: dependentDeduction,
        dependentsCount,
        totalDeductions
      },
      incomeBeforeTax,
      taxableIncome,
      pitTax,
      taxBreakdown: taxResult.breakdown,
      employer: {
        bhxh: employerBHXH,
        bhtnld: employerBHTNLD,
        bhyt: employerBHYT,
        bhtn: employerBHTN,
        congDoan: employerCongDoan,
        totalInsurance: totalEmployerInsurance,
        totalCost: totalEmployerCost
      }
    };
  },

  /**
   * Tính Lương NET sang GROSS (Quy đổi ngược)
   */
  calcNetToGross: function(netSalary, regionId = 1, dependentsCount = 0, insuranceSalaryOption = "gross", customInsuranceSalary = 0) {
    netSalary = Math.max(0, Number(netSalary) || 0);
    dependentsCount = Math.max(0, Number(dependentsCount) || 0);

    const personalDeduction = LEGAL_CONSTANTS.TAX_DEDUCTION.PERSONAL;
    const dependentDeduction = dependentsCount * LEGAL_CONSTANTS.TAX_DEDUCTION.DEPENDENT;
    const totalDeductions = personalDeduction + dependentDeduction;

    // Nếu đóng bảo hiểm theo lương cố định
    if (insuranceSalaryOption === "custom" || insuranceSalaryOption === "min") {
      let insSalary = insuranceSalaryOption === "custom" ? Number(customInsuranceSalary) : LEGAL_CONSTANTS.MIN_WAGE_REGIONS[regionId]?.monthly;
      const salaryForBHXH = Math.min(insSalary, LEGAL_CONSTANTS.MAX_INSURANCE.BHXH_BHYT_CAP);
      const salaryForBHTN = Math.min(insSalary, LEGAL_CONSTANTS.MAX_INSURANCE.getBHTNCap(regionId));
      const insEmployee = (salaryForBHXH * (LEGAL_CONSTANTS.EMPLOYEE_RATES.BHXH + LEGAL_CONSTANTS.EMPLOYEE_RATES.BHYT)) + (salaryForBHTN * LEGAL_CONSTANTS.EMPLOYEE_RATES.BHTN);

      // Thu nhập quy đổi = Net
      const convertedIncome = netSalary - totalDeductions;
      let taxableIncome = 0;

      if (convertedIncome <= 0) {
        taxableIncome = 0;
      } else if (convertedIncome <= 4750000) {
        taxableIncome = convertedIncome / 0.95;
      } else if (convertedIncome <= 9250000) {
        taxableIncome = (convertedIncome - 250000) / 0.90;
      } else if (convertedIncome <= 16050000) {
        taxableIncome = (convertedIncome - 750000) / 0.85;
      } else if (convertedIncome <= 27250000) {
        taxableIncome = (convertedIncome - 1650000) / 0.80;
      } else if (convertedIncome <= 42250000) {
        taxableIncome = (convertedIncome - 3250000) / 0.75;
      } else if (convertedIncome <= 61850000) {
        taxableIncome = (convertedIncome - 5850000) / 0.70;
      } else {
        taxableIncome = (convertedIncome - 9850000) / 0.65;
      }

      const grossSalary = taxableIncome + totalDeductions + insEmployee;
      return this.calcGrossToNet(grossSalary, regionId, dependentsCount, insuranceSalaryOption, customInsuranceSalary);
    }

    // Tìm kiếm nhị phân (Binary Search) chính xác tuyệt đối cho trường hợp đóng bảo hiểm trên lương Gross
    let low = netSalary;
    let high = netSalary * 2 + 50000000;
    let estimatedGross = netSalary;

    for (let iter = 0; iter < 60; iter++) {
      const mid = (low + high) / 2;
      const res = this.calcGrossToNet(mid, regionId, dependentsCount, "gross", 0);
      if (Math.abs(res.netSalary - netSalary) < 0.5) {
        estimatedGross = mid;
        break;
      }
      if (res.netSalary < netSalary) {
        low = mid;
      } else {
        high = mid;
      }
      estimatedGross = mid;
    }

    return this.calcGrossToNet(estimatedGross, regionId, dependentsCount, "gross", 0);
  },

  /**
   * Tính Chế độ Thai sản
   */
  calcMaternity: function(avgSalary6m, leaveMonths = 6, childCount = 1, isCesarean = false, isTwins = false) {
    avgSalary6m = Math.max(0, Number(avgSalary6m) || 0);
    const baseSalary = LEGAL_CONSTANTS.BASE_SALARY;

    // 1. Tiền trợ cấp thai sản hàng tháng (100% mức bình quân 6 tháng liền kề)
    // Tối đa 6 tháng cho 1 con, mỗi con thêm từ con thứ 2 được nghỉ thêm 1 tháng
    let totalLeaveMonths = leaveMonths;
    if (childCount > 1) {
      totalLeaveMonths += (childCount - 1);
    }
    const maternitySalaryBenefit = avgSalary6m * totalLeaveMonths;

    // 2. Trợ cấp 1 lần khi sinh con (2 tháng lương cơ sở cho mỗi con)
    const lumpSumBenefit = 2 * baseSalary * childCount;

    // 3. Trợ cấp dưỡng sức sau sinh (nghỉ 5-10 ngày, mỗi ngày = 30% lương cơ sở)
    const recoveryDays = childCount > 1 ? 10 : (isCesarean ? 7 : 5);
    const recoveryBenefitPerDay = 0.3 * baseSalary;
    const recoveryBenefitTotal = recoveryDays * recoveryBenefitPerDay;

    // Tổng quyền lợi
    const totalBenefit = maternitySalaryBenefit + lumpSumBenefit + recoveryBenefitTotal;

    return {
      avgSalary6m,
      totalLeaveMonths,
      childCount,
      maternitySalaryBenefit,
      lumpSumBenefit,
      recoveryDays,
      recoveryBenefitTotal,
      totalBenefit
    };
  },

  /**
   * Tính Trợ cấp Thôi việc / Mất việc làm
   */
  calcSeverance: function(avgSalary6m, totalWorkYears, insuranceYears, type = "thoi_viec") {
    avgSalary6m = Math.max(0, Number(avgSalary6m) || 0);
    totalWorkYears = Math.max(0, Number(totalWorkYears) || 0);
    insuranceYears = Math.max(0, Number(insuranceYears) || 0);

    // Số năm được tính trợ cấp = Tổng thời gian làm việc - Thời gian đã tham gia BHTN
    let eligibleYears = Math.max(0, totalWorkYears - insuranceYears);

    // Làm tròn năm: dưới 6 tháng tính 1/2 năm, từ đủ 6 tháng tính 1 năm
    const integerPart = Math.floor(eligibleYears);
    const fractionPart = eligibleYears - integerPart;
    let roundedYears = integerPart;
    if (fractionPart > 0 && fractionPart <= 0.5) {
      roundedYears += 0.5;
    } else if (fractionPart > 0.5) {
      roundedYears += 1.0;
    }

    let ratePerYear = 0.5; // Thôi việc: mỗi năm 1/2 tháng lương
    let minBenefit = 0;

    if (type === "mat_viec") {
      ratePerYear = 1.0; // Mất việc làm: mỗi năm 1 tháng lương
      minBenefit = 2 * avgSalary6m; // Tối thiểu 2 tháng lương
    }

    let calculatedBenefit = roundedYears * ratePerYear * avgSalary6m;
    if (type === "mat_viec" && calculatedBenefit < minBenefit && eligibleYears > 0) {
      calculatedBenefit = minBenefit;
    }

    return {
      avgSalary6m,
      totalWorkYears,
      insuranceYears,
      eligibleYears,
      roundedYears,
      type,
      calculatedBenefit
    };
  },

  /**
   * Tính Bảo hiểm Thất nghiệp (BHTN)
   */
  calcUnemployment: function(avgSalary6m, totalMonthsPaid, regionId = 1) {
    avgSalary6m = Math.max(0, Number(avgSalary6m) || 0);
    totalMonthsPaid = Math.max(0, Number(totalMonthsPaid) || 0);

    if (totalMonthsPaid < 12) {
      return {
        eligible: false,
        message: "Chưa đủ điều kiện hưởng BHTN (yêu cầu đóng đủ từ 12 tháng trở lên trong vòng 24 tháng trước khi chấm dứt HĐLĐ)."
      };
    }

    // Mức hưởng hàng tháng: 60% mức bình quân tiền lương 6 tháng liền kề
    let monthlyBenefit = 0.6 * avgSalary6m;

    // Khống chế mức trần: không quá 5 lần mức lương tối thiểu vùng đối với DN
    const minWage = LEGAL_CONSTANTS.MIN_WAGE_REGIONS[regionId]?.monthly || 4960000;
    const maxAllowedMonthly = 5 * minWage;
    if (monthlyBenefit > maxAllowedMonthly) {
      monthlyBenefit = maxAllowedMonthly;
    }

    // Số tháng được hưởng: Đủ 12 - 36 tháng được 3 tháng hưởng; cứ thêm 12 tháng được thêm 1 tháng hưởng (tối đa 12 tháng)
    let benefitMonths = 3;
    if (totalMonthsPaid > 36) {
      const extraMonths = Math.floor((totalMonthsPaid - 36) / 12);
      benefitMonths += extraMonths;
    }
    benefitMonths = Math.min(12, benefitMonths);

    const totalBenefit = monthlyBenefit * benefitMonths;

    return {
      eligible: true,
      avgSalary6m,
      totalMonthsPaid,
      monthlyBenefit,
      maxAllowedMonthly,
      benefitMonths,
      totalBenefit
    };
  },

  /**
   * Tính tiền Làm thêm giờ (OT)
   */
  calcOvertime: function(baseHourlySalary, otHours = 0, dayType = "normal", isNight = false) {
    baseHourlySalary = Math.max(0, Number(baseHourlySalary) || 0);
    otHours = Math.max(0, Number(otHours) || 0);

    let rate = LEGAL_CONSTANTS.OT_RATES.NORMAL_DAY; // 150%
    let typeName = "Ngày làm việc bình thường (150%)";

    if (dayType === "weekend") {
      rate = LEGAL_CONSTANTS.OT_RATES.WEEKEND; // 200%
      typeName = "Ngày nghỉ hàng tuần (200%)";
    } else if (dayType === "holiday") {
      rate = LEGAL_CONSTANTS.OT_RATES.HOLIDAY; // 300%
      typeName = "Ngày nghỉ Lễ, Tết có hưởng lương (300%)";
    }

    // Nếu làm ban đêm (22h đến 6h sáng): Thêm 30% lương giờ ban ngày + 20% lương giờ OT tương ứng
    let nightBonusRate = 0;
    if (isNight) {
      nightBonusRate = 0.3 + (rate * 0.2); // Hệ số cộng thêm ca đêm
    }

    const totalRate = rate + nightBonusRate;
    const totalOTSalary = otHours * baseHourlySalary * totalRate;

    return {
      baseHourlySalary,
      otHours,
      dayType,
      typeName,
      isNight,
      rate,
      nightBonusRate,
      totalRate,
      totalOTSalary
    };
  },

  /**
   * Tính Phép năm và Tiền thanh toán ngày phép chưa nghỉ
   */
  calcAnnualLeave: function(monthsWorkedInYear, totalYearsAtCompany, usedDays, monthlySalary, standardWorkDays = 26) {
    monthsWorkedInYear = Math.min(12, Math.max(1, Number(monthsWorkedInYear) || 12));
    totalYearsAtCompany = Math.max(0, Number(totalYearsAtCompany) || 0);
    usedDays = Math.max(0, Number(usedDays) || 0);
    monthlySalary = Math.max(0, Number(monthlySalary) || 0);

    // Ngày phép cơ bản: 12 ngày/năm (làm việc đủ 12 tháng)
    let standardDays = 12;
    if (monthsWorkedInYear < 12) {
      standardDays = monthsWorkedInYear; // 1 tháng làm việc = 1 ngày phép
    }

    // Thâm niên: Cứ đủ 5 năm làm việc được cộng thêm 1 ngày phép
    const seniorityDays = Math.floor(totalYearsAtCompany / 5);
    const totalEntitledDays = standardDays + seniorityDays;

    // Số ngày phép còn tồn
    const remainingDays = Math.max(0, totalEntitledDays - usedDays);

    // Tiền thanh toán 1 ngày phép
    const salaryPerDay = monthlySalary / standardWorkDays;
    const totalPayout = remainingDays * salaryPerDay;

    return {
      monthsWorkedInYear,
      totalYearsAtCompany,
      seniorityDays,
      totalEntitledDays,
      usedDays,
      remainingDays,
      salaryPerDay,
      totalPayout
    };
  }
};
