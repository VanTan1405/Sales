/**
 * MODULE ADMINISTRATOR (SUPER ADMIN)
 * Quản lý & duyệt cấp quyền tài khoản, thống kê doanh thu toàn showroom, cài đặt ngân hàng VietQR
 */

const SuperAdminModule = {
  usersList: [],
  quotationsList: [],

  init: function() {
    this.bindEvents();
    this.loadAllUsers();
    this.loadSystemStats();
    this.loadShowroomSettings();
  },

  bindEvents: function() {
    // Lưu cài đặt Showroom & VietQR
    const settingsForm = document.getElementById('super-settings-form');
    settingsForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.saveShowroomSettings();
    });

    // Lọc trạng thái thành viên
    const filterSelect = document.getElementById('user-status-filter');
    filterSelect?.addEventListener('change', () => {
      this.renderUsersTable();
    });
  },

  /**
   * Tải danh sách toàn bộ người dùng & sales
   */
  loadAllUsers: function() {
    if (!fbDb) return;

    fbDb.collection('users').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
      this.usersList = [];
      snapshot.forEach(doc => {
        this.usersList.push({ id: doc.id, ...doc.data() });
      });
      this.renderUsersTable();
      this.updateUserStats();
    }, (err) => {
      console.warn("Lỗi tải danh sách người dùng:", err);
    });
  },

  /**
   * Render bảng danh sách thành viên & nút duyệt
   */
  renderUsersTable: function() {
    const tbody = document.getElementById('super-users-table-body');
    const filterVal = document.getElementById('user-status-filter')?.value || 'all';
    if (!tbody) return;

    let filtered = this.usersList;
    if (filterVal !== 'all') {
      filtered = this.usersList.filter(u => u.status === filterVal);
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-slate-500">Không có tài khoản nào phù hợp bộ lọc.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(u => {
      const isPending = u.status === 'pending';
      const isActive = u.status === 'active';
      const isSuper = u.role === 'super_admin';

      const statusBadge = isPending 
        ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">Chờ Phê Duyệt</span>'
        : (isActive 
            ? '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Đang Hoạt Động</span>'
            : '<span class="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Đã Khóa</span>');

      const roleBadge = isSuper 
        ? '<span class="px-2 py-0.5 rounded text-xs font-black bg-purple-600 text-white shadow-sm"><i class="fa-solid fa-crown mr-1"></i>Administrator</span>'
        : '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">Sales Consultant</span>';

      return `
        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition text-xs sm:text-sm">
          <td class="px-4 py-3 font-bold text-white flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center font-bold text-blue-400 border border-blue-500/30">
              ${(u.displayName || u.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div>${u.displayName || 'Chưa đặt tên'}</div>
              <div class="text-[11px] text-slate-400 font-normal">${u.email}</div>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-300">${u.phone || 'Chưa cập nhật'}</td>
          <td class="px-4 py-3 text-slate-300">${u.showroom || 'THACO AUTO'}</td>
          <td class="px-4 py-3">${roleBadge}</td>
          <td class="px-4 py-3">${statusBadge}</td>
          <td class="px-4 py-3 text-right space-x-1 whitespace-nowrap">
            ${isPending ? `
              <button onclick="SuperAdminModule.approveUser('${u.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20">
                <i class="fa-solid fa-check mr-1"></i> Duyệt Cấp Quyền
              </button>
            ` : `
              <button onclick="SuperAdminModule.toggleUserStatus('${u.id}', '${u.status}')" class="px-2.5 py-1 rounded-lg ${isActive ? 'bg-slate-800 hover:bg-rose-950 text-rose-400' : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400'} text-xs font-medium transition border border-slate-700">
                ${isActive ? '<i class="fa-solid fa-ban mr-1"></i>Khóa' : '<i class="fa-solid fa-unlock mr-1"></i>Mở Khóa'}
              </button>
            `}
            <button onclick="SuperAdminModule.toggleRole('${u.id}', '${u.role}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-950 text-purple-400 text-xs font-medium transition border border-slate-700" title="Đổi quyền hạn">
              ${isSuper ? 'Chuyển Sales' : 'Thăng Administrator'}
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateUserStats: function() {
    const totalUsers = this.usersList.length;
    const pendingUsers = this.usersList.filter(u => u.status === 'pending').length;
    const activeUsers = this.usersList.filter(u => u.status === 'active').length;

    const countPendingEl = document.getElementById('super-stat-pending-users');
    const countActiveEl = document.getElementById('super-stat-active-users');
    const badgePending = document.getElementById('pending-badge-counter');

    if (countPendingEl) countPendingEl.textContent = pendingUsers;
    if (countActiveEl) countActiveEl.textContent = activeUsers;
    if (badgePending) {
      badgePending.textContent = pendingUsers;
      badgePending.classList.toggle('hidden', pendingUsers === 0);
    }
  },

  /**
   * Phê duyệt tài khoản
   */
  approveUser: async function(uid) {
    if (!fbDb) return;
    try {
      await fbDb.collection('users').doc(uid).update({
        status: 'active',
        approvedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      window.showToast("Đã phê duyệt và cấp quyền thành công cho tài khoản!");
    } catch (err) {
      alert("Lỗi khi duyệt tài khoản: " + err.message);
    }
  },

  /**
   * Khóa hoặc Mở khóa tài khoản
   */
  toggleUserStatus: async function(uid, currentStatus) {
    if (!fbDb) return;
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await fbDb.collection('users').doc(uid).update({ status: nextStatus });
      window.showToast(nextStatus === 'active' ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  },

  /**
   * Đổi quyền hạn (Role)
   */
  toggleRole: async function(uid, currentRole) {
    if (!fbDb) return;
    const nextRole = currentRole === 'super_admin' ? 'admin' : 'super_admin';
    try {
      await fbDb.collection('users').doc(uid).update({ role: nextRole });
      window.showToast("Đã cập nhật vai trò phân quyền thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  },

  /**
   * Thống kê toàn bộ Báo giá & Đơn cọc
   */
  loadSystemStats: function() {
    if (!fbDb) return;

    fbDb.collection('quotations').onSnapshot((snapshot) => {
      this.quotationsList = [];
      let totalDepositsCount = 0;
      let totalDepositMoney = 0;

      snapshot.forEach(doc => {
        const q = doc.data();
        this.quotationsList.push({ id: doc.id, ...q });
        if (q.status === 'deposit_received' || q.status === 'completed') {
          totalDepositsCount++;
          totalDepositMoney += (q.depositAmount || 20000000);
        }
      });

      const totalQuotesEl = document.getElementById('super-stat-total-quotes');
      const totalDepositsEl = document.getElementById('super-stat-total-deposits');
      const totalMoneyEl = document.getElementById('super-stat-total-money');

      if (totalQuotesEl) totalQuotesEl.textContent = this.quotationsList.length;
      if (totalDepositsEl) totalDepositsEl.textContent = totalDepositsCount;
      if (totalMoneyEl) totalMoneyEl.textContent = QuoteEngine.formatVND(totalDepositMoney);

      this.renderRecentDepositsTable();
    });
  },

  renderRecentDepositsTable: function() {
    const tbody = document.getElementById('super-deposits-table-body');
    if (!tbody) return;

    const depositQuotes = this.quotationsList
      .filter(q => q.status === 'deposit_received' || q.status === 'completed')
      .slice(0, 10);

    if (depositQuotes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-6 text-center text-slate-500">Chưa có giao dịch cọc nào phát sinh.</td></tr>`;
      return;
    }

    tbody.innerHTML = depositQuotes.map(q => `
      <tr class="border-b border-slate-800 text-xs">
        <td class="px-4 py-3 font-bold text-white">${q.customerName || 'Khách hàng'}</td>
        <td class="px-4 py-3 text-slate-300">${q.customerPhone || '-'}</td>
        <td class="px-4 py-3 font-semibold text-blue-400">${q.carName || 'Xe THACO'}</td>
        <td class="px-4 py-3 font-black text-emerald-400">${QuoteEngine.formatVND(q.depositAmount || 20000000)}</td>
        <td class="px-4 py-3 text-slate-400">${q.salesName || 'Sales'}</td>
      </tr>
    `).join('');
  },

  /**
   * Cài đặt tài khoản ngân hàng Showroom VietQR
   */
  loadShowroomSettings: async function() {
    if (!fbDb) return;
    try {
      const doc = await fbDb.collection('system_settings').doc('showroom').get();
      if (doc.exists) {
        const data = doc.data();
        document.getElementById('setting-bank-name').value = data.bankName || '';
        document.getElementById('setting-bank-account').value = data.bankAccount || '';
        document.getElementById('setting-account-holder').value = data.accountHolder || '';
        document.getElementById('setting-deposit-amount').value = (data.depositAmount || 20000000).toLocaleString('vi-VN');
      }
    } catch (err) {
      console.warn("Lỗi tải cấu hình Showroom:", err);
    }
  },

  saveShowroomSettings: async function() {
    if (!fbDb) return;
    try {
      const depositVal = Number(document.getElementById('setting-deposit-amount').value.replace(/\D/g, '')) || 20000000;
      const settings = {
        bankName: document.getElementById('setting-bank-name').value,
        bankAccount: document.getElementById('setting-bank-account').value,
        accountHolder: document.getElementById('setting-account-holder').value,
        depositAmount: depositVal,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await fbDb.collection('system_settings').doc('showroom').set(settings, { merge: true });
      window.showToast("Đã lưu cấu hình tài khoản ngân hàng Showroom thành công!");
    } catch (err) {
      alert("Lỗi lưu cấu hình: " + err.message);
    }
  }
};
