/**
 * SUPABASE CLOUD SQL (POSTGRESQL) DATA SERVICE
 * Tables: B20Customer, B20Vehicle, B20Quotation
 */

const SupabaseConfig = {
  url: localStorage.getItem('supabase_url') || '',
  anonKey: localStorage.getItem('supabase_anon_key') || '',
  client: null,

  init: function() {
    if (this.url && this.anonKey && typeof supabase !== 'undefined') {
      try {
        this.client = supabase.createClient(this.url, this.anonKey);
        console.log("Supabase Client initialized successfully!");
      } catch (e) {
        console.error("Supabase init error:", e);
      }
    }
  },

  setCredentials: function(url, anonKey) {
    this.url = url.trim();
    this.anonKey = anonKey.trim();
    localStorage.setItem('supabase_url', this.url);
    localStorage.setItem('supabase_anon_key', this.anonKey);
    this.init();
  },

  isConfigured: function() {
    return !!(this.url && this.anonKey && this.client);
  }
};

const SupabaseService = {
  /**
   * 1. BẢNG B20Vehicle: Lấy danh sách dòng xe
   */
  getVehicles: async function() {
    if (!SupabaseConfig.client) return null;
    const { data, error } = await SupabaseConfig.client
      .from('B20Vehicle')
      .select('*')
      .order('CreatedAt', { ascending: false });

    if (error) {
      console.error("Supabase getVehicles error:", error);
      throw error;
    }
    return data;
  },

  /**
   * Thêm hoặc cập nhật dòng xe vào B20Vehicle
   */
  saveVehicle: async function(vehicle) {
    if (!SupabaseConfig.client) return null;
    const { data, error } = await SupabaseConfig.client
      .from('B20Vehicle')
      .upsert(vehicle, { onConflict: 'VehicleCode' })
      .select();

    if (error) console.warn("Supabase saveVehicle notice:", error);
    return data;
  },

  /**
   * Xóa dòng xe khỏi B20Vehicle
   */
  deleteVehicle: async function(vehicleCode) {
    if (!SupabaseConfig.client) return null;
    const { data, error } = await SupabaseConfig.client
      .from('B20Vehicle')
      .delete()
      .eq('VehicleCode', vehicleCode);

    if (error) console.warn("Supabase deleteVehicle notice:", error);
    return data;
  },

  /**
   * 2. BẢNG B20Customer: Lưu thông tin khách hàng
   */
  saveCustomer: async function(customerData) {
    if (!SupabaseConfig.client) return null;
    const { data, error } = await SupabaseConfig.client
      .from('B20Customer')
      .insert([customerData])
      .select();

    if (error) {
      console.error("Supabase saveCustomer error:", error);
      return null;
    }
    return data && data[0] ? data[0] : null;
  },

  /**
   * 3. BẢNG B20Quotation: Tạo báo giá mới & liên kết khách hàng
   */
  createQuotation: async function(quoteData) {
    if (!SupabaseConfig.client) return null;
    
    // 1. Lưu khách hàng vào B20Customer trước
    let customerId = null;
    try {
      const custRes = await this.saveCustomer({
        FullName: quoteData.customerName,
        Phone: quoteData.customerPhone,
        Province: quoteData.province || quoteData.provinceId,
        SalesConsultant: quoteData.salesName,
        Status: 'Đã nhận báo giá'
      });
      if (custRes) customerId = custRes.CustomerID;
    } catch (e) {}

    // 2. Lưu vào B20Quotation
    const record = {
      QuoteID: quoteData.quoteId,
      CustomerID: customerId,
      CustomerName: quoteData.customerName,
      CustomerPhone: quoteData.customerPhone,
      CarName: quoteData.carName,
      ColorName: quoteData.colorName || 'Đỏ Pha Lê',
      Province: quoteData.province || quoteData.provinceId,
      ListPrice: quoteData.listPrice,
      DiscountAmount: quoteData.discount,
      InvoicePrice: quoteData.invoicePrice,
      TotalOnTheRoad: quoteData.totalOnTheRoad,
      DepositAmount: quoteData.depositAmount || 20000000,
      DepositStatus: 'sent',
      SalesName: quoteData.salesName,
      SalesPhone: quoteData.salesPhone,
      Showroom: quoteData.showroom
    };

    const { data, error } = await SupabaseConfig.client
      .from('B20Quotation')
      .upsert([record], { onConflict: 'QuoteID' })
      .select();

    if (error) {
      console.warn("Supabase createQuotation notice:", error);
    }
    return data;
  },

  /**
   * Xóa báo giá khỏi B20Quotation
   */
  deleteQuotation: async function(quoteId) {
    if (!SupabaseConfig.client) return null;
    const { data, error } = await SupabaseConfig.client
      .from('B20Quotation')
      .delete()
      .eq('QuoteID', quoteId);

    if (error) console.warn("Supabase deleteQuotation notice:", error);
    return data;
  },

  /**
   * Lấy chi tiết báo giá theo QuoteID
   */
  getQuotationById: async function(quoteId) {
    if (!SupabaseConfig.client) return null;
    const { data, error } = await SupabaseConfig.client
      .from('B20Quotation')
      .select('*')
      .eq('QuoteID', quoteId)
      .single();

    if (error) return null;
    return data;
  },

  /**
   * Cập nhật trạng thái khi khách hàng quét mã cọc VietQR thành công
   */
  confirmDeposit: async function(quoteId) {
    if (!SupabaseConfig.client) return null;
    const { data, error } = await SupabaseConfig.client
      .from('B20Quotation')
      .update({
        DepositStatus: 'deposit_received',
        DepositedAt: new Date().toISOString()
      })
      .eq('QuoteID', quoteId)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Lấy danh sách toàn bộ báo giá
   */
  getAllQuotations: async function() {
    if (!SupabaseConfig.client) return [];
    const { data, error } = await SupabaseConfig.client
      .from('B20Quotation')
      .select('*')
      .order('CreatedAt', { ascending: false });

    if (error) return [];
    return data;
  }
};

// Khởi chạy khi script nạp xong
SupabaseConfig.init();
