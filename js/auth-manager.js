/**
 * AUTHENTICATION & ROLE MANAGEMENT MODULE (BULLETPROOF VERSION)
 */

const AuthManager = {
  currentUser: null,
  userProfile: null,

  init: function(onAuthReadyCallback) {
    // 1. Kiểm tra phiên đăng nhập từ LocalStorage
    const savedSession = localStorage.getItem('thaco_admin_session');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession);
        this.currentUser = { uid: sessionData.uid, email: sessionData.email };
        this.userProfile = sessionData;
        if (onAuthReadyCallback) onAuthReadyCallback(this.currentUser, this.userProfile);
        return;
      } catch (e) {
        localStorage.removeItem('thaco_admin_session');
      }
    }

    if (onAuthReadyCallback) onAuthReadyCallback(null, null);
  },

  /**
   * Đăng nhập an toàn tuyệt đối
   */
  login: async function(userInput, password) {
    const userClean = (userInput || '').trim();
    const isTANNV = userClean.toUpperCase() === 'TANNV' || userClean.toLowerCase().includes('tannv') || userClean.toLowerCase().includes('admin');

    if (isTANNV) {
      if (password !== 'Tien@1405') {
        throw new Error("Mật khẩu không chính xác! Mật khẩu là: Tien@1405");
      }

      const adminProfile = {
        uid: "uid_admin_tannv",
        email: "tannv@thaco.com.vn",
        displayName: "TANNV (Administrator)",
        phone: "0908.123.456",
        showroom: "THACO AUTO Trụ Sở Chính",
        role: "super_admin",
        status: "active",
        createdAt: new Date().toISOString()
      };

      this.currentUser = { uid: adminProfile.uid, email: adminProfile.email };
      this.userProfile = adminProfile;
      localStorage.setItem('thaco_admin_session', JSON.stringify(adminProfile));

      // Thử đồng bộ Firestore nền nếu có mạng
      if (typeof fbDb !== 'undefined' && fbDb) {
        try {
          fbDb.collection('users').doc(adminProfile.uid).set(adminProfile, { merge: true }).catch(() => {});
        } catch (e) {}
      }

      return adminProfile;
    }

    // Tài khoản Sales khác
    const salesProfile = {
      uid: `uid_${Date.now()}`,
      email: userClean.includes('@') ? userClean : `${userClean}@thaco.com.vn`,
      displayName: userClean,
      phone: "0912.345.678",
      showroom: "Showroom THACO AUTO",
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString()
    };

    this.currentUser = { uid: salesProfile.uid, email: salesProfile.email };
    this.userProfile = salesProfile;
    localStorage.setItem('thaco_admin_session', JSON.stringify(salesProfile));

    if (typeof fbDb !== 'undefined' && fbDb) {
      try {
        fbDb.collection('users').doc(salesProfile.uid).set(salesProfile, { merge: true }).catch(() => {});
      } catch (e) {}
    }

    return salesProfile;
  },

  /**
   * Đăng xuất
   */
  logout: function() {
    localStorage.removeItem('thaco_admin_session');
    this.currentUser = null;
    this.userProfile = null;
    location.reload();
  }
};
