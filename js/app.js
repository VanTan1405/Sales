/**
 * APP LOGIC & UI CONTROLLER - VN ACCOUNTING & HR HUB
 */

// Global State
const state = {
  currentTab: 'gross-net',
  salaryMode: 'gross-to-net', // 'gross-to-net' or 'net-to-gross'
  insuranceOption: 'gross',   // 'gross', 'min', 'custom'
  region: 1,
  dependents: 0,
  grossOrNetSalary: 20000000,
  customInsuranceSalary: 5000000,
  history: []
};

// Charts instances
let salaryBreakdownChart = null;
let employerCostChart = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initGrossNetModule();
  initMaternityModule();
  initSeveranceModule();
  initOvertimeModule();
  initTaxCalendarModule();
  initTemplatesModule();
  initHistoryModule();

  // Trigger initial calculation
  calculateGrossNet();
});

/* =========================================================================
   THEME TOGGLE (DARK / LIGHT MODE)
   ========================================================================= */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = localStorage.getItem('vnhr_theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('vnhr_theme', isDark ? 'dark' : 'light');
      updateChartColors();
    });
  }
}

/* =========================================================================
   TAB NAVIGATION
   ========================================================================= */
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      state.currentTab = targetTab;

      // Update Nav Buttons
      navBtns.forEach(b => {
        b.classList.remove('tab-active', 'bg-blue-600', 'text-white');
        b.classList.add('text-slate-600', 'dark:text-slate-400');
      });
      btn.classList.add('tab-active');
      btn.classList.remove('text-slate-600', 'dark:text-slate-400');

      // Update Tab Panes
      tabPanes.forEach(pane => {
        if (pane.id === `tab-${targetTab}`) {
          pane.classList.remove('hidden');
        } else {
          pane.classList.add('hidden');
        }
      });

      // Resize charts if on gross-net tab
      if (targetTab === 'gross-net') {
        setTimeout(() => {
          if (salaryBreakdownChart) salaryBreakdownChart.resize();
          if (employerCostChart) employerCostChart.resize();
        }, 100);
      }
    });
  });
}

/* =========================================================================
   MODULE 1: GROSS - NET CALCULATOR & CHARTS
   ========================================================================= */
