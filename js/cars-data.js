/**
 * DỮ LIỆU CÁC DÒNG XE THACO AUTO & ĐỊNH MỨC PHÍ LĂN BÁNH
 * (Mazda, Kia, Peugeot, BMW)
 */

const THACO_CARS_DATA = {
  // Danh sách dòng xe
  models: {
    "mazda-cx5": {
      id: "mazda-cx5",
      brand: "Mazda",
      name: "Mazda CX-5 2.0L Premium Active",
      segment: "C-SUV 5 Chỗ",
      listPrice: 829000000,
      defaultDiscount: 30000000,
      seats: 5,
      engine: "SkyActiv-G 2.0L (154 Hp / 200 Nm)",
      transmission: "Tự động 6 cấp (6AT) có chế độ Sport",
      warranty: "5 năm hoặc 150.000 km",
      colors: [
        {
          id: "soul-red",
          name: "Đỏ Pha Lê (Soul Red Crystal)",
          hex: "#b31010",
          imageExterior: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
          extraFee: 8000000
        },
        {
          id: "snowflake-white",
          name: "Trắng Ngọc Trai (Snowflake White)",
          hex: "#f3f4f6",
          imageExterior: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
          extraFee: 4000000
        },
        {
          id: "machine-grey",
          name: "Xám Ánh Kim (Machine Grey)",
          hex: "#4b5563",
          imageExterior: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
          extraFee: 4000000
        },
        {
          id: "jet-black",
          name: "Đen Huyền Bí (Jet Black)",
          hex: "#111827",
          imageExterior: "https://images.unsplash.com/photo-1617814076668-8dfc6cb05943?auto=format&fit=crop&w=1200&q=80",
          extraFee: 0
        },
        {
          id: "deep-crystal-blue",
          name: "Xanh Đậm (Deep Crystal Blue)",
          hex: "#1e3a8a",
          imageExterior: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
          extraFee: 0
        }
      ],
      imageInterior: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      hotspots: [
        {
          id: "headlight",
          x: 22,
          y: 65,
          title: "Đèn LED Matrix Thích Ứng (ALH)",
          desc: "Hệ thống đèn pha thông minh tự động chia vùng ánh sáng, chống chói cho xe đối diện và mở rộng góc chiếu khi vào cua.",
          image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "wheel",
          x: 32,
          y: 78,
          title: "Mâm Đúc Hợp Kim 19 Inch Thể Thao",
          desc: "Thiết kế chấu kép đa chiều sơn ánh kim Goshu, đi kèm lốp Toyo cao cấp 225/55R19 êm ái.",
          image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "mirror",
          x: 48,
          y: 48,
          title: "Camera 360° & Cảnh Báo Điểm Mù (BSM)",
          desc: "Tích hợp trên gương chiếu hậu chống chói tự động, hiển thị toàn cảnh sắc nét trên màn hình trung tâm.",
          image: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "sunroof",
          x: 58,
          y: 35,
          title: "Cửa Sổ Trời Chỉnh Điện Chống Kẹt",
          desc: "Đón trọn ánh sáng tự nhiên và gió trời trong những chuyến đi du lịch dã ngoại.",
          image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "radar",
          x: 15,
          y: 52,
          title: "Radar Gói An Toàn i-Activsense",
          desc: "Hỗ trợ phanh tự động thông minh (SBS), cảnh báo lệch làn (LDWS), giữ làn đường (LAS) và kiểm soát hành trình thích ứng Radar (MRCC).",
          image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80"
        }
      ],
      realPhotos: [
        {
          title: "Ảnh thực tế xe tại Showroom THACO",
          category: "Ngoại thất",
          desc: "Xe mới 100% nguyên đai nguyên kiện, nước sơn đỏ Soul Red bóng loáng dưới đèn showroom.",
          url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80"
        },
        {
          title: "Khoang lái ghế da Nappa nguyên seal",
          category: "Nội thất",
          desc: "Ghế da cao cấp có sưởi và làm mát, nilong bảo vệ vô lăng và màn hình chưa bóc.",
          url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80"
        },
        {
          title: "Cốp điện thông minh & Bộ phụ kiện theo xe",
          category: "Cốp & Phụ kiện",
          desc: "Tích hợp đá cốp rảnh tay (Hands-free Access), tặng kèm thảm cốp chống thấm.",
          url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },

    "kia-carnival": {
      id: "kia-carnival",
      brand: "Kia",
      name: "Kia Carnival 2.2D Signature (7 Chỗ)",
      segment: "SUV Đô Thị Cao Cấp 7 Chỗ",
      listPrice: 1389000000,
      defaultDiscount: 40000000,
      seats: 7,
      engine: "Smartstream D2.2L Diesel (199 Hp / 440 Nm)",
      transmission: "Tự động 8 cấp (8AT) - Dẫn động cầu trước",
      warranty: "5 năm không giới hạn km",
      colors: [
        {
          id: "white-pearl",
          name: "Trắng Ngọc Trai (Glacial White)",
          hex: "#f9fafb",
          imageExterior: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
          extraFee: 0
        },
        {
          id: "aurora-black",
          name: "Đen Ánh Kim (Aurora Black)",
          hex: "#0f172a",
          imageExterior: "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80",
          extraFee: 0
        },
        {
          id: "astro-grey",
          name: "Xám Bạc (Astro Grey)",
          hex: "#64748b",
          imageExterior: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
          extraFee: 0
        }
      ],
      imageInterior: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
      hotspots: [
        {
          id: "sliding-door",
          x: 55,
          y: 60,
          title: "Cửa Lùa Điện Thông Minh Tự Mở",
          desc: "Tự động mở cửa khi người cầm chìa khóa đứng gần 3 giây, chống kẹt an toàn tuyệt đối.",
          image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80"
        },
        {
          id: "vip-seats",
          x: 45,
          y: 45,
          title: "Hàng Ghế 2 Thương Gia (VIP Lounge)",
          desc: "Chỉnh điện 8 hướng, ngả lưng 1 chạm không trọng lực, có đệm đỡ bắp chân, sưởi và làm mát.",
          image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"
        }
      ],
      realPhotos: [
        {
          title: "Kia Carnival màu trắng sang trọng tại kho THACO",
          category: "Ngoại thất",
          desc: "Thiết kế bề thế, mặt ca-lăng mạ chrome kim cương sắc sảo.",
          url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    },

    "peugeot-408": {
      id: "peugeot-408",
      brand: "Peugeot",
      name: "Peugeot 408 GT 1.6L Turbo",
      segment: "SUV Coupe Phong Cách Pháp",
      listPrice: 1199000000,
      defaultDiscount: 35000000,
      seats: 5,
      engine: "1.6L Turbo PureTech (218 Hp / 300 Nm)",
      transmission: "Tự động 8 cấp EAT8 cao cấp",
      warranty: "5 năm hoặc 150.000 km",
      colors: [
        {
          id: "obsidian-black",
          name: "Xanh Obsession Độc Bản",
          hex: "#0e7490",
          imageExterior: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
          extraFee: 0
        },
        {
          id: "pearl-white",
          name: "Trắng Ngọc Trai Nacre",
          hex: "#f8fafc",
          imageExterior: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80",
          extraFee: 0
        }
      ],
      imageInterior: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      hotspots: [
        {
          id: "icockpit",
          x: 40,
          y: 50,
          title: "Khoang Lái Peugeot 3D i-Cockpit",
          desc: "Đồng hồ kỹ thuật số 3D hiển thị đa tầng không gian, vô lăng vát D-cut thể thao.",
          image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80"
        }
      ],
      realPhotos: [
        {
          title: "Peugeot 408 GT phong cách SUV Fastback",
          category: "Ngoại thất",
          desc: "Đèn định vị nanh sư tử và logo Peugeot thế hệ mới.",
          url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80"
        }
      ]
    }
  },

  // Danh mục tỉnh thành tính thuế và biển số
  provinces: [
    { id: "hanoi", name: "Hà Nội", taxRate: 0.12, plateFee: 20000000 },
    { id: "hcm", name: "TP. Hồ Chí Minh", taxRate: 0.10, plateFee: 20000000 },
    { id: "danang", name: "Đà Nẵng", taxRate: 0.10, plateFee: 1000000 },
    { id: "haiphong", name: "Hải Phòng", taxRate: 0.12, plateFee: 1000000 },
    { id: "quangninh", name: "Quảng Ninh", taxRate: 0.12, plateFee: 1000000 },
    { id: "binhduong", name: "Bình Dương", taxRate: 0.10, plateFee: 1000000 },
    { id: "dongnai", name: "Đồng Nai", taxRate: 0.10, plateFee: 1000000 },
    { id: "cantho", name: "Cần Thơ", taxRate: 0.10, plateFee: 1000000 },
    { id: "other", name: "Các Tỉnh / Thành phố khác", taxRate: 0.10, plateFee: 1000000 }
  ],

  // Các chi phí cố định theo quy định
  mandatoryFees: {
    inspection: 90000,         // Phí đăng kiểm
    roadMaintenance: 1560000,  // Phí bảo trì đường bộ (1 năm xe cá nhân)
    tnds5Seats: 480700,        // Bảo hiểm TNDS xe 5 chỗ
    tnds7Seats: 873400,        // Bảo hiểm TNDS xe 7 chỗ
    physicalInsuranceRate: 0.013, // Bảo hiểm thân vỏ (1.3%)
    serviceFee: 2500000        // Phí dịch vụ đăng ký cà số khung số máy
  },

  // Gói quà tặng chính hãng THACO
  defaultGifts: [
    { id: "film", name: "Dán phim cách nhiệt Llumar USA chính hãng (Bảo hành 5 năm)", value: 8500000, selected: true },
    { id: "floor-mat", name: "Bộ thảm lót sàn da 5D cao cấp logo THACO AUTO", value: 1800000, selected: true },
    { id: "dashcam", name: "Camera hành trình Full HD cảnh báo biển báo giao thông", value: 3500000, selected: true },
    { id: "umbrella", name: "Bộ quà tặng Showroom: Dù che mưa, ví da hồ sơ, hoa tươi nhận xe", value: 1200000, selected: true },
    { id: "ceramic", name: "Gói phủ Ceramic bóng gương 3 lớp bảo vệ sơn xe", value: 6000000, selected: false },
    { id: "maintenance-free", name: "Miễn phí tiền công bảo dưỡng 3 cấp (1.000km, 10.000km, 20.000km)", value: 2500000, selected: true }
  ],

  // Thông tin Showroom THACO mặc định
  showroom: {
    name: "THACO AUTO TRƯỜNG HẢI",
    dealerName: "Showroom THACO AUTO Bình Tân / Hà Nội",
    address: "Số 75 Võ Văn Kiệt, Phường An Lạc, Quận Bình Tân, TP. Hồ Chí Minh",
    hotline: "0908.123.456",
    bankName: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
    bankAccount: "0071001234567",
    accountHolder: "CONG TY CO PHAN O TO TRUONG HAI - THACO AUTO",
    depositAmount: 20000000
  }
};
