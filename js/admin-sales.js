/**
 * MODULE SALES ADMIN (ADMIN THƯỜNG)
 * Quản lý dòng xe, màu sơn, album ảnh thật, tạo báo giá và theo dõi đơn cọc khách hàng
 */

const SalesAdminModule = {
  carsList: [],
  myQuotes: [],

  init: function() {
    this.bindEvents();
    this.loadCarsList();
    this.loadMyQuotations();
  },

  bindEvents: function() {
    // Form thêm/sửa xe
    const carForm = document.getElementById('sales-car-form');
    carForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveCar();
    });

    // Mở modal thêm xe
    document.getElementById('btn-open-add-car')?.addEventListener('click', () => {
      this.openCarModal();
    });

    document.getElementById('btn-close-car-modal')?.addEventListener('click', () => {
      document.getElementById('car-edit-modal')?.classList.add('hidden');
    });

    // Form tạo báo giá cho khách
    const quoteForm = document.getElementById('sales-create-quote-form');
    quoteForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.createQuotation();
    });

    // Form upload ảnh thật tại bãi
    const realPhotoForm = document.getElementById('sales-real-photo-form');
    realPhotoForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveRealPhoto();
    });
  },

  /**
   * Tải danh mục xe từ Firestore
   */
  loadCarsList: function() {
    if (!fbDb) return;

    fbDb.collection('cars').onSnapshot((snapshot) => {
      this.carsList = [];
      snapshot.forEach(doc => {
        this.carsList.push({ id: doc.id, ...doc.data() });
      });
      this.renderCarsTable();
      this.populateQuoteCarSelect();
    });
  },

  renderCarsTable: function() {
    const tbody = document.getElementById('sales-cars-table-body');
    if (!tbody) return;

    if (this.carsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">Chưa có dòng xe nào trong hệ thống.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.carsList.map(car => `
      <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition text-xs sm:text-sm">
        <td class="px-4 py-3 font-bold text-white flex items-center gap-3">
          <div class="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
            <img src="${car.colors && car.colors[0] ? car.colors[0].imageExterior : 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80'}" class="w-full h-full object-cover">
          </div>
          <div>
            <span class="text-xs font-bold text-blue-400 block">[${car.brand || 'THACO'}]</span>
            <span class="font-bold">${car.name}</span>
          </div>
        </td>
        <td class="px-4 py-3 text-slate-300 font-semibold text-emerald-400">${QuoteEngine.formatVND(car.listPrice)}</td>
        <td class="px-4 py-3 text-slate-400">${car.segment || '-'}</td>
        <td class="px-4 py-3">
          <div class="flex gap-1">
            ${(car.colors || []).map(c => `<span class="w-4 h-4 rounded-full border border-slate-600 shadow-sm" style="background-color: ${c.hex};" title="${c.name}"></span>`).join('')}
          </div>
        </td>
        <td class="px-4 py-3 text-right space-x-2 whitespace-nowrap">
          <button onclick="SalesAdminModule.openCarModal('${car.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-900 text-blue-400 text-xs font-bold transition border border-slate-700">
            <i class="fa-solid fa-pen-to-square mr-1"></i>Sửa
          </button>
          <button onclick="SalesAdminModule.deleteCar('${car.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs font-bold transition border border-slate-700">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  openCarModal: function(carId = null) {
    const modal = document.getElementById('car-edit-modal');
    const title = document.getElementById('car-modal-title');
    const form = document.getElementById('sales-car-form');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('car-edit-id').value = carId || '';

    if (carId) {
      const car = this.carsList.find(c => c.id === carId);
      if (car) {
        title.textContent = `Chỉnh sửa dòng xe: ${car.name}`;
        document.getElementById('car-form-brand').value = car.brand || 'Mazda';
        document.getElementById('car-form-name').value = car.name || '';
        document.getElementById('car-form-segment').value = car.segment || '';
        document.getElementById('car-form-price').value = (car.listPrice || 0).toLocaleString('vi-VN');
        document.getElementById('car-form-discount').value = (car.defaultDiscount || 0).toLocaleString('vi-VN');
        document.getElementById('car-form-engine').value = car.engine || '';
        document.getElementById('car-form-seats').value = car.seats || 5;
        document.getElementById('car-form-warranty').value = car.warranty || '5 năm hoặc 150.000 km';
      }
    } else {
      title.textContent = "Thêm Dòng Xe Mới Vào Hệ Thống";
    }

    modal.classList.remove('hidden');
  },

  saveCar: async function() {
    if (!fbDb) return;
    try {
      const carId = document.getElementById('car-edit-id').value || `car-${Date.now()}`;
      const listPrice = Number(document.getElementById('car-form-price').value.replace(/\D/g, '')) || 800000000;
      const discount = Number(document.getElementById('car-form-discount').value.replace(/\D/g, '')) || 0;

      const existing = this.carsList.find(c => c.id === carId);

      const carData = {
        id: carId,
        brand: document.getElementById('car-form-brand').value,
        name: document.getElementById('car-form-name').value,
        segment: document.getElementById('car-form-segment').value,
        listPrice: listPrice,
        defaultDiscount: discount,
        engine: document.getElementById('car-form-engine').value,
        seats: Number(document.getElementById('car-form-seats').value) || 5,
        warranty: document.getElementById('car-form-warranty').value,
        colors: existing ? existing.colors : [
          { id: "red", name: "Đỏ Pha Lê", hex: "#b31010", imageExterior: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80", extraFee: 8000000 },
          { id: "white", name: "Trắng Ngọc Trai", hex: "#f3f4f6", imageExterior: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80", extraFee: 4000000 }
        ],
        imageInterior: existing ? existing.imageInterior : "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
        hotspots: existing ? existing.hotspots : [],
        realPhotos: existing ? existing.realPhotos : [],
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await fbDb.collection('cars').doc(carId).set(carData, { merge: true });
      document.getElementById('car-edit-modal')?.classList.add('hidden');
      window.showToast("Đã lưu thông tin dòng xe thành công!");
    } catch (err) {
      alert("Lỗi lưu xe: " + err.message);
    }
  },

  deleteCar: async function(carId) {
    if (!fbDb) return;
    if (!confirm("Bạn có chắc chắn muốn xóa dòng xe này?")) return;
    try {
      await fbDb.collection('cars').doc(carId).delete();
      window.showToast("Đã xóa dòng xe khỏi hệ thống!");
    } catch (err) {
      alert("Lỗi xóa: " + err.message);
    }
  },

  /**
   * Tạo Báo Giá Mới Cho Khách & Sinh Link Chia Sẻ
   */
  populateQuoteCarSelect: function() {
    const select = document.getElementById('quote-form-car-select');
    if (!select) return;

    select.innerHTML = this.carsList.map(c => `
      <option value="${c.id}">[${c.brand}] ${c.name} - ${QuoteEngine.formatVND(c.listPrice)}</option>
    `).join('');
  },

  createQuotation: async function() {
    if (!fbDb) return;
    try {
      const carId = document.getElementById('quote-form-car-select').value;
      const car = this.carsList.find(c => c.id === carId) || this.carsList[0];
      const customerName = document.getElementById('quote-form-cust-name').value;
      const customerPhone = document.getElementById('quote-form-cust-phone').value;
      const provinceId = document.getElementById('quote-form-province').value;
      const discount = Number(document.getElementById('quote-form-discount').value.replace(/\D/g, '')) || 0;

      const calcRes = QuoteEngine.calcOnTheRoad({
        carId,
        colorId: car.colors[0]?.id || 'soul-red',
        provinceId,
        customDiscount: discount
      });

      const quoteId = `BG-${Date.now().toString().slice(-6)}`;
      const user = AuthManager.userProfile;

      const quoteData = {
        quoteId,
        createdBySalesUid: user ? user.uid : 'sales',
        salesName: user ? user.displayName : 'Chuyên Viên Tư Vấn',
        salesPhone: user ? user.phone : '0908.123.456',
        showroom: user ? user.showroom : 'THACO AUTO Showroom',
        customerName,
        customerPhone,
        carId,
        carName: car.name,
        colorId: car.colors[0]?.id || 'soul-red',
        provinceId,
        discount,
        listPrice: calcRes.actualListPrice,
        invoicePrice: calcRes.invoicePrice,
        totalOnTheRoad: calcRes.totalOnTheRoad,
        status: 'sent', // 'sent', 'viewed', 'deposit_received'
        depositAmount: 20000000,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await fbDb.collection('quotations').doc(quoteId).set(quoteData);

      // Sinh URL báo giá trực tuyến
      const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
      const shareUrl = `${baseUrl}?quoteId=${quoteId}`;

      this.showShareQuoteModal(quoteId, shareUrl, customerName, car.name, calcRes.totalOnTheRoad);
      window.showToast("Đã tạo báo giá thành công!");
    } catch (err) {
      alert("Lỗi tạo báo giá: " + err.message);
    }
  },

  showShareQuoteModal: function(quoteId, shareUrl, customerName, carName, total) {
    const modal = document.getElementById('share-quote-modal');
    if (!modal) return;

    document.getElementById('share-quote-id').textContent = quoteId;
    document.getElementById('share-quote-customer').textContent = customerName;
    document.getElementById('share-quote-car').textContent = carName;
    document.getElementById('share-quote-total').textContent = QuoteEngine.formatVND(total);
    
    const urlInput = document.getElementById('share-quote-url-input');
    if (urlInput) urlInput.value = shareUrl;

    document.getElementById('btn-copy-quote-url').onclick = () => {
      navigator.clipboard.writeText(shareUrl);
      window.showToast("Đã copy link báo giá vào clipboard để gửi Zalo cho khách!");
    };

    document.getElementById('btn-open-quote-tab').onclick = () => {
      window.open(shareUrl, '_blank');
    };

    modal.classList.remove('hidden');
    document.getElementById('btn-close-share-modal').onclick = () => modal.classList.add('hidden');
  },

  /**
   * Tải danh sách các báo giá của Sales
   */
  loadMyQuotations: function() {
    if (!fbDb) return;

    fbDb.collection('quotations').orderBy('createdAt', 'desc').limit(20).onSnapshot((snapshot) => {
      this.myQuotes = [];
      snapshot.forEach(doc => {
        this.myQuotes.push({ id: doc.id, ...doc.data() });
      });
      this.renderMyQuotesTable();
    });
  },

  renderMyQuotesTable: function() {
    const tbody = document.getElementById('sales-quotes-table-body');
    if (!tbody) return;

    if (this.myQuotes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-slate-500">Bạn chưa tạo báo giá nào.</td></tr>`;
      return;
    }

    const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');

    tbody.innerHTML = this.myQuotes.map(q => {
      const isDeposited = q.status === 'deposit_received' || q.status === 'completed';
      const statusBadge = isDeposited
        ? '<span class="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"><i class="fa-solid fa-check mr-1"></i>Đã Cọc 20Tr</span>'
        : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Đã Gửi Link</span>';

      const link = `${baseUrl}?quoteId=${q.quoteId || q.id}`;

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition text-xs">
          <td class="px-4 py-3 font-bold text-white">${q.quoteId || q.id}</td>
          <td class="px-4 py-3">
            <strong class="text-white block">${q.customerName || 'Khách hàng'}</strong>
            <span class="text-slate-400">${q.customerPhone || '-'}</span>
          </td>
          <td class="px-4 py-3 font-semibold text-blue-400">${q.carName}</td>
          <td class="px-4 py-3 font-bold text-white">${QuoteEngine.formatVND(q.totalOnTheRoad)}</td>
          <td class="px-4 py-3">${statusBadge}</td>
          <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
            <button onclick="navigator.clipboard.writeText('${link}'); window.showToast('Đã copy link gửi khách!');" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-900 text-blue-400 font-bold transition border border-slate-700" title="Copy Link Gửi Zalo">
              <i class="fa-solid fa-link mr-1"></i>Copy Link
            </button>
            <button onclick="window.open('${link}', '_blank')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition border border-slate-700" title="Xem Báo Giá">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Lưu ảnh xe thật chụp tại bãi
   */
  saveRealPhoto: async function() {
    if (!fbDb) return;
    try {
      const carId = document.getElementById('photo-car-select').value;
      const title = document.getElementById('photo-title-input').value;
      const category = document.getElementById('photo-category-input').value;
      const url = document.getElementById('photo-url-input').value;

      if (!url) {
        alert("Vui lòng nhập đường dẫn URL ảnh hoặc chọn file!");
        return;
      }

      const carRef = fbDb.collection('cars').doc(carId);
      const carDoc = await carRef.get();

      if (carDoc.exists) {
        const carData = carDoc.data();
        const photos = carData.realPhotos || [];
        photos.unshift({ title, category, desc: "Ảnh thật chụp tại bãi kho THACO", url });
        await carRef.update({ realPhotos: photos });
        window.showToast("Đã lưu ảnh chụp thật vào kho xe thành công!");
        document.getElementById('sales-real-photo-form').reset();
      }
    } catch (err) {
      alert("Lỗi lưu ảnh: " + err.message);
    }
  }
};
