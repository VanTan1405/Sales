/**
 * MODULE SALES ADMIN (ADMIN THƯỜNG) - BULLETPROOF EDITION
 * Quản lý dòng xe, màu sơn, album ảnh thật, tạo báo giá và theo dõi đơn cọc khách hàng
 */

const SalesAdminModule = {
  // Khởi tạo danh sách xe mặc định từ THACO_CARS_DATA để không bao giờ bị rỗng
  carsList: typeof THACO_CARS_DATA !== 'undefined' ? Object.values(THACO_CARS_DATA.models) : [],
  myQuotes: [],

  init: function() {
    this.bindEvents();
    this.bindPhotoEvents();
    this.renderCarsTable();
    this.populateQuoteCarSelect();
    this.renderRealPhotosGallery();
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
   * Tải danh mục xe từ Firestore (nếu có)
   */
  loadCarsList: function() {
    if (typeof fbDb !== 'undefined' && fbDb) {
      try {
        fbDb.collection('cars').onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            if (list.length > 0) {
              this.carsList = list;
              this.renderCarsTable();
              this.populateQuoteCarSelect();
            }
          }
        }, (err) => {
          console.warn("Firestore cars snapshot notice:", err);
        });
      } catch (e) {}
    }
  },

  renderCarsTable: function() {
    const tbody = document.getElementById('sales-cars-table-body');
    if (!tbody) return;

    if (this.carsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">Chưa có dòng xe nào trong hệ thống.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.carsList.map(car => {
      const colors = car.colors || [{ name: "Mặc định", hex: "#b31010" }];
      const extImg = (colors[0] && colors[0].imageExterior) || car.imageExterior || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80';

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition text-xs sm:text-sm">
          <td class="px-4 py-3 font-bold text-white flex items-center gap-3">
            <div class="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
              <img src="${extImg}" class="w-full h-full object-cover">
            </div>
            <div>
              <span class="text-xs font-bold text-blue-400 block">[${car.brand || 'THACO'}]</span>
              <span class="font-bold">${car.name || car.ModelName || 'Dòng xe THACO'}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-300 font-semibold text-emerald-400">${QuoteEngine.formatVND(car.listPrice || car.ListPrice || 800000000)}</td>
          <td class="px-4 py-3 text-slate-400">${car.segment || car.Segment || '-'}</td>
          <td class="px-4 py-3">
            <div class="flex gap-1">
              ${colors.map(c => `<span class="w-4 h-4 rounded-full border border-slate-600 shadow-sm" style="background-color: ${c.hex};" title="${c.name}"></span>`).join('')}
            </div>
          </td>
          <td class="px-4 py-3 text-right space-x-2 whitespace-nowrap">
            <button onclick="SalesAdminModule.openCarModal('${car.id || car.VehicleCode}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-900 text-blue-400 text-xs font-bold transition border border-slate-700">
              <i class="fa-solid fa-pen-to-square mr-1"></i>Sửa
            </button>
            <button onclick="SalesAdminModule.deleteCar('${car.id || car.VehicleCode}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs font-bold transition border border-slate-700">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  editingCarColors: [],

  openCarModal: function(carId = null) {
    const modal = document.getElementById('car-edit-modal');
    const title = document.getElementById('car-modal-title');
    const form = document.getElementById('sales-car-form');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('car-edit-id').value = carId || '';

    if (carId) {
      const car = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));
      if (car) {
        title.textContent = `Chỉnh sửa dòng xe: ${car.name || car.ModelName}`;
        document.getElementById('car-form-brand').value = car.brand || car.Brand || 'Mazda';
        document.getElementById('car-form-name').value = car.name || car.ModelName || '';
        document.getElementById('car-form-segment').value = car.segment || car.Segment || '';
        document.getElementById('car-form-price').value = (car.listPrice || car.ListPrice || 0).toLocaleString('vi-VN');
        document.getElementById('car-form-discount').value = (car.defaultDiscount || car.DefaultDiscount || 0).toLocaleString('vi-VN');
        document.getElementById('car-form-engine').value = car.engine || car.Engine || '';
        document.getElementById('car-form-seats').value = car.seats || car.Seats || 5;
        document.getElementById('car-form-warranty').value = car.warranty || car.Warranty || '5 năm hoặc 150.000 km';

        const colors = car.colors || [{ id: "soul-red", name: "Đỏ Pha Lê", hex: "#b31010", extraFee: 8000000 }];
        document.getElementById('car-form-img-ext').value = (colors[0] && colors[0].imageExterior) || car.imageExterior || '';
        document.getElementById('car-form-img-int').value = car.imageInterior || '';
        this.editingCarColors = JSON.parse(JSON.stringify(colors));
      }
    } else {
      title.textContent = "Thêm Dòng Xe Mới Vào Hệ Thống";
      document.getElementById('car-form-img-ext').value = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80';
      document.getElementById('car-form-img-int').value = 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80';
      this.editingCarColors = [
        { id: "red", name: "Đỏ Pha Lê", hex: "#b31010", extraFee: 8000000 },
        { id: "white", name: "Trắng Ngọc Trai", hex: "#f3f4f6", extraFee: 4000000 },
        { id: "black", name: "Đen Ánh Kim", hex: "#18181b", extraFee: 0 }
      ];
    }

    this.renderCarColorsEditor();
    this.bindCarColorEvents();
    modal.classList.remove('hidden');
  },

  bindCarColorEvents: function() {
    const btnAdd = document.getElementById('btn-add-car-color');
    if (btnAdd) {
      btnAdd.onclick = () => {
        this.editingCarColors.push({
          id: `color_${Date.now()}`,
          name: "Màu Sơn Mới",
          hex: "#3b82f6",
          extraFee: 0
        });
        this.renderCarColorsEditor();
      };
    }
  },

  renderCarColorsEditor: function() {
    const container = document.getElementById('car-colors-editor-list');
    if (!container) return;

    container.innerHTML = this.editingCarColors.map((c, idx) => `
      <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
        <input type="color" value="${c.hex || '#b31010'}" onchange="SalesAdminModule.editingCarColors[${idx}].hex = this.value" class="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0">
        <input type="text" value="${c.name}" placeholder="Tên màu" onchange="SalesAdminModule.editingCarColors[${idx}].name = this.value" class="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-bold">
        <div class="w-28 flex items-center gap-1">
          <span class="text-[11px] text-slate-400">+</span>
          <input type="number" step="1000000" value="${c.extraFee || 0}" placeholder="Phụ thu" onchange="SalesAdminModule.editingCarColors[${idx}].extraFee = Number(this.value)" class="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-right" title="Phí phụ thu sơn">
        </div>
        <button type="button" onclick="SalesAdminModule.editingCarColors.splice(${idx}, 1); SalesAdminModule.renderCarColorsEditor();" class="text-slate-500 hover:text-rose-400 p-1" title="Xóa màu">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');
  },

  saveCar: async function() {
    try {
      const carId = document.getElementById('car-edit-id').value || `car-${Date.now()}`;
      const listPrice = Number(document.getElementById('car-form-price').value.replace(/\D/g, '')) || 800000000;
      const discount = Number(document.getElementById('car-form-discount').value.replace(/\D/g, '')) || 0;
      const imgExt = document.getElementById('car-form-img-ext').value.trim();
      const imgInt = document.getElementById('car-form-img-int').value.trim();

      const existing = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));

      const colorsList = this.editingCarColors.map(c => ({
        ...c,
        imageExterior: c.imageExterior || imgExt || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80'
      }));

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
        imageExterior: imgExt,
        imageInterior: imgInt,
        colors: colorsList.length > 0 ? colorsList : [
          { id: "red", name: "Đỏ Pha Lê", hex: "#b31010", imageExterior: imgExt, extraFee: 8000000 }
        ],
        hotspots: existing && existing.hotspots ? existing.hotspots : [],
        realPhotos: existing && existing.realPhotos ? existing.realPhotos : []
      };

      // Cập nhật mảng local
      const idx = this.carsList.findIndex(c => (c.id === carId || c.VehicleCode === carId));
      if (idx >= 0) {
        this.carsList[idx] = carData;
      } else {
        this.carsList.unshift(carData);
      }

      this.renderCarsTable();
      this.populateQuoteCarSelect();

      // Lưu Firestore nếu khả dụng
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection('cars').doc(carId).set(carData, { merge: true }).catch(() => {});
      }

      // Lưu Supabase B20Vehicle nếu khả dụng
      if (typeof SupabaseService !== 'undefined' && SupabaseConfig.isConfigured()) {
        SupabaseService.saveVehicle({
          VehicleCode: carId,
          Brand: carData.brand,
          ModelName: carData.name,
          Segment: carData.segment,
          Engine: carData.engine,
          Seats: carData.seats,
          ListPrice: carData.listPrice,
          DefaultDiscount: carData.defaultDiscount,
          Warranty: carData.warranty,
          ImageExterior: carData.imageExterior,
          ImageInterior: carData.imageInterior,
          Colors: carData.colors
        }).catch(() => {});
      }

      document.getElementById('car-edit-modal')?.classList.add('hidden');
      window.showToast("Đã lưu thông tin dòng xe, ảnh và bảng màu thành công!");
    } catch (err) {
      alert("Lỗi lưu xe: " + err.message);
    }
  },

  deleteCar: async function(carId) {
    if (!confirm("Bạn có chắc chắn muốn xóa dòng xe này?")) return;
    this.carsList = this.carsList.filter(c => c.id !== carId);
    this.renderCarsTable();
    this.populateQuoteCarSelect();

    if (typeof fbDb !== 'undefined' && fbDb) {
      try {
        await fbDb.collection('cars').doc(carId).delete();
      } catch (e) {}
    }
    window.showToast("Đã xóa dòng xe khỏi hệ thống!");
  },

  /**
   * Tạo Báo Giá Mới Cho Khách & Sinh Link Chia Sẻ
   */
  populateQuoteCarSelect: function() {
    const select = document.getElementById('quote-form-car-select');
    if (!select) return;

    select.innerHTML = this.carsList.map(c => `
      <option value="${c.id || c.VehicleCode || 'mazda-cx5'}">[${c.brand || 'THACO'}] ${c.name || c.ModelName} - ${QuoteEngine.formatVND(c.listPrice || c.ListPrice || 800000000)}</option>
    `).join('');
  },

  createQuotation: async function() {
    try {
      const select = document.getElementById('quote-form-car-select');
      const carId = select ? select.value : 'mazda-cx5';
      
      // Tìm car an toàn tuyệt đối
      let car = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));
      if (!car && typeof THACO_CARS_DATA !== 'undefined') {
        car = THACO_CARS_DATA.models[carId] || Object.values(THACO_CARS_DATA.models)[0];
      }
      if (!car) {
        car = {
          id: 'mazda-cx5',
          name: 'Mazda CX-5 2.0L Premium Active',
          listPrice: 829000000,
          colors: [{ id: 'soul-red', name: 'Đỏ Pha Lê', hex: '#b31010', extraFee: 8000000 }]
        };
      }

      const colors = car.colors || [{ id: 'soul-red', name: 'Đỏ Pha Lê', hex: '#b31010', extraFee: 8000000 }];
      const colorId = colors[0]?.id || 'soul-red';

      const customerName = document.getElementById('quote-form-cust-name').value || "Khách Hàng";
      const customerPhone = document.getElementById('quote-form-cust-phone').value || "0908.123.456";
      const provinceId = document.getElementById('quote-form-province').value || 'hcm';
      const discount = Number(document.getElementById('quote-form-discount').value.replace(/\D/g, '')) || 0;

      const calcRes = QuoteEngine.calcOnTheRoad({
        carId: car.id || carId,
        colorId: colorId,
        provinceId: provinceId,
        customDiscount: discount
      });

      const quoteId = `BG-${Date.now().toString().slice(-6)}`;
      const user = AuthManager.userProfile;

      const quoteData = {
        quoteId,
        createdBySalesUid: user ? user.uid : 'sales',
        salesName: user ? user.displayName : 'TANNV (Administrator)',
        salesPhone: user ? user.phone : '0908.123.456',
        showroom: user ? user.showroom : 'THACO AUTO Showroom',
        customerName,
        customerPhone,
        carId: car.id || carId,
        carName: car.name || car.ModelName || 'Mazda CX-5',
        colorId: colorId,
        colorName: colors[0]?.name || 'Đỏ Pha Lê',
        provinceId,
        province: provinceId,
        discount,
        listPrice: calcRes.actualListPrice,
        invoicePrice: calcRes.invoicePrice,
        totalOnTheRoad: calcRes.totalOnTheRoad,
        status: 'sent',
        depositAmount: 20000000,
        createdAt: new Date().toISOString()
      };

      // 1. Lưu LocalStorage để hiển thị ngay lập tức
      const localQuotes = JSON.parse(localStorage.getItem('thaco_local_quotes') || '[]');
      localQuotes.unshift(quoteData);
      localStorage.setItem('thaco_local_quotes', JSON.stringify(localQuotes));

      this.myQuotes = localQuotes;
      this.renderMyQuotesTable();

      // 2. Lưu Firestore nền nếu có kết nối
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection('quotations').doc(quoteId).set(quoteData).catch(() => {});
      }

      // 3. Lưu Supabase (B20Quotation & B20Customer) nếu đã cấu hình
      if (typeof SupabaseService !== 'undefined') {
        SupabaseService.createQuotation(quoteData).catch(() => {});
      }

      // Sinh URL báo giá trực tuyến
      const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', 'index.html');
      const shareUrl = `${baseUrl}?quoteId=${quoteId}`;

      this.showShareQuoteModal(quoteId, shareUrl, customerName, quoteData.carName, calcRes.totalOnTheRoad);
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
    // 1. Nạp từ local storage trước
    const saved = JSON.parse(localStorage.getItem('thaco_local_quotes') || '[]');
    this.myQuotes = saved;
    this.renderMyQuotesTable();

    // 2. Lắng nghe Firestore nếu có
    if (typeof fbDb !== 'undefined' && fbDb) {
      try {
        fbDb.collection('quotations').orderBy('createdAt', 'desc').limit(20).onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            this.myQuotes = list;
            this.renderMyQuotesTable();
          }
        }, () => {});
      } catch (e) {}
    }
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
      const isDeposited = q.status === 'deposit_received' || q.status === 'completed' || q.DepositStatus === 'deposit_received';
      const statusBadge = isDeposited
        ? '<span class="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse"><i class="fa-solid fa-check mr-1"></i>Đã Cọc 20Tr</span>'
        : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Đã Gửi Link</span>';

      const link = `${baseUrl}?quoteId=${q.quoteId || q.QuoteID || q.id}`;

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition text-xs">
          <td class="px-4 py-3 font-bold text-white">${q.quoteId || q.QuoteID || q.id}</td>
          <td class="px-4 py-3">
            <strong class="text-white block">${q.customerName || q.CustomerName || 'Khách hàng'}</strong>
            <span class="text-slate-400">${q.customerPhone || q.CustomerPhone || '-'}</span>
          </td>
          <td class="px-4 py-3 font-semibold text-blue-400">${q.carName || q.CarName || 'Xe THACO'}</td>
          <td class="px-4 py-3 font-bold text-white">${QuoteEngine.formatVND(q.totalOnTheRoad || q.TotalOnTheRoad || 0)}</td>
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
   * Lưu ảnh xe thật chụp tại bãi (Hỗ trợ cả File Upload & URL)
   */
  currentPhotoDataUrl: null,

  bindPhotoEvents: function() {
    const fileInput = document.getElementById('photo-file-input');
    const urlInput = document.getElementById('photo-url-input');
    const previewBox = document.getElementById('photo-preview-box');
    const previewImg = document.getElementById('photo-preview-img');
    const carSelect = document.getElementById('photo-car-select');

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.currentPhotoDataUrl = event.target.result;
          if (previewImg && previewBox) {
            previewImg.src = this.currentPhotoDataUrl;
            previewBox.classList.remove('hidden');
          }
          if (urlInput) urlInput.value = '';
        };
        reader.readAsDataURL(file);
      }
    });

    urlInput?.addEventListener('input', () => {
      const url = urlInput.value.trim();
      if (url && previewImg && previewBox) {
        this.currentPhotoDataUrl = url;
        previewImg.src = url;
        previewBox.classList.remove('hidden');
      }
    });

    carSelect?.addEventListener('change', () => {
      this.renderRealPhotosGallery();
    });
  },

  saveRealPhoto: async function() {
    try {
      const carId = document.getElementById('photo-car-select').value;
      const title = document.getElementById('photo-title-input').value.trim();
      const category = document.getElementById('photo-category-input').value;
      const urlVal = document.getElementById('photo-url-input').value.trim();
      const finalUrl = this.currentPhotoDataUrl || urlVal;

      if (!finalUrl) {
        alert("Vui lòng chọn 1 tệp ảnh từ máy tính hoặc dán đường dẫn URL ảnh!");
        return;
      }

      const newPhoto = {
        id: `photo_${Date.now()}`,
        title: title || "Ảnh xe thực tế",
        category: category,
        desc: `Ảnh chụp tại bãi kho THACO (${category})`,
        url: finalUrl,
        uploadedAt: new Date().toLocaleDateString('vi-VN')
      };

      // 1. Cập nhật vào mảng Local
      let car = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));
      if (!car && typeof THACO_CARS_DATA !== 'undefined') {
        car = THACO_CARS_DATA.models[carId];
      }

      if (car) {
        car.realPhotos = car.realPhotos || [];
        car.realPhotos.unshift(newPhoto);
      }

      // 2. Lưu vào LocalStorage
      const localPhotos = JSON.parse(localStorage.getItem(`thaco_real_photos_${carId}`) || '[]');
      localPhotos.unshift(newPhoto);
      localStorage.setItem(`thaco_real_photos_${carId}`, JSON.stringify(localPhotos));

      // 3. Lưu Firestore nếu có
      if (typeof fbDb !== 'undefined' && fbDb) {
        try {
          const carRef = fbDb.collection('cars').doc(carId);
          const carDoc = await carRef.get();
          if (carDoc.exists) {
            const photos = carDoc.data().realPhotos || [];
            photos.unshift(newPhoto);
            await carRef.update({ realPhotos: photos });
          }
        } catch (e) {}
      }

      window.showToast("Đã lưu ảnh chụp thật vào kho xe thành công!");
      
      // Reset form
      document.getElementById('sales-real-photo-form').reset();
      this.currentPhotoDataUrl = null;
      document.getElementById('photo-preview-box')?.classList.add('hidden');
      this.renderRealPhotosGallery();

    } catch (err) {
      alert("Lỗi lưu ảnh: " + err.message);
    }
  },

  renderRealPhotosGallery: function() {
    const container = document.getElementById('admin-real-photos-grid');
    const countBadge = document.getElementById('photo-gallery-count');
    const select = document.getElementById('photo-car-select');
    if (!container || !select) return;

    const carId = select.value;
    let car = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));
    if (!car && typeof THACO_CARS_DATA !== 'undefined') {
      car = THACO_CARS_DATA.models[carId];
    }

    const defaultPhotos = (car && car.realPhotos) ? car.realPhotos : [];
    const localPhotos = JSON.parse(localStorage.getItem(`thaco_real_photos_${carId}`) || '[]');
    
    // Ghép ảnh không trùng lặp
    const allPhotos = [...localPhotos];
    defaultPhotos.forEach(dp => {
      if (!allPhotos.some(ap => ap.url === dp.url)) {
        allPhotos.push(dp);
      }
    });

    if (countBadge) countBadge.textContent = `${allPhotos.length} ảnh (${car ? (car.name || car.ModelName) : 'Xe'})`;

    if (allPhotos.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 py-10 text-center text-slate-500 text-xs">
          <i class="fa-solid fa-camera text-3xl mb-2 text-slate-600 block"></i>
          Chưa có ảnh chụp thật nào cho dòng xe này.<br>Hãy tải ảnh đầu tiên ở cột bên trái!
        </div>
      `;
      return;
    }

    container.innerHTML = allPhotos.map((p, idx) => `
      <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 group hover:border-cyan-500/50 transition">
        <div class="aspect-video rounded-xl overflow-hidden bg-slate-950 relative">
          <img src="${p.url}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-[10px] font-bold text-cyan-300 border border-slate-700">
            ${p.category || 'Nội thất'}
          </span>
        </div>
        <div class="flex justify-between items-start">
          <div>
            <strong class="text-white text-xs block line-clamp-1">${p.title || 'Ảnh thực tế'}</strong>
            <span class="text-[11px] text-slate-400 block">${p.desc || 'Chụp tại bãi kho'}</span>
          </div>
          <button onclick="SalesAdminModule.deleteRealPhoto('${carId}', ${idx})" class="text-slate-500 hover:text-rose-400 text-xs p-1" title="Xóa ảnh">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  deleteRealPhoto: function(carId, idx) {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này khỏi kho?")) return;
    
    let localPhotos = JSON.parse(localStorage.getItem(`thaco_real_photos_${carId}`) || '[]');
    if (localPhotos.length > idx) {
      localPhotos.splice(idx, 1);
      localStorage.setItem(`thaco_real_photos_${carId}`, JSON.stringify(localPhotos));
    }

    let car = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));
    if (car && car.realPhotos && car.realPhotos.length > idx) {
      car.realPhotos.splice(idx, 1);
    }

    this.renderRealPhotosGallery();
    window.showToast("Đã xóa ảnh thành công!");
  }
};

