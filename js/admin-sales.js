/**
 * MODULE SALES ADMIN (ADMIN THƯỜNG) - BULLETPROOF FULL CRUD
 * Quản lý dòng xe (Thêm / Sửa / Xóa), bảng màu sơn, ảnh xe, tạo báo giá và theo dõi đơn cọc
 */

const SalesAdminModule = {
  // Nạp danh sách xe ưu tiên từ LocalStorage, sau đó đến THACO_CARS_DATA
  carsList: (function() {
    const saved = localStorage.getItem('thaco_custom_cars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return typeof THACO_CARS_DATA !== 'undefined' ? Object.values(THACO_CARS_DATA.models) : [];
  })(),

  myQuotes: [],
  editingCarColors: [],
  currentPhotoDataUrl: null,

  init: function() {
    this.bindEvents();
    this.bindPhotoEvents();
    this.renderCarsTable();
    this.populateQuoteCarSelect();
    this.populatePhotoCarSelect();
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

    // Nút mở modal thêm xe mới
    document.getElementById('btn-open-add-car')?.addEventListener('click', () => {
      this.openCarModal(null);
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
   * Tải danh mục xe từ Firestore (nếu có dữ liệu mới)
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
              localStorage.setItem('thaco_custom_cars', JSON.stringify(list));
              this.renderCarsTable();
              this.populateQuoteCarSelect();
            }
          }
        }, () => {});
      } catch (e) {}
    }
  },

  /**
   * Render bảng danh sách xe với các nút Sửa & Xóa
   */
  renderCarsTable: function() {
    const tbody = document.getElementById('sales-cars-table-body');
    if (!tbody) return;

    if (this.carsList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">Chưa có dòng xe nào trong hệ thống.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.carsList.map((car, idx) => {
      const colors = car.colors || [{ name: "Mặc định", hex: "#b31010" }];
      const extImg = (colors[0] && colors[0].imageExterior) || car.imageExterior || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=120&q=80';
      const carName = car.name || car.ModelName || 'Dòng xe THACO';
      const brand = car.brand || car.Brand || 'THACO';
      const price = car.listPrice || car.ListPrice || 800000000;
      const segment = car.segment || car.Segment || 'Xe Đô Thị';

      return `
        <tr id="car-row-${idx}" class="border-b border-slate-800 hover:bg-slate-800/40 transition-all duration-300 text-xs sm:text-sm">
          <td class="px-4 py-3 font-bold text-white flex items-center gap-3">
            <div class="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex-shrink-0">
              <img src="${extImg}" class="w-full h-full object-cover">
            </div>
            <div>
              <span class="text-xs font-bold text-blue-400 block">[${brand}]</span>
              <span class="font-bold">${carName}</span>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-300 font-semibold text-emerald-400">${QuoteEngine.formatVND(price)}</td>
          <td class="px-4 py-3 text-slate-400">${segment}</td>
          <td class="px-4 py-3">
            <div class="flex gap-1">
              ${colors.map(c => `<span class="w-4 h-4 rounded-full border border-slate-600 shadow-sm" style="background-color: ${c.hex};" title="${c.name}"></span>`).join('')}
            </div>
          </td>
          <td class="px-4 py-3 text-right space-x-2 whitespace-nowrap">
            <button type="button" onclick="SalesAdminModule.openCarModal(${idx})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-900 text-blue-400 text-xs font-bold transition border border-slate-700">
              <i class="fa-solid fa-pen-to-square mr-1"></i>Sửa
            </button>
            <button type="button" onclick="SalesAdminModule.deleteCar(${idx})" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs font-bold transition border border-slate-700" title="Xóa dòng xe">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Mở Modal Thêm hoặc Sửa Dòng Xe
   */
  openCarModal: function(idxOrId = null) {
    const modal = document.getElementById('car-edit-modal');
    const title = document.getElementById('car-modal-title');
    const form = document.getElementById('sales-car-form');
    if (!modal || !form) return;

    form.reset();

    let car = null;
    let targetId = '';

    if (idxOrId !== null && idxOrId !== undefined) {
      if (typeof idxOrId === 'number') {
        car = this.carsList[idxOrId];
        targetId = car ? (car.id || car.VehicleCode || `car_${idxOrId}`) : '';
      } else {
        car = this.carsList.find(c => (c.id === idxOrId || c.VehicleCode === idxOrId));
        targetId = idxOrId;
      }
    }

    document.getElementById('car-edit-id').value = targetId;

    if (car) {
      title.textContent = `Chỉnh sửa dòng xe: ${car.name || car.ModelName}`;
      if (document.getElementById('car-form-brand')) document.getElementById('car-form-brand').value = car.brand || car.Brand || 'Mazda';
      if (document.getElementById('car-form-name')) document.getElementById('car-form-name').value = car.name || car.ModelName || '';
      if (document.getElementById('car-form-segment')) document.getElementById('car-form-segment').value = car.segment || car.Segment || 'C-SUV 5 Chỗ';
      if (document.getElementById('car-form-price')) document.getElementById('car-form-price').value = (car.listPrice || car.ListPrice || 800000000).toLocaleString('vi-VN');
      if (document.getElementById('car-form-discount')) document.getElementById('car-form-discount').value = (car.defaultDiscount || car.DefaultDiscount || 0).toLocaleString('vi-VN');
      if (document.getElementById('car-form-engine')) document.getElementById('car-form-engine').value = car.engine || car.Engine || 'SkyActiv-G 2.0L';
      if (document.getElementById('car-form-seats')) document.getElementById('car-form-seats').value = car.seats || car.Seats || 5;
      if (document.getElementById('car-form-warranty')) document.getElementById('car-form-warranty').value = car.warranty || car.Warranty || '5 năm hoặc 150.000 km';

      const colors = car.colors || [{ id: "soul-red", name: "Đỏ Pha Lê", hex: "#b31010", extraFee: 8000000 }];
      const extImg = (colors[0] && colors[0].imageExterior) || car.imageExterior || '';
      const intImg = car.imageInterior || '';
      
      if (document.getElementById('car-form-img-ext')) document.getElementById('car-form-img-ext').value = extImg;
      if (document.getElementById('car-form-img-int')) document.getElementById('car-form-img-int').value = intImg;
      
      this.updateCarPreviewImages(extImg, intImg);
      this.editingCarColors = JSON.parse(JSON.stringify(colors));
    } else {
      title.textContent = "Thêm Dòng Xe Mới Vào Hệ Thống";
      const defaultExt = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80';
      const defaultInt = 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80';
      
      if (document.getElementById('car-form-img-ext')) document.getElementById('car-form-img-ext').value = defaultExt;
      if (document.getElementById('car-form-img-int')) document.getElementById('car-form-img-int').value = defaultInt;
      
      this.updateCarPreviewImages(defaultExt, defaultInt);
      this.editingCarColors = [
        { id: "red", name: "Đỏ Pha Lê", hex: "#b31010", extraFee: 8000000 },
        { id: "white", name: "Trắng Ngọc Trai", hex: "#f3f4f6", extraFee: 4000000 },
        { id: "black", name: "Đen Ánh Kim", hex: "#18181b", extraFee: 0 }
      ];
    }

    this.renderCarColorsEditor();
    this.bindCarColorEvents();
    this.bindCarFileEvents();
    modal.classList.remove('hidden');
  },

  updateCarPreviewImages: function(extUrl, intUrl) {
    const extBox = document.getElementById('car-preview-ext-box');
    const extImg = document.getElementById('car-preview-ext-img');
    const intBox = document.getElementById('car-preview-int-box');
    const intImg = document.getElementById('car-preview-int-img');

    if (extUrl && extBox && extImg) {
      extImg.src = extUrl;
      extBox.classList.remove('hidden');
    }
    if (intUrl && intBox && intImg) {
      intImg.src = intUrl;
      intBox.classList.remove('hidden');
    }
  },

  bindCarFileEvents: function() {
    const fileExt = document.getElementById('car-form-file-ext');
    const urlExt = document.getElementById('car-form-img-ext');
    const fileInt = document.getElementById('car-form-file-int');
    const urlInt = document.getElementById('car-form-img-int');

    fileExt?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (urlExt) urlExt.value = event.target.result;
          this.updateCarPreviewImages(event.target.result, null);
        };
        reader.readAsDataURL(file);
      }
    });

    urlExt?.addEventListener('input', () => {
      this.updateCarPreviewImages(urlExt.value.trim(), null);
    });

    fileInt?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (urlInt) urlInt.value = event.target.result;
          this.updateCarPreviewImages(null, event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });

    urlInt?.addEventListener('input', () => {
      this.updateCarPreviewImages(null, urlInt.value.trim());
    });
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

  /**
   * Lưu thông tin dòng xe
   */
  saveCar: async function() {
    try {
      const editId = document.getElementById('car-edit-id')?.value || '';
      const brand = document.getElementById('car-form-brand')?.value || 'Kia';
      const name = document.getElementById('car-form-name')?.value?.trim() || 'Dòng Xe Mới';
      const carId = editId || `car_${Date.now()}`;
      
      const priceEl = document.getElementById('car-form-price');
      const listPrice = priceEl ? (Number(priceEl.value.replace(/\D/g, '')) || 800000000) : 800000000;
      
      const discountEl = document.getElementById('car-form-discount');
      const discount = discountEl ? (Number(discountEl.value.replace(/\D/g, '')) || 0) : 0;
      
      const imgExt = document.getElementById('car-form-img-ext')?.value?.trim() || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80';
      const imgInt = document.getElementById('car-form-img-int')?.value?.trim() || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80';
      const segment = document.getElementById('car-form-segment')?.value || 'C-SUV 5 Chỗ';
      const engine = document.getElementById('car-form-engine')?.value || 'SkyActiv-G 2.0L';
      const seats = Number(document.getElementById('car-form-seats')?.value) || 5;
      const warranty = document.getElementById('car-form-warranty')?.value || '5 năm hoặc 150.000 km';

      const existing = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));

      const colorsList = this.editingCarColors.map(c => ({
        ...c,
        imageExterior: c.imageExterior || imgExt
      }));

      const carData = {
        id: carId,
        VehicleCode: carId,
        brand: brand,
        name: name,
        segment: segment,
        listPrice: listPrice,
        defaultDiscount: discount,
        engine: engine,
        seats: seats,
        warranty: warranty,
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

      // Lưu LocalStorage
      localStorage.setItem('thaco_custom_cars', JSON.stringify(this.carsList));

      this.renderCarsTable();
      this.populateQuoteCarSelect();
      this.populatePhotoCarSelect();

      // Lưu Firestore nền nếu có kết nối
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection('cars').doc(carId).set(carData, { merge: true }).catch(() => {});
      }

      // Lưu Supabase B20Vehicle nếu đã cấu hình
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

  /**
   * Xóa Dòng Xe
   */
  deleteCar: function(idxOrId) {
    if (!confirm("Bạn có chắc chắn muốn xóa dòng xe này?")) return;

    if (typeof idxOrId === 'number') {
      const row = document.getElementById(`car-row-${idxOrId}`);
      if (row) {
        row.classList.add('opacity-0', 'scale-95', '-translate-x-4');
      }
    }

    setTimeout(() => {
      let removedCar = null;

      if (typeof idxOrId === 'number') {
        removedCar = this.carsList.splice(idxOrId, 1)[0];
      } else {
        const idx = this.carsList.findIndex(c => (c.id === idxOrId || c.VehicleCode === idxOrId));
        if (idx >= 0) {
          removedCar = this.carsList.splice(idx, 1)[0];
        }
      }

      // Lưu mảng sau khi xóa vào LocalStorage
      localStorage.setItem('thaco_custom_cars', JSON.stringify(this.carsList));
      this.renderCarsTable();
      this.populateQuoteCarSelect();
      this.populatePhotoCarSelect();

      // Xóa Firestore nền nếu có
      if (removedCar && typeof fbDb !== 'undefined' && fbDb) {
        const delId = removedCar.id || removedCar.VehicleCode;
        fbDb.collection('cars').doc(delId).delete().catch(() => {});
      }

      // Xóa Supabase B20Vehicle nếu đã cấu hình
      if (removedCar && typeof SupabaseService !== 'undefined' && SupabaseConfig.isConfigured()) {
        const delId = removedCar.id || removedCar.VehicleCode;
        SupabaseService.deleteVehicle(delId).catch(() => {});
      }

      window.showToast("Đã xóa dòng xe khỏi hệ thống!");
    }, 200);
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

      // 1. Lưu LocalStorage
      const localQuotes = JSON.parse(localStorage.getItem('thaco_local_quotes') || '[]');
      localQuotes.unshift(quoteData);
      localStorage.setItem('thaco_local_quotes', JSON.stringify(localQuotes));

      this.myQuotes = localQuotes;
      this.renderMyQuotesTable();

      // 2. Lưu Firestore nền nếu có
      if (typeof fbDb !== 'undefined' && fbDb) {
        fbDb.collection('quotations').doc(quoteId).set(quoteData).catch(() => {});
      }

      // 3. Lưu Supabase (B20Quotation & B20Customer)
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
    const saved = JSON.parse(localStorage.getItem('thaco_local_quotes') || '[]');
    this.myQuotes = saved;
    this.renderMyQuotesTable();

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
            <button type="button" onclick="SalesAdminModule.deleteQuotation('${q.quoteId || q.QuoteID || q.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 font-bold transition border border-slate-700" title="Xóa báo giá">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  deleteQuotation: function(quoteId) {
    if (!confirm(`Bạn có chắc chắn muốn xóa bản báo giá [${quoteId}]?`)) return;

    this.myQuotes = this.myQuotes.filter(q => (q.quoteId !== quoteId && q.QuoteID !== quoteId && q.id !== quoteId));
    localStorage.setItem('thaco_local_quotes', JSON.stringify(this.myQuotes));
    this.renderMyQuotesTable();

    // Xóa Firestore nền nếu có
    if (typeof fbDb !== 'undefined' && fbDb) {
      fbDb.collection('quotations').doc(quoteId).delete().catch(() => {});
    }

    // Xóa Supabase B20Quotation nếu có
    if (typeof SupabaseService !== 'undefined' && SupabaseConfig.isConfigured()) {
      SupabaseService.deleteQuotation(quoteId).catch(() => {});
    }

    window.showToast(`Đã xóa báo giá [${quoteId}] khỏi cơ sở dữ liệu!`);
  },

  /**
   * Quản lý Ảnh xe thật chụp tại bãi
   */
  populatePhotoCarSelect: function() {
    const select = document.getElementById('photo-car-select');
    if (!select) return;

    select.innerHTML = this.carsList.map(c => `
      <option value="${c.id || c.VehicleCode || 'mazda-cx5'}">[${c.brand || 'THACO'}] ${c.name || c.ModelName}</option>
    `).join('');
  },

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
      const carSelect = document.getElementById('photo-car-select');
      const carId = carSelect ? carSelect.value : 'mazda-cx5';
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

      let car = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));
      if (!car && typeof THACO_CARS_DATA !== 'undefined') {
        car = THACO_CARS_DATA.models[carId];
      }

      if (car) {
        if (!Array.isArray(car.realPhotos)) {
          car.realPhotos = [];
        }
        car.realPhotos.unshift(newPhoto);
      }

      // 1. Lưu LocalStorage
      localStorage.setItem('thaco_custom_cars', JSON.stringify(this.carsList));

      // 2. Lưu Firestore
      if (typeof fbDb !== 'undefined' && fbDb) {
        try {
          await fbDb.collection('cars').doc(carId).set({
            realPhotos: car ? car.realPhotos : [newPhoto]
          }, { merge: true });
        } catch (e) {}
      }

      // 3. Lưu Supabase Cloud SQL B20Vehicle
      if (typeof SupabaseService !== 'undefined' && SupabaseConfig.isConfigured()) {
        try {
          await SupabaseService.saveVehicle({
            VehicleCode: carId,
            RealPhotos: car ? car.realPhotos : [newPhoto]
          });
        } catch (e) {}
      }

      window.showToast("Đã lưu ảnh chụp thật vào Database thành công!");
      
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

    const photos = (car && Array.isArray(car.realPhotos)) ? car.realPhotos : [];

    if (countBadge) countBadge.textContent = `${photos.length} ảnh (${car ? (car.name || car.ModelName) : 'Xe'})`;

    if (photos.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 py-10 text-center text-slate-500 text-xs">
          <i class="fa-solid fa-camera text-3xl mb-2 text-slate-600 block"></i>
          Chưa có ảnh chụp thật nào cho dòng xe này.<br>Hãy tải ảnh đầu tiên ở cột bên trái!
        </div>
      `;
      return;
    }

    container.innerHTML = photos.map((p, idx) => `
      <div id="photo-card-${carId}-${idx}" class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 group hover:border-cyan-500/50 transition-all duration-300 transform scale-100 opacity-100">
        <div class="aspect-video rounded-xl overflow-hidden bg-slate-950 relative">
          <img src="${p.url}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-[10px] font-bold text-cyan-300 border border-slate-700">
            ${p.category || 'Nội thất'}
          </span>
        </div>
        <div class="flex justify-between items-start">
          <div class="overflow-hidden pr-2">
            <strong class="text-white text-xs block truncate">${p.title || 'Ảnh thực tế'}</strong>
            <span class="text-[11px] text-slate-400 block truncate">${p.desc || 'Chụp tại bãi kho'}</span>
          </div>
          <button type="button" onclick="SalesAdminModule.deleteRealPhoto('${carId}', ${idx})" class="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs transition border border-slate-700 flex-shrink-0" title="Xóa ảnh khỏi kho">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  deleteRealPhoto: async function(carId, idx) {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này khỏi Database?")) return;

    // Hiệu ứng biến mất tức thì trên DOM ngay lập tức
    const el = document.getElementById(`photo-card-${carId}-${idx}`);
    if (el) {
      el.classList.add('scale-75', 'opacity-0', '-translate-y-4', 'pointer-events-none');
    }

    setTimeout(async () => {
      let car = this.carsList.find(c => (c.id === carId || c.VehicleCode === carId));
      if (!car && typeof THACO_CARS_DATA !== 'undefined') {
        car = THACO_CARS_DATA.models[carId];
      }

      if (car && Array.isArray(car.realPhotos) && car.realPhotos.length > idx) {
        car.realPhotos.splice(idx, 1);
      }

      // 1. Lưu LocalStorage
      localStorage.setItem('thaco_custom_cars', JSON.stringify(this.carsList));

      // 2. Lưu Firestore
      if (typeof fbDb !== 'undefined' && fbDb) {
        try {
          await fbDb.collection('cars').doc(carId).set({
            realPhotos: car ? car.realPhotos : []
          }, { merge: true });
        } catch (e) {}
      }

      // 3. Lưu Supabase B20Vehicle
      if (typeof SupabaseService !== 'undefined' && SupabaseConfig.isConfigured()) {
        try {
          await SupabaseService.saveVehicle({
            VehicleCode: carId,
            RealPhotos: car ? car.realPhotos : []
          });
        } catch (e) {}
      }

      this.renderRealPhotosGallery();
      window.showToast("Đã xóa ảnh thành công!");
    }, 200);
  }
};
