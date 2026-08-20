/**
 * MAIN APP CONTROLLER - THACO AUTO SMART SALES QUOTE STUDIO
 * Tích hợp đọc dữ liệu báo giá động từ Firestore qua tham số URL ?quoteId=...
 */

const App = {
  state: {
    quoteId: null,
    carId: 'mazda-cx5',
    colorId: 'soul-red',
    provinceId: 'hcm',
    discount: 30000000,
    includePhysicalIns: true,
    includeServiceFee: true,
    customerName: 'Nguyễn Văn Anh',
    customerPhone: '0912.345.678',
    customerAddress: 'Quận 7, TP. Hồ Chí Minh',
    salesName: 'Trần Minh Quân',
    salesPhone: '0908.123.456',
    showroom: 'Showroom THACO AUTO Bình Tân',
    loanPercent: 80,
    loanYears: 8,
    interestRate: 7.5,
    selectedGifts: [...THACO_CARS_DATA.defaultGifts]
  },

  loanChart: null,

  init: async function() {
    this.bindDOMEvents();
    InteractiveViewer.init();

    // Setup global callback for color selection from viewer
    window.onSelectColorCallback = (colorId) => {
      this.state.colorId = colorId;
      this.updateQuotation();
    };

    // Check if URL has ?quoteId=...
    await this.checkUrlQuoteParam();

    // Initial render
    this.renderCarSelectOptions();
    this.renderProvinceOptions();
    this.renderGiftsChecklist();
    this.updateQuotation();
  },

  /**
   * Đọc Báo Giá Từ Firestore nếu có mã ?quoteId=... trên đường dẫn
   */
  checkUrlQuoteParam: async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const quoteId = urlParams.get('quoteId');

    if (quoteId && fbDb) {
      this.state.quoteId = quoteId;
      try {
        const doc = await fbDb.collection('quotations').doc(quoteId).get();
        if (doc.exists) {
          const q = doc.data();
          this.state.carId = q.carId || this.state.carId;
          this.state.colorId = q.colorId || this.state.colorId;
          this.state.provinceId = q.provinceId || this.state.provinceId;
          this.state.discount = q.discount || 0;
          this.state.customerName = q.customerName || this.state.customerName;
          this.state.customerPhone = q.customerPhone || this.state.customerPhone;
          this.state.salesName = q.salesName || this.state.salesName;
          this.state.salesPhone = q.salesPhone || this.state.salesPhone;
          this.state.showroom = q.showroom || this.state.showroom;

          // Cập nhật giao diện thông tin Sales
          const salesNameEl = document.getElementById('sales-consultant-name');
          const salesPhoneEl = document.getElementById('sales-consultant-phone');
          const custNameInput = document.getElementById('cust-name-input');
          const custPhoneInput = document.getElementById('cust-phone-input');
          const discountInput = document.getElementById('discount-input');

          if (salesNameEl) salesNameEl.textContent = this.state.salesName;
          if (salesPhoneEl) salesPhoneEl.textContent = this.state.salesPhone;
          if (custNameInput) custNameInput.value = this.state.customerName;
          if (custPhoneInput) custPhoneInput.value = this.state.customerPhone;
          if (discountInput) discountInput.value = this.state.discount.toLocaleString('vi-VN');

          // Đánh dấu khách đã mở xem báo giá lên Firestore
          if (q.status === 'sent') {
            fbDb.collection('quotations').doc(quoteId).update({ status: 'viewed' });
          }

          window.showToast(`Đang hiển thị báo giá [${quoteId}] dành riêng cho ${this.state.customerName}`);
        }
      } catch (err) {
        console.warn("Lỗi tải báo giá từ Firestore:", err);
      }
    }
  },

  bindDOMEvents: function() {
    // Car Model Selector
    const carModelSelect = document.getElementById('car-model-select');
    carModelSelect?.addEventListener('change', (e) => {
      this.state.carId = e.target.value;
      const car = THACO_CARS_DATA.models[this.state.carId];
      if (car) {
        this.state.colorId = car.colors[0].id;
        this.state.discount = car.defaultDiscount;
        const discountInput = document.getElementById('discount-input');
        if (discountInput) discountInput.value = this.state.discount.toLocaleString('vi-VN');
      }
      this.updateQuotation();
    });

    // Province Selector
    const provinceSelect = document.getElementById('province-select');
    provinceSelect?.addEventListener('change', (e) => {
      this.state.provinceId = e.target.value;
      this.updateQuotation();
    });

    // Discount Input
    const discountInput = document.getElementById('discount-input');
    discountInput?.addEventListener('input', (e) => {
      this.state.discount = Number(discountInput.value.replace(/\D/g, '')) || 0;
      discountInput.value = this.state.discount.toLocaleString('vi-VN');
      this.updateQuotation();
    });

    // Option Checkboxes
    document.getElementById('check-physical-ins')?.addEventListener('change', (e) => {
      this.state.includePhysicalIns = e.target.checked;
      this.updateQuotation();
    });

    document.getElementById('check-service-fee')?.addEventListener('change', (e) => {
      this.state.includeServiceFee = e.target.checked;
      this.updateQuotation();
    });

    // Customer Info Inputs
    document.getElementById('cust-name-input')?.addEventListener('input', (e) => {
      this.state.customerName = e.target.value || "Quý Khách Hàng";
      this.updateVietQR();
    });

    document.getElementById('cust-phone-input')?.addEventListener('input', (e) => {
      this.state.customerPhone = e.target.value || "";
      this.updateVietQR();
    });

    // Loan Sliders
    const loanPercentSlider = document.getElementById('slider-loan-percent');
    const loanYearsSlider = document.getElementById('slider-loan-years');
    const interestInput = document.getElementById('input-interest-rate');

    loanPercentSlider?.addEventListener('input', (e) => {
      this.state.loanPercent = Number(e.target.value);
      document.getElementById('val-loan-percent').textContent = `${this.state.loanPercent}%`;
      this.updateLoanCalculations();
    });

    loanYearsSlider?.addEventListener('input', (e) => {
      this.state.loanYears = Number(e.target.value);
      document.getElementById('val-loan-years').textContent = `${this.state.loanYears} năm (${this.state.loanYears * 12} tháng)`;
      this.updateLoanCalculations();
    });

    interestInput?.addEventListener('input', (e) => {
      this.state.interestRate = Number(interestInput.value) || 7.5;
      this.updateLoanCalculations();
    });

    // Action Buttons
    document.getElementById('btn-show-deposit-modal')?.addEventListener('click', () => {
      this.showDepositModal();
    });

    document.getElementById('btn-close-deposit')?.addEventListener('click', () => {
      document.getElementById('deposit-modal')?.classList.add('hidden');
    });

    document.getElementById('btn-confirm-deposit-paid')?.addEventListener('click', async () => {
      await this.celebrateDepositSuccess();
    });

    document.getElementById('btn-print-quote')?.addEventListener('click', () => {
      window.print();
    });
  },

  renderCarSelectOptions: function() {
    const select = document.getElementById('car-model-select');
    if (!select) return;

    select.innerHTML = Object.values(THACO_CARS_DATA.models).map(car => `
      <option value="${car.id}" ${car.id === this.state.carId ? 'selected' : ''}>
        [${car.brand}] ${car.name} - ${QuoteEngine.formatVND(car.listPrice)}
      </option>
    `).join('');
  },

  renderProvinceOptions: function() {
    const select = document.getElementById('province-select');
    if (!select) return;

    select.innerHTML = THACO_CARS_DATA.provinces.map(p => `
      <option value="${p.id}" ${p.id === this.state.provinceId ? 'selected' : ''}>
        ${p.name} (Trước bạ ${p.taxRate * 100}% - Biển số ${QuoteEngine.formatVND(p.plateFee)})
      </option>
    `).join('');
  },

  renderGiftsChecklist: function() {
    const container = document.getElementById('gifts-checklist-container');
    if (!container) return;

    container.innerHTML = this.state.selectedGifts.map((gift, idx) => `
      <label class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer hover:bg-blue-950/40 transition text-xs sm:text-sm">
        <div class="flex items-center gap-2.5">
          <input type="checkbox" data-idx="${idx}" ${gift.selected ? 'checked' : ''} class="gift-checkbox w-4 h-4 rounded text-blue-600 focus:ring-blue-500">
          <span class="font-medium text-slate-200">${gift.name}</span>
        </div>
        <span class="text-xs font-bold text-emerald-400 whitespace-nowrap">Trị giá ${QuoteEngine.formatVND(gift.value)}</span>
      </label>
    `).join('');

    container.querySelectorAll('.gift-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(cb.getAttribute('data-idx'));
        this.state.selectedGifts[idx].selected = e.target.checked;
        this.updateQuotationDetails();
      });
    });
  },

  /**
   * Cập nhật toàn bộ Báo giá
   */
  updateQuotation: function() {
    const quote = QuoteEngine.calcOnTheRoad({
      carId: this.state.carId,
      colorId: this.state.colorId,
      provinceId: this.state.provinceId,
      customDiscount: this.state.discount,
      includePhysicalIns: this.state.includePhysicalIns,
      includeServiceFee: this.state.includeServiceFee
    });

    window.currentCarData = quote.car;
    window.currentQuoteResult = quote;

    // Cập nhật giao diện hình ảnh xe tương tác
    InteractiveViewer.renderCarVisual(quote.car, quote.color);

    // Cập nhật các khối thông tin xe
    document.getElementById('car-display-title').textContent = quote.car.name;
    document.getElementById('car-display-segment').textContent = `${quote.car.segment} • ${quote.car.engine}`;
    document.getElementById('car-display-warranty').textContent = `Bảo hành chính hãng: ${quote.car.warranty}`;

    // Cập nhật giá bán & chi phí lăn bánh
    document.getElementById('val-list-price').textContent = QuoteEngine.formatVND(quote.actualListPrice);
    document.getElementById('val-discount-amount').textContent = `-${QuoteEngine.formatVND(quote.discount)}`;
    document.getElementById('val-invoice-price').textContent = QuoteEngine.formatVND(quote.invoicePrice);
    document.getElementById('val-total-registration-fees').textContent = QuoteEngine.formatVND(quote.fees.totalRegistrationFees);
    
    // Highlight Tổng Lăn Bánh
    document.getElementById('val-total-on-the-road').textContent = QuoteEngine.formatVND(quote.totalOnTheRoad);
    document.getElementById('val-total-on-the-road-words').textContent = quote.totalOnTheRoadWords;

    // Chi tiết từng dòng chi phí
    document.getElementById('fee-registration-tax').textContent = QuoteEngine.formatVND(quote.fees.registrationTax);
    document.getElementById('fee-plate').textContent = QuoteEngine.formatVND(quote.fees.plateFee);
    document.getElementById('fee-inspection').textContent = QuoteEngine.formatVND(quote.fees.inspectionFee);
    document.getElementById('fee-road-maintenance').textContent = QuoteEngine.formatVND(quote.fees.roadMaintenanceFee);
    document.getElementById('fee-tnds').textContent = QuoteEngine.formatVND(quote.fees.tndsFee);
    document.getElementById('fee-physical-ins').textContent = QuoteEngine.formatVND(quote.fees.physicalInsFee);
    document.getElementById('fee-service').textContent = QuoteEngine.formatVND(quote.fees.serviceFee);

    // Cập nhật phần tính toán trả góp ngân hàng
    this.updateLoanCalculations();

    // Cập nhật mã VietQR
    this.updateVietQR();

    // Cập nhật dữ liệu in ấn A4
    this.updatePrintPreview(quote);
  },

  updateQuotationDetails: function() {
    if (window.currentQuoteResult) {
      this.updatePrintPreview(window.currentQuoteResult);
    }
  },

  /**
   * Tính toán Trả góp ngân hàng và vẽ biểu đồ
   */
  updateLoanCalculations: function() {
    const quote = window.currentQuoteResult;
    if (!quote) return;

    const loanRes = QuoteEngine.calcInstallment(
      quote.totalOnTheRoad,
      quote.invoicePrice,
      this.state.loanPercent,
      this.state.loanYears,
      this.state.interestRate
    );

    window.currentLoanResult = loanRes;

    document.getElementById('loan-res-upfront').textContent = QuoteEngine.formatVND(loanRes.upfrontPayment);
    document.getElementById('loan-res-borrow-amount').textContent = QuoteEngine.formatVND(loanRes.loanAmount);
    document.getElementById('loan-res-first-month').textContent = QuoteEngine.formatVND(loanRes.firstMonthTotalPayment);
    document.getElementById('loan-res-last-month').textContent = QuoteEngine.formatVND(loanRes.lastMonthTotalPayment);

    // Vẽ biểu đồ tròn cơ cấu vốn
    this.renderLoanChart(loanRes.upfrontPayment, loanRes.loanAmount);
  },

  renderLoanChart: function(upfront, loan) {
    const ctx = document.getElementById('chart-loan-breakdown')?.getContext('2d');
    if (!ctx) return;

    if (this.loanChart) this.loanChart.destroy();

    this.loanChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Vốn tự có trả trước', 'Số tiền vay ngân hàng'],
        datasets: [{
          data: [upfront, loan],
          backgroundColor: ['#10b981', '#3b82f6'],
          borderWidth: 2,
          borderColor: '#0f172a'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ${context.label}: ${QuoteEngine.formatVND(context.raw)}`
            }
          }
        }
      }
    });
  },

  /**
   * Cập nhật mã VietQR
   */
  updateVietQR: function() {
    const quote = window.currentQuoteResult;
    if (!quote) return;

    const qrImg = document.getElementById('vietqr-image');
    const depositAmount = THACO_CARS_DATA.showroom.depositAmount;
    const qrUrl = QuoteEngine.getVietQRUrl(depositAmount, this.state.customerName, quote.car.name, this.state.customerPhone);

    if (qrImg) qrImg.src = qrUrl;

    document.getElementById('qr-deposit-amount').textContent = QuoteEngine.formatVND(depositAmount);
    document.getElementById('qr-bank-info').textContent = `${THACO_CARS_DATA.showroom.bankAccount} - ${THACO_CARS_DATA.showroom.bankName}`;
    document.getElementById('qr-account-holder').textContent = THACO_CARS_DATA.showroom.accountHolder;
  },

  showDepositModal: function() {
    const modal = document.getElementById('deposit-modal');
    modal?.classList.remove('hidden');
    this.updateVietQR();
  },

  /**
   * Hiệu ứng Pháo Hoa Chúc Mừng Chốt Cọc Thành Công & Đồng Bộ Lên Firestore
   */
  celebrateDepositSuccess: async function() {
    document.getElementById('deposit-modal')?.classList.add('hidden');

    // Kích hoạt pháo hoa
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 }
        });
      }, 300);
    }

    // Cập nhật trạng thái cọc lên Firestore nếu có quoteId
    if (this.state.quoteId && fbDb) {
      try {
        await fbDb.collection('quotations').doc(this.state.quoteId).update({
          status: 'deposit_received',
          depositedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.warn("Lỗi cập nhật cọc Firestore:", err);
      }
    }

    // Mở modal xác nhận chính thức
    const successModal = document.getElementById('deposit-success-modal');
    const quote = window.currentQuoteResult;

    if (successModal && quote) {
      document.getElementById('receipt-cust-name').textContent = this.state.customerName;
      document.getElementById('receipt-cust-phone').textContent = this.state.customerPhone;
      document.getElementById('receipt-car-name').textContent = `${quote.car.name} (${quote.color.name})`;
      document.getElementById('receipt-total-on-road').textContent = QuoteEngine.formatVND(quote.totalOnTheRoad);
      document.getElementById('receipt-deposit-amount').textContent = QuoteEngine.formatVND(THACO_CARS_DATA.showroom.depositAmount);
      document.getElementById('receipt-date').textContent = new Date().toLocaleDateString('vi-VN');

      successModal.classList.remove('hidden');
      document.getElementById('btn-close-receipt')?.addEventListener('click', () => {
        successModal.classList.add('hidden');
      });
    }
  },

  /**
   * Cập nhật Bản Báo Giá In Ấn Chuẩn A4
   */
  updatePrintPreview: function(quote) {
    const container = document.getElementById('print-quote-content');
    if (!container) return;

    const selectedGiftsList = this.state.selectedGifts.filter(g => g.selected);

    container.innerHTML = `
      <div class="border-b-2 border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-wider">THACO AUTO</h2>
          <p class="text-xs text-slate-600 font-medium">${this.state.showroom}</p>
          <p class="text-xs text-slate-500">Tư vấn bán hàng: ${this.state.salesName} - Hotline: ${this.state.salesPhone}</p>
        </div>
        <div class="text-right">
          <h3 class="text-lg font-bold text-blue-700 uppercase">BẢNG BÁO GIÁ Ô TÔ</h3>
          <p class="text-xs text-slate-500">Số: ${this.state.quoteId || 'BG-' + Date.now().toString().slice(-6)}/THACO</p>
          <p class="text-xs text-slate-500">Ngày lập: ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div class="my-4 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
        <div><strong>Kính gửi:</strong> ${this.state.customerName} - <strong>SĐT:</strong> ${this.state.customerPhone}</div>
        <div><strong>Địa chỉ:</strong> ${this.state.customerAddress}</div>
        <div><strong>Dòng xe quan tâm:</strong> <span class="text-blue-700 font-bold">${quote.car.name}</span> (Màu: ${quote.color.name})</div>
      </div>

      <table class="w-full text-xs text-left border-collapse border border-slate-300 my-4">
        <thead>
          <tr class="bg-slate-200 text-slate-800 font-bold">
            <th class="border border-slate-300 p-2 text-center w-12">STT</th>
            <th class="border border-slate-300 p-2">Hạng Mục Chi Phí</th>
            <th class="border border-slate-300 p-2 text-right">Số Tiền (VND)</th>
            <th class="border border-slate-300 p-2 text-center w-36">Ghi Chú</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-300 p-2 text-center font-bold">I</td>
            <td class="border border-slate-300 p-2 font-bold">GIÁ XE NIÊM YẾT (Bao gồm VAT)</td>
            <td class="border border-slate-300 p-2 text-right font-bold">${QuoteEngine.formatVND(quote.actualListPrice)}</td>
            <td class="border border-slate-300 p-2 text-center">Chính hãng</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 text-center font-bold">II</td>
            <td class="border border-slate-300 p-2 font-bold text-rose-600">ƯU ĐÃI GIẢM GIÁ THÁNG NÀY</td>
            <td class="border border-slate-300 p-2 text-right font-bold text-rose-600">-${QuoteEngine.formatVND(quote.discount)}</td>
            <td class="border border-slate-300 p-2 text-center text-rose-600">Khuyến mãi THACO</td>
          </tr>
          <tr class="bg-blue-50 font-bold">
            <td class="border border-slate-300 p-2 text-center">III</td>
            <td class="border border-slate-300 p-2">GIÁ BÁN SAU GIẢM GIÁ (XUẤT HÓA ĐƠN)</td>
            <td class="border border-slate-300 p-2 text-right text-blue-700">${QuoteEngine.formatVND(quote.invoicePrice)}</td>
            <td class="border border-slate-300 p-2 text-center">Chưa gồm lăn bánh</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 text-center font-bold">IV</td>
            <td class="border border-slate-300 p-2 font-bold" colspan="3">CÁC KHOẢN THUẾ & PHÍ LĂN BÁNH TẠI ${quote.province.name.toUpperCase()}</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 text-center">1</td>
            <td class="border border-slate-300 p-2">Lệ phí trước bạ (${quote.province.taxRate * 100}%)</td>
            <td class="border border-slate-300 p-2 text-right">${QuoteEngine.formatVND(quote.fees.registrationTax)}</td>
            <td class="border border-slate-300 p-2 text-center">Chi cục Thuế thu</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 text-center">2</td>
            <td class="border border-slate-300 p-2">Lệ phí cấp biển số xe</td>
            <td class="border border-slate-300 p-2 text-right">${QuoteEngine.formatVND(quote.fees.plateFee)}</td>
            <td class="border border-slate-300 p-2 text-center">CSGT cấp</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 text-center">3</td>
            <td class="border border-slate-300 p-2">Phí đăng kiểm + Bảo trì đường bộ (1 năm)</td>
            <td class="border border-slate-300 p-2 text-right">${QuoteEngine.formatVND(quote.fees.inspectionFee + quote.fees.roadMaintenanceFee)}</td>
            <td class="border border-slate-300 p-2 text-center">Trung tâm đăng kiểm</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 text-center">4</td>
            <td class="border border-slate-300 p-2">Bảo hiểm TNDS bắt buộc (1 năm)</td>
            <td class="border border-slate-300 p-2 text-right">${QuoteEngine.formatVND(quote.fees.tndsFee)}</td>
            <td class="border border-slate-300 p-2 text-center">Bảo hiểm chính hãng</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 text-center">5</td>
            <td class="border border-slate-300 p-2">Bảo hiểm thân vỏ vật chất 2 chiều (1.3%) + Phí dịch vụ</td>
            <td class="border border-slate-300 p-2 text-right">${QuoteEngine.formatVND(quote.fees.physicalInsFee + quote.fees.serviceFee)}</td>
            <td class="border border-slate-300 p-2 text-center">Bảo hiểm & Đăng ký</td>
          </tr>
          <tr class="bg-emerald-50 text-emerald-800 text-sm font-black">
            <td class="border border-slate-300 p-2 text-center font-bold">V</td>
            <td class="border border-slate-300 p-2 uppercase">TỔNG CHI PHÍ LĂN BÁNH TRỌN GÓI</td>
            <td class="border border-slate-300 p-2 text-right text-base text-emerald-700">${QuoteEngine.formatVND(quote.totalOnTheRoad)}</td>
            <td class="border border-slate-300 p-2 text-center">Giao xe tận nhà</td>
          </tr>
        </tbody>
      </table>

      <div class="my-4 text-xs">
        <p class="font-bold text-slate-800 uppercase mb-1">🎁 QUÀ TẶNG & PHỤ KIỆN KÈM THEO:</p>
        <ul class="list-disc pl-5 space-y-0.5 text-slate-600">
          ${selectedGiftsList.map(g => `<li>${g.name} (Trị giá ${QuoteEngine.formatVND(g.value)})</li>`).join('')}
        </ul>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-slate-300 text-xs text-center">
        <div>
          <p class="font-bold uppercase text-slate-800">ĐẠI DIỆN KHÁCH HÀNG</p>
          <p class="text-slate-400 mt-12">(Ký & Ghi rõ họ tên)</p>
        </div>
        <div>
          <p class="font-bold uppercase text-slate-800">ĐẠI DIỆN THACO AUTO</p>
          <p class="text-slate-400 mt-12">(Ký, đóng dấu & Chức danh)</p>
        </div>
      </div>
    `;
  }
};

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Toast notification helper
window.showToast = function(msg) {
  const toast = document.getElementById('toast-notification');
  const text = document.getElementById('toast-message');
  if (toast && text) {
    text.textContent = msg;
    toast.classList.remove('hidden', 'translate-y-10', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3500);
  }
};