function initGrossNetModule() {
  // Mode toggles (Gross->Net vs Net->Gross)
  const modeGrossToNetBtn = document.getElementById('mode-gross-to-net');
  const modeNetToGrossBtn = document.getElementById('mode-net-to-gross');
  const salaryLabel = document.getElementById('salary-input-label');
  const salaryInput = document.getElementById('salary-input');
  const dependentsInput = document.getElementById('dependents-input');
  const regionSelect = document.getElementById('region-select');
  const insuranceGrossRadio = document.getElementById('ins-on-salary');
  const insuranceMinRadio = document.getElementById('ins-on-min');
  const insuranceCustomRadio = document.getElementById('ins-on-custom');
  const customInsContainer = document.getElementById('custom-ins-container');
  const customInsInput = document.getElementById('custom-ins-input');

  // Salary Mode Switches
  modeGrossToNetBtn?.addEventListener('click', () => {
    state.salaryMode = 'gross-to-net';
    modeGrossToNetBtn.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white shadow-sm';
    modeNetToGrossBtn.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200';
    salaryLabel.textContent = 'Mức lương GROSS (VND):';
    calculateGrossNet();
  });

  modeNetToGrossBtn?.addEventListener('click', () => {
    state.salaryMode = 'net-to-gross';
    modeNetToGrossBtn.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white shadow-sm';
    modeGrossToNetBtn.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200';
    salaryLabel.textContent = 'Mức lương NET mong muốn (VND):';
    calculateGrossNet();
  });

  // Insurance option radio switches
  const handleInsuranceOptionChange = () => {
    if (insuranceGrossRadio.checked) state.insuranceOption = 'gross';
    if (insuranceMinRadio.checked) state.insuranceOption = 'min';
    if (insuranceCustomRadio.checked) state.insuranceOption = 'custom';

    if (state.insuranceOption === 'custom') {
      customInsContainer?.classList.remove('hidden');
    } else {
      customInsContainer?.classList.add('hidden');
    }
    calculateGrossNet();
  };

  insuranceGrossRadio?.addEventListener('change', handleInsuranceOptionChange);
  insuranceMinRadio?.addEventListener('change', handleInsuranceOptionChange);
  insuranceCustomRadio?.addEventListener('change', handleInsuranceOptionChange);

  // Input bindings
  salaryInput?.addEventListener('input', () => {
    state.grossOrNetSalary = Number(salaryInput.value.replace(/\D/g, '')) || 0;
    salaryInput.value = Number(state.grossOrNetSalary).toLocaleString('vi-VN');
    calculateGrossNet();
  });

  customInsInput?.addEventListener('input', () => {
    state.customInsuranceSalary = Number(customInsInput.value.replace(/\D/g, '')) || 0;
    customInsInput.value = Number(state.customInsuranceSalary).toLocaleString('vi-VN');
    calculateGrossNet();
  });

  dependentsInput?.addEventListener('input', () => {
    state.dependents = Math.max(0, parseInt(dependentsInput.value) || 0);
    calculateGrossNet();
  });

  regionSelect?.addEventListener('change', () => {
    state.region = parseInt(regionSelect.value) || 1;
    calculateGrossNet();
  });

  // Quick preset buttons
  document.querySelectorAll('.salary-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-val'));
      state.grossOrNetSalary = val;
      salaryInput.value = val.toLocaleString('vi-VN');
      calculateGrossNet();
    });
  });

  // Print / Save Payslip buttons
  document.getElementById('btn-show-payslip')?.addEventListener('click', showPayslipModal);
  document.getElementById('btn-close-payslip')?.addEventListener('click', hidePayslipModal);
  document.getElementById('btn-print-payslip')?.addEventListener('click', () => window.print());
}

function calculateGrossNet() {
  let result;
  if (state.salaryMode === 'gross-to-net') {
    result = Calculators.calcGrossToNet(
      state.grossOrNetSalary,
      state.region,
      state.dependents,
      state.insuranceOption,
      state.customInsuranceSalary
    );
  } else {
    result = Calculators.calcNetToGross(
      state.grossOrNetSalary,
      state.region,
      state.dependents,
      state.insuranceOption,
      state.customInsuranceSalary
    );
  }

  // Update UI Elements
  document.getElementById('res-gross-salary').textContent = Calculators.formatVND(result.grossSalary);
  document.getElementById('res-net-salary').textContent = Calculators.formatVND(result.netSalary);
  document.getElementById('res-net-salary-badge').textContent = Calculators.formatVND(result.netSalary);
  document.getElementById('res-emp-bhxh').textContent = Calculators.formatVND(result.employee.bhxh);
  document.getElementById('res-emp-bhyt').textContent = Calculators.formatVND(result.employee.bhyt);
  document.getElementById('res-emp-bhtn').textContent = Calculators.formatVND(result.employee.bhtn);
  document.getElementById('res-emp-total-ins').textContent = Calculators.formatVND(result.employee.totalInsurance);
  document.getElementById('res-income-before-tax').textContent = Calculators.formatVND(result.incomeBeforeTax);
  document.getElementById('res-personal-deduction').textContent = Calculators.formatVND(result.deductions.personal);
  document.getElementById('res-dependent-deduction').textContent = Calculators.formatVND(result.deductions.dependents);
  document.getElementById('res-taxable-income').textContent = Calculators.formatVND(result.taxableIncome);
  document.getElementById('res-pit-tax').textContent = Calculators.formatVND(result.pitTax);
  document.getElementById('res-employer-total-cost').textContent = Calculators.formatVND(result.employer.totalCost);

  // Render Tax Brackets Breakdown Table
  renderTaxBreakdownTable(result.taxBreakdown);

  // Update Charts
  renderSalaryCharts(result);

  // Save to recent calculation history
  saveToHistory({
    type: 'Lương ' + (state.salaryMode === 'gross-to-net' ? 'Gross ➔ Net' : 'Net ➔ Gross'),
    input: Calculators.formatVND(state.grossOrNetSalary),
    gross: Calculators.formatVND(result.grossSalary),
    net: Calculators.formatVND(result.netSalary),
    tax: Calculators.formatVND(result.pitTax),
    date: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  });

  // Store current result for payslip generator
  window.lastGrossNetResult = result;
}

