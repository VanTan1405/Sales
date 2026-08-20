/**
 * MODULE TƯƠNG TÁC HÌNH ẢNH, ĐỔI MÀU XE, HOTSPOTS & KÍNH LÚP SOI ẢNH THẬT
 */

const InteractiveViewer = {
  currentViewMode: 'exterior', // 'exterior' or 'interior'
  activeHotspot: null,

  /**
   * Khởi tạo trình xem ảnh xe tương tác
   */
  init: function() {
    this.bindEvents();
    this.initMagnifier();
    this.initBeforeAfterSlider();
    this.initImageUploader();
  },

  bindEvents: function() {
    // Nút chuyển Ngoại thất / Nội thất
    const viewExteriorBtn = document.getElementById('view-exterior-btn');
    const viewInteriorBtn = document.getElementById('view-interior-btn');

    viewExteriorBtn?.addEventListener('click', () => {
      this.setViewMode('exterior');
    });

    viewInteriorBtn?.addEventListener('click', () => {
      this.setViewMode('interior');
    });

    // Đóng popup hotspot khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.hotspot-point') && !e.target.closest('#hotspot-detail-modal')) {
        this.closeHotspotModal();
      }
    });

    document.getElementById('btn-close-hotspot')?.addEventListener('click', () => {
      this.closeHotspotModal();
    });
  },

  /**
   * Cập nhật hiển thị màu sơn và hình ảnh xe
   */
  renderCarVisual: function(car, color) {
    const carImage = document.getElementById('main-car-image');
    const interiorImage = document.getElementById('main-interior-image');
    const colorBadge = document.getElementById('current-color-badge');
    const colorDotsContainer = document.getElementById('color-swatches-container');

    if (!car || !color) return;

    // Cập nhật tên màu
    if (colorBadge) {
      colorBadge.textContent = color.name + (color.extraFee > 0 ? ` (+${QuoteEngine.formatVND(color.extraFee)})` : '');
    }

    // Hiệu ứng đổi màu xe mượt mà
    if (carImage) {
      carImage.classList.add('car-color-transition');
      carImage.src = color.imageExterior;
      setTimeout(() => {
        carImage.classList.remove('car-color-transition');
      }, 400);
    }

    if (interiorImage) {
      interiorImage.src = car.imageInterior;
    }

    // Render danh sách chấm màu sơn chính hãng
    if (colorDotsContainer) {
      colorDotsContainer.innerHTML = car.colors.map(c => {
        const isSelected = c.id === color.id;
        return `
          <button data-color-id="${c.id}" class="color-swatch-btn relative w-9 h-9 rounded-full transition transform hover:scale-110 shadow-md border-2 ${isSelected ? 'ring-4 ring-blue-500/50 border-white scale-110' : 'border-slate-300 dark:border-slate-700'}" style="background-color: ${c.hex};" title="${c.name}">
            ${isSelected ? '<span class="absolute inset-0 flex items-center justify-center text-white text-xs drop-shadow"><i class="fa-solid fa-check"></i></span>' : ''}
          </button>
        `;
      }).join('');

      // Gắn sự kiện click đổi màu
      colorDotsContainer.querySelectorAll('.color-swatch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const colorId = btn.getAttribute('data-color-id');
          if (window.onSelectColorCallback) {
            window.onSelectColorCallback(colorId);
          }
        });
      });
    }

    // Render các điểm Hotspot trên xe
    this.renderHotspots(car.hotspots);

    // Render thư viện ảnh chụp thật
    this.renderRealGallery(car.realPhotos);
  },

  /**
   * Chuyển đổi giữa góc nhìn Ngoại thất và Nội thất
   */
  setViewMode: function(mode) {
    this.currentViewMode = mode;
    const exteriorContainer = document.getElementById('exterior-view-container');
    const interiorContainer = document.getElementById('interior-view-container');
    const viewExteriorBtn = document.getElementById('view-exterior-btn');
    const viewInteriorBtn = document.getElementById('view-interior-btn');
    const hotspotsContainer = document.getElementById('hotspots-overlay');

    if (mode === 'exterior') {
      exteriorContainer?.classList.remove('hidden');
      interiorContainer?.classList.add('hidden');
      hotspotsContainer?.classList.remove('hidden');

      viewExteriorBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
      viewExteriorBtn?.classList.remove('text-slate-500');
      viewInteriorBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
      viewInteriorBtn?.classList.add('text-slate-500');
    } else {
      exteriorContainer?.classList.add('hidden');
      interiorContainer?.classList.remove('hidden');
      hotspotsContainer?.classList.add('hidden');

      viewInteriorBtn?.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
      viewInteriorBtn?.classList.remove('text-slate-500');
      viewExteriorBtn?.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
      viewExteriorBtn?.classList.add('text-slate-500');
    }
  },

  /**
   * Render các điểm Hotspots nhấp nháy phát sáng trên ảnh xe
   */
  renderHotspots: function(hotspots) {
    const container = document.getElementById('hotspots-overlay');
    if (!container || !hotspots) return;

    container.innerHTML = hotspots.map(h => `
      <div data-id="${h.id}" class="hotspot-point absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group" style="left: ${h.x}%; top: ${h.y}%;">
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex items-center justify-center rounded-full h-6 w-6 bg-blue-600 text-white font-bold text-[10px] shadow-lg border-2 border-white">
            <i class="fa-solid fa-plus"></i>
          </span>
        </div>
        <div class="hidden group-hover:block absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl backdrop-blur z-20 pointer-events-none">
          ${h.title}
        </div>
      </div>
    `).join('');

    // Gắn sự kiện mở popup chi tiết
    container.querySelectorAll('.hotspot-point').forEach(point => {
      point.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = point.getAttribute('data-id');
        const item = hotspots.find(x => x.id === id);
        if (item) this.showHotspotModal(item);
      });
    });
  },

  showHotspotModal: function(hotspot) {
    const modal = document.getElementById('hotspot-detail-modal');
    const title = document.getElementById('hotspot-title');
    const desc = document.getElementById('hotspot-desc');
    const img = document.getElementById('hotspot-image');

    if (!modal) return;

    if (title) title.textContent = hotspot.title;
    if (desc) desc.textContent = hotspot.desc;
    if (img) img.src = hotspot.image;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeHotspotModal: function() {
    const modal = document.getElementById('hotspot-detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  /**
   * Render Thư viện Ảnh Chụp Thật & Kính Lúp
   */
  renderRealGallery: function(photos) {
    const container = document.getElementById('real-photos-grid');
    if (!container || !photos) return;

    container.innerHTML = photos.map((p, idx) => `
      <div class="real-photo-card group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer" data-idx="${idx}">
        <div class="aspect-video relative overflow-hidden">
          <img src="${p.url}" alt="${p.title}" class="w-full h-full object-cover transition duration-300 group-hover:scale-105">
          <span class="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur">
            ${p.category}
          </span>
        </div>
        <div class="p-3">
          <h4 class="font-bold text-xs sm:text-sm text-slate-800 dark:text-white line-clamp-1">${p.title}</h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">${p.desc}</p>
        </div>
      </div>
    `).join('');

    // Click xem ảnh lớn kèm kính lúp soi chi tiết
    container.querySelectorAll('.real-photo-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-idx'));
        const photo = photos[idx];
        if (photo) this.openPhotoMagnifierModal(photo);
      });
    });
  },

  /**
   * Kính Lúp Soi Chi Tiết Ảnh Thật
   */
  initMagnifier: function() {
    const modal = document.getElementById('photo-magnifier-modal');
    const closeBtn = document.getElementById('btn-close-magnifier');
    closeBtn?.addEventListener('click', () => {
      modal?.classList.add('hidden');
    });

    const lensContainer = document.getElementById('magnifier-container');
    const targetImage = document.getElementById('magnifier-target-image');
    const lens = document.getElementById('magnifier-glass');

    if (lensContainer && targetImage && lens) {
      lensContainer.addEventListener('mousemove', (e) => {
        const rect = lensContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        lens.style.display = 'block';
        lens.style.left = `${x - 60}px`;
        lens.style.top = `${y - 60}px`;

        const ratioX = x / rect.width;
        const ratioY = y / rect.height;

        lens.style.backgroundImage = `url('${targetImage.src}')`;
        lens.style.backgroundSize = `${rect.width * 2.5}px ${rect.height * 2.5}px`;
        lens.style.backgroundPosition = `-${ratioX * (rect.width * 2.5) - 60}px -${ratioY * (rect.height * 2.5) - 60}px`;
      });

      lensContainer.addEventListener('mouseleave', () => {
        lens.style.display = 'none';
      });
    }
  },

  openPhotoMagnifierModal: function(photo) {
    const modal = document.getElementById('photo-magnifier-modal');
    const targetImage = document.getElementById('magnifier-target-image');
    const title = document.getElementById('magnifier-photo-title');
    const desc = document.getElementById('magnifier-photo-desc');

    if (targetImage) targetImage.src = photo.url;
    if (title) title.textContent = photo.title;
    if (desc) desc.textContent = photo.desc;

    modal?.classList.remove('hidden');
  },

  /**
   * Thanh Trượt So Sánh Trước & Sau Khi Lắp Phụ Kiện (Before / After Slider)
   */
  initBeforeAfterSlider: function() {
    const container = document.getElementById('before-after-container');
    const afterImageWrapper = document.getElementById('after-image-wrapper');
    const sliderHandle = document.getElementById('slider-handle');

    if (!container || !afterImageWrapper || !sliderHandle) return;

    let isSliding = false;

    const slide = (clientX) => {
      const rect = container.getBoundingClientRect();
      let pos = clientX - rect.left;
      pos = Math.max(0, Math.min(pos, rect.width));
      const percentage = (pos / rect.width) * 100;

      afterImageWrapper.style.width = `${percentage}%`;
      sliderHandle.style.left = `${percentage}%`;
    };

    container.addEventListener('mousedown', () => isSliding = true);
    window.addEventListener('mouseup', () => isSliding = false);
    container.addEventListener('mousemove', (e) => {
      if (isSliding) slide(e.clientX);
    });

    // Touch events for mobile
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) slide(e.touches[0].clientX);
    });
  },

  /**
   * Cho phép Sales Tải Lên Ảnh Thật Mới Từ Điện Thoại
   */
  initImageUploader: function() {
    const uploadInput = document.getElementById('real-photo-upload-input');
    uploadInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto = {
          title: `Ảnh chụp thật (${new Date().toLocaleTimeString('vi-VN')})`,
          category: "Ảnh Showroom mới",
          desc: "Được tải lên trực tiếp từ thiết bị của nhân viên tư vấn.",
          url: event.target.result
        };

        if (window.currentCarData) {
          window.currentCarData.realPhotos.unshift(newPhoto);
          this.renderRealGallery(window.currentCarData.realPhotos);
          if (window.showToast) window.showToast("Đã thêm ảnh chụp thật thành công!");
        }
      };
      reader.readAsDataURL(file);
    });
  }
};