function renderTaxBreakdownTable(breakdown) {
  const container = document.getElementById('tax-breakdown-body');
  if (!container) return;

  if (!breakdown || breakdown.length === 0) {
    container.innerHTML = `<tr><td colspan="4" class="px-4 py-3 text-center text-sm text-slate-400">Không phát sinh thuế TNCN (Thu nhập tính thuế = 0 đ)</td></tr>`;
    return;
  }

  container.innerHTML = breakdown.map(item => `
    <tr class="border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
      <td class="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">${item.label}</td>
      <td class="px-4 py-2 text-right text-slate-600 dark:text-slate-400">${Calculators.formatVND(item.amount)}</td>
      <td class="px-4 py-2 text-center text-blue-600 dark:text-blue-400 font-semibold">${item.rate}%</td>
      <td class="px-4 py-2 text-right font-bold text-rose-600 dark:text-rose-400">${Calculators.formatVND(item.tax)}</td>
    </tr>
  `).join('');
}

function renderSalaryCharts(result) {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#475569';

  // 1. Doughnut Chart: Employee Income Structure
  const ctxBreakdown = document.getElementById('chart-salary-breakdown')?.getContext('2d');
  if (ctxBreakdown) {
    if (salaryBreakdownChart) salaryBreakdownChart.destroy();

    salaryBreakdownChart = new Chart(ctxBreakdown, {
      type: 'doughnut',
      data: {
        labels: ['Lương Thực Nhận (Net)', 'Bảo hiểm NLĐ đóng (10.5%)', 'Thuế TNCN'],
        datasets: [{
          data: [result.netSalary, result.employee.totalInsurance, result.pitTax],
          backgroundColor: ['#10b981', '#3b82f6', '#f43f5e'],
          borderWidth: 2,
          borderColor: isDark ? '#0f172a' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 }, boxWidth: 12 }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${Calculators.formatVND(context.raw)}`
            }
          }
        }
      }
    });
  }

  // 2. Bar Chart: Employer Total Cost vs Net Income
  const ctxEmployer = document.getElementById('chart-employer-cost')?.getContext('2d');
  if (ctxEmployer) {
    if (employerCostChart) employerCostChart.destroy();

    employerCostChart = new Chart(ctxEmployer, {
      type: 'bar',
      data: {
        labels: ['Người lao động thực nhận', 'Doanh nghiệp chi trả tổng cộng'],
        datasets: [{
          label: 'Số tiền (VND)',
          data: [result.netSalary, result.employer.totalCost],
          backgroundColor: ['#10b981', '#6366f1'],
          borderRadius: 8,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Số tiền: ${Calculators.formatVND(context.raw)}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: textColor,
              callback: (value) => (value / 1000000) + ' tr'
            },
            grid: { color: isDark ? '#1e293b' : '#f1f5f9' }
          },
          x: {
            ticks: { color: textColor, font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }
}

function updateChartColors() {
  if (window.lastGrossNetResult) {
    renderSalaryCharts(window.lastGrossNetResult);
  }
}

function showPayslipModal() {
  const res = window.lastGrossNetResult;
  if (!res) return;

  const modal = document.getElementById('payslip-modal');
  const content = document.getElementById('payslip-content');

  const today = new Date();
  const monthStr = `Tháng ${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

  content.innerHTML = `
    <div class="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
      <h2 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">PHIẾU LƯƠNG NHÂN VIÊN</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400">Kỳ lương: ${monthStr}</p>
    </div>

    <div class="grid grid-cols-2 gap-4 my-4 text-xs sm:text-sm">
      <div><span class="text-slate-500">Mức lương Gross:</span> <strong class="text-slate-800 dark:text-white">${Calculators.formatVND(res.grossSalary)}</strong></div>
      <div><span class="text-slate-500">Vùng áp dụng:</span> <strong class="text-slate-800 dark:text-white">Vùng ${state.region}</strong></div>
      <div><span class="text-slate-500">Người phụ thuộc:</span> <strong class="text-slate-800 dark:text-white">${res.deductions.dependentsCount} người</strong></div>
      <div><span class="text-slate-500">Lương đóng BH:</span> <strong class="text-slate-800 dark:text-white">${Calculators.formatVND(res.insuranceSalary)}</strong></div>
    </div>

    <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs sm:text-sm mb-4">
      <div class="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">I. CÁC KHOẢN TRỪ BẢO HIỂM (NLĐ ĐÓNG 10.5%)</div>
      <div class="p-3 space-y-1.5">
        <div class="flex justify-between"><span>BHXH (8%):</span> <span>${Calculators.formatVND(res.employee.bhxh)}</span></div>
        <div class="flex justify-between"><span>BHYT (1.5%):</span> <span>${Calculators.formatVND(res.employee.bhyt)}</span></div>
        <div class="flex justify-between"><span>BHTN (1%):</span> <span>${Calculators.formatVND(res.employee.bhtn)}</span></div>
        <div class="flex justify-between font-bold pt-1 border-t border-slate-100 dark:border-slate-700 text-blue-600">
          <span>Tổng tiền bảo hiểm:</span> <span>${Calculators.formatVND(res.employee.totalInsurance)}</span>
        </div>
      </div>
    </div>

    <div class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xs sm:text-sm mb-4">
      <div class="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">II. THUẾ THU NHẬP CÁ NHÂN (TNCN)</div>
      <div class="p-3 space-y-1.5">
        <div class="flex justify-between"><span>Thu nhập trước thuế:</span> <span>${Calculators.formatVND(res.incomeBeforeTax)}</span></div>
        <div class="flex justify-between"><span>Tổng giảm trừ gia cảnh:</span> <span>${Calculators.formatVND(res.deductions.totalDeductions)}</span></div>
        <div class="flex justify-between"><span>Thu nhập tính thuế:</span> <span>${Calculators.formatVND(res.taxableIncome)}</span></div>
        <div class="flex justify-between font-bold pt-1 border-t border-slate-100 dark:border-slate-700 text-rose-600">
          <span>Thuế TNCN khấu trừ:</span> <span>${Calculators.formatVND(res.pitTax)}</span>
        </div>
      </div>
    </div>

    <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex justify-between items-center">
      <div>
        <p class="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">LƯƠNG THỰC NHẬN (NET)</p>
        <p class="text-xs text-slate-500">Số tiền chuyển khoản vào tài khoản</p>
      </div>
      <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400">
        ${Calculators.formatVND(res.netSalary)}
      </div>
    </div>
  `;

  modal?.classList.remove('hidden');
}

function hidePayslipModal() {
  document.getElementById('payslip-modal')?.classList.add('hidden');
}

/* =========================================================================
   MODULE 2: MATERNITY & SOCIAL INSURANCE
   ========================================================================= */
function initMaternityModule() {
  const matSalaryInput = document.getElementById('mat-salary-input');
  const matMonthsInput = document.getElementById('mat-months-input');
  const matChildrenInput = document.getElementById('mat-children-input');
  const matCesareanCheck = document.getElementById('mat-cesarean-check');
  const calcBtn = document.getElementById('btn-calc-maternity');

  const doCalcMaternity = () => {
    const salary = Number(matSalaryInput.value.replace(/\D/g, '')) || 15000000;
    matSalaryInput.value = salary.toLocaleString('vi-VN');
    const months = parseInt(matMonthsInput.value) || 6;
    const children = parseInt(matChildrenInput.value) || 1;
    const isCesarean = matCesareanCheck.checked;

    const res = Calculators.calcMaternity(salary, months, children, isCesarean);

    document.getElementById('mat-res-salary-benefit').textContent = Calculators.formatVND(res.maternitySalaryBenefit);
    document.getElementById('mat-res-lumpsum').textContent = Calculators.formatVND(res.lumpSumBenefit);
    document.getElementById('mat-res-recovery').textContent = Calculators.formatVND(res.recoveryBenefitTotal);
    document.getElementById('mat-res-recovery-days').textContent = `(${res.recoveryDays} ngày nghỉ dưỡng sức)`;
    document.getElementById('mat-res-total').textContent = Calculators.formatVND(res.totalBenefit);
  };

  matSalaryInput?.addEventListener('input', doCalcMaternity);
  matMonthsInput?.addEventListener('input', doCalcMaternity);
  matChildrenInput?.addEventListener('input', doCalcMaternity);
  matCesareanCheck?.addEventListener('change', doCalcMaternity);
  calcBtn?.addEventListener('click', doCalcMaternity);

  doCalcMaternity();
}

/* =========================================================================
   MODULE 3: SEVERANCE & UNEMPLOYMENT
   ========================================================================= */
function initSeveranceModule() {
  // Severance Calculator
  const sevSalaryInput = document.getElementById('sev-salary-input');
  const sevTotalYearsInput = document.getElementById('sev-total-years-input');
  const sevInsYearsInput = document.getElementById('sev-ins-years-input');
  const sevTypeSelect = document.getElementById('sev-type-select');

  const doCalcSeverance = () => {
    const salary = Number(sevSalaryInput.value.replace(/\D/g, '')) || 15000000;
    sevSalaryInput.value = salary.toLocaleString('vi-VN');
    const totalYears = parseFloat(sevTotalYearsInput.value) || 0;
    const insYears = parseFloat(sevInsYearsInput.value) || 0;
    const type = sevTypeSelect.value;

    const res = Calculators.calcSeverance(salary, totalYears, insYears, type);

    document.getElementById('sev-res-eligible-years').textContent = `${res.eligibleYears} năm (Làm tròn: ${res.roundedYears} năm)`;
    document.getElementById('sev-res-total-benefit').textContent = Calculators.formatVND(res.calculatedBenefit);
  };

  sevSalaryInput?.addEventListener('input', doCalcSeverance);
  sevTotalYearsInput?.addEventListener('input', doCalcSeverance);
  sevInsYearsInput?.addEventListener('input', doCalcSeverance);
  sevTypeSelect?.addEventListener('change', doCalcSeverance);
  doCalcSeverance();

  // Unemployment Calculator (BHTN)
  const unempSalaryInput = document.getElementById('unemp-salary-input');
  const unempMonthsInput = document.getElementById('unemp-months-input');
  const unempRegionSelect = document.getElementById('unemp-region-select');

  const doCalcUnemployment = () => {
    const salary = Number(unempSalaryInput.value.replace(/\D/g, '')) || 15000000;
    unempSalaryInput.value = salary.toLocaleString('vi-VN');
    const months = parseInt(unempMonthsInput.value) || 24;
    const region = parseInt(unempRegionSelect.value) || 1;

    const res = Calculators.calcUnemployment(salary, months, region);

    if (res.eligible) {
      document.getElementById('unemp-res-monthly').textContent = Calculators.formatVND(res.monthlyBenefit);
      document.getElementById('unemp-res-months-count').textContent = `${res.benefitMonths} tháng hưởng`;
      document.getElementById('unemp-res-total').textContent = Calculators.formatVND(res.totalBenefit);
    } else {
      document.getElementById('unemp-res-monthly').textContent = "0 đ";
      document.getElementById('unemp-res-months-count').textContent = "0 tháng (Chưa đủ điều kiện)";
      document.getElementById('unemp-res-total').textContent = "0 đ";
    }
  };

  unempSalaryInput?.addEventListener('input', doCalcUnemployment);
  unempMonthsInput?.addEventListener('input', doCalcUnemployment);
  unempRegionSelect?.addEventListener('change', doCalcUnemployment);
  doCalcUnemployment();
}

/* =========================================================================
   MODULE 4: OVERTIME (OT) & ANNUAL LEAVE
   ========================================================================= */
function initOvertimeModule() {
  // Overtime
  const otBaseSalaryInput = document.getElementById('ot-base-salary-input');
  const otHoursInput = document.getElementById('ot-hours-input');
  const otDayTypeSelect = document.getElementById('ot-day-type');
  const otNightCheck = document.getElementById('ot-night-check');

  const doCalcOT = () => {
    const hourlySalary = Number(otBaseSalaryInput.value.replace(/\D/g, '')) || 100000;
    otBaseSalaryInput.value = hourlySalary.toLocaleString('vi-VN');
    const hours = parseFloat(otHoursInput.value) || 1;
    const dayType = otDayTypeSelect.value;
    const isNight = otNightCheck.checked;

    const res = Calculators.calcOvertime(hourlySalary, hours, dayType, isNight);

    document.getElementById('ot-res-rate').textContent = `${Math.round(res.totalRate * 100)}%`;
    document.getElementById('ot-res-total-salary').textContent = Calculators.formatVND(res.totalOTSalary);
  };

  otBaseSalaryInput?.addEventListener('input', doCalcOT);
  otHoursInput?.addEventListener('input', doCalcOT);
  otDayTypeSelect?.addEventListener('change', doCalcOT);
  otNightCheck?.addEventListener('change', doCalcOT);
  doCalcOT();

  // Annual Leave (Phép năm)
  const leaveMonthsInput = document.getElementById('leave-months-input');
  const leaveYearsInput = document.getElementById('leave-years-input');
  const leaveUsedInput = document.getElementById('leave-used-input');
  const leaveSalaryInput = document.getElementById('leave-salary-input');

  const doCalcLeave = () => {
    const salary = Number(leaveSalaryInput.value.replace(/\D/g, '')) || 20000000;
    leaveSalaryInput.value = salary.toLocaleString('vi-VN');
    const months = parseInt(leaveMonthsInput.value) || 12;
    const years = parseInt(leaveYearsInput.value) || 0;
    const used = parseInt(leaveUsedInput.value) || 0;

    const res = Calculators.calcAnnualLeave(months, years, used, salary);

    document.getElementById('leave-res-total-entitled').textContent = `${res.totalEntitledDays} ngày (Cơ bản: 12 + Thâm niên: ${res.seniorityDays})`;
    document.getElementById('leave-res-remaining').textContent = `${res.remainingDays} ngày`;
    document.getElementById('leave-res-payout').textContent = Calculators.formatVND(res.totalPayout);
  };

  leaveMonthsInput?.addEventListener('input', doCalcLeave);
  leaveYearsInput?.addEventListener('input', doCalcLeave);
  leaveUsedInput?.addEventListener('input', doCalcLeave);
  leaveSalaryInput?.addEventListener('input', doCalcLeave);
  doCalcLeave();
}

/* =========================================================================
   MODULE 5: TAX CALENDAR
   ========================================================================= */
function initTaxCalendarModule() {
  const container = document.getElementById('tax-calendar-container');
  if (!container) return;

  container.innerHTML = LEGAL_CONSTANTS.TAX_CALENDAR_EVENTS.map(event => {
    const colorClasses = {
      blue: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400',
      emerald: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
      amber: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
      rose: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'
    }[event.color] || 'border-slate-400 bg-slate-50 text-slate-700';

    return `
      <div class="p-4 rounded-xl border-l-4 ${colorClasses} shadow-sm transition hover:shadow-md">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 dark:bg-slate-800 shadow-sm">${event.period}</span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${event.tag}</span>
        </div>
        <h3 class="font-bold text-slate-900 dark:text-white text-base mt-1">${event.title}</h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">${event.desc}</p>
      </div>
    `;
  }).join('');
}

/* =========================================================================
   MODULE 6: TEMPLATES HUB
   ========================================================================= */
function initTemplatesModule() {
  const container = document.getElementById('templates-grid');
  const searchInput = document.getElementById('template-search');
  const previewModal = document.getElementById('template-modal');
  const previewTitle = document.getElementById('template-modal-title');
  const previewContent = document.getElementById('template-modal-content');
  const btnClose = document.getElementById('btn-close-template');
  const btnCopy = document.getElementById('btn-copy-template');
  const btnDownload = document.getElementById('btn-download-template');

  let currentTemplate = null;

  const renderTemplates = (filterText = '') => {
    if (!container) return;
    const filtered = HR_TEMPLATES.filter(t => 
      t.title.toLowerCase().includes(filterText.toLowerCase()) ||
      t.category.toLowerCase().includes(filterText.toLowerCase()) ||
      t.desc.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center py-10 text-slate-400">Không tìm thấy biểu mẫu phù hợp.</div>`;
      return;
    }

    container.innerHTML = filtered.map(t => `
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition flex flex-col justify-between group">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">${t.category}</span>
          </div>
          <h3 class="font-bold text-slate-800 dark:text-white text-base group-hover:text-blue-600 transition">${t.title}</h3>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">${t.desc}</p>
        </div>
        <button data-id="${t.id}" class="btn-view-template mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          Xem & Tải Biểu Mẫu
        </button>
      </div>
    `).join('');

    // Attach click handlers
    document.querySelectorAll('.btn-view-template').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const t = HR_TEMPLATES.find(x => x.id === id);
        if (t) {
          currentTemplate = t;
          previewTitle.textContent = t.title;
          previewContent.textContent = t.content;
          previewModal?.classList.remove('hidden');
        }
      });
    });
  };

  searchInput?.addEventListener('input', (e) => {
    renderTemplates(e.target.value);
  });

  btnClose?.addEventListener('click', () => previewModal?.classList.add('hidden'));

  btnCopy?.addEventListener('click', () => {
    if (currentTemplate) {
      navigator.clipboard.writeText(currentTemplate.content);
      showToast("Đã sao chép nội dung biểu mẫu vào clipboard!");
    }
  });

  btnDownload?.addEventListener('click', () => {
    if (currentTemplate) {
      const blob = new Blob([currentTemplate.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTemplate.id}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Đã tải xuống tệp biểu mẫu!");
    }
  });

  renderTemplates();
}

/* =========================================================================
   HISTORY & TOAST
   ========================================================================= */
function saveToHistory(item) {
  state.history.unshift(item);
  if (state.history.length > 5) state.history.pop();
  renderHistory();
}

function initHistoryModule() {
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;

  if (state.history.length === 0) {
    container.innerHTML = `<div class="text-xs text-slate-400 text-center py-2">Chưa có lịch sử tính toán.</div>`;
    return;
  }

  container.innerHTML = state.history.map(item => `
    <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
      <div>
        <div class="font-semibold text-slate-700 dark:text-slate-300">${item.type}</div>
        <div class="text-slate-400">${item.date} - Input: ${item.input}</div>
      </div>
      <div class="text-right">
        <div class="font-bold text-emerald-600 dark:text-emerald-400">Net: ${item.net}</div>
        <div class="text-slate-400">Thuế: ${item.tax}</div>
      </div>
    </div>
  `).join('');
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const text = document.getElementById('toast-message');
  if (toast && text) {
    text.textContent = message;
    toast.classList.remove('hidden', 'translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
  }
}
