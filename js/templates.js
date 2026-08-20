/**
 * THƯ VIỆN BIỂU MẪU NHÂN SỰ & KẾ TOÁN CHUẨN
 */

const HR_TEMPLATES = [
  {
    id: "hop-dong-lao-dong",
    title: "Hợp đồng Lao động (Chuẩn Bộ luật Lao động)",
    category: "Hợp đồng",
    desc: "Mẫu hợp đồng lao động xác định / không xác định thời hạn chuẩn chỉnh theo quy định mới nhất.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

HỢP ĐỒNG LAO ĐỘNG
Số: ......./HĐLĐ-202...

Hôm nay, ngày ..... tháng ..... năm 202..., tại trụ sở Công ty .....................................................
Chúng tôi gồm:

NGƯỜI SỬ DỤNG LAO ĐỘNG (BÊN A):
- Tên Doanh nghiệp: ..........................................................................................
- Đại diện bởi: Ông/Bà ........................................ Chức vụ: .................................
- Mã số thuế: ....................................................................................................
- Địa chỉ: ..........................................................................................................

NGƯỜI LAO ĐỘNG (BÊN B):
- Ông/Bà: ..........................................................................................................
- Sinh ngày: ...../...../......... Quốc tịch: Việt Nam
- CCCD/CMND số: ................................. Cấp ngày: ...../...../......... Nơi cấp: .........
- Địa chỉ thường trú: ........................................................................................
- Nơi ở hiện tại: ..............................................................................................

Hai bên cùng thỏa thuận ký kết Hợp đồng lao động với các điều khoản sau:

ĐIỀU 1: THỜI HẠN VÀ CÔNG VIỆC HỢP ĐỒNG
1. Loại hợp đồng lao động: Hợp đồng lao động xác định thời hạn (..... tháng) kể từ ngày ...../...../202... đến ngày ...../...../202...
2. Địa điểm làm việc: ........................................................................................
3. Chức danh chuyên môn / Vị trí: .....................................................................
4. Công việc phải làm: Thực hiện theo Bản mô tả công việc của vị trí.

ĐIỀU 2: CHẾ ĐỘ LÀM VIỆC
1. Thời giờ làm việc: 8 giờ/ngày, từ thứ Hai đến thứ Sáu (hoặc thứ Bảy theo quy định công ty).
2. Doanh nghiệp cấp phát trang thiết bị, phương tiện làm việc cần thiết theo yêu cầu công việc.

ĐIỀU 3: NGHĨA VỤ VÀ QUYỀN LỢI CỦA NGƯỜI LAO ĐỘNG
1. Quyền lợi:
- Mức lương chính: ........................................... VNĐ/tháng (Bằng chữ: ..........................................).
- Phụ cấp (nếu có): .......................................... VNĐ/tháng.
- Hình thức trả lương: Chuyển khoản qua tài khoản ngân hàng vào ngày ..... hàng tháng.
- Chế độ nâng lương: Theo quy chế đánh giá và quy định của Công ty.
- Tiền thưởng, phúc lợi: Theo quy chế tài chính và kết quả kinh doanh của Doanh nghiệp.
- Chế độ bảo hiểm: Được tham gia BHXH, BHYT, BHTN theo đúng quy định của pháp luật.
- Nghỉ phép năm: 12 ngày phép/năm hưởng nguyên lương.
2. Nghĩa vụ:
- Hoàn thành công việc được giao với tinh thần trách nhiệm cao.
- Chấp hành nghiêm túc Nội quy lao động, An toàn lao động và bảo mật thông tin kinh doanh của Công ty.

ĐIỀU 4: ĐIỀU KHOẢN THI HÀNH
Hợp đồng này được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.

ĐẠI DIỆN BÊN A                                         ĐẠI DIỆN BÊN B
(Ký, ghi rõ họ tên & đóng dấu)                         (Ký, ghi rõ họ tên)`
  },
  {
    id: "hop-dong-thu-viec",
    title: "Hợp đồng Thử việc",
    category: "Hợp đồng",
    desc: "Mẫu thỏa thuận thử việc theo quy định (thời gian thử việc 30 - 60 ngày, lương tối thiểu 85%).",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

HỢP ĐỒNG THỬ VIỆC
Số: ......./HĐTV-202...

Hôm nay, ngày ..... tháng ..... năm 202..., chúng tôi gồm:

BÊN TUYỂN DỤNG (BÊN A):
- Công ty: .........................................................................................................
- Đại diện bởi: Ông/Bà ........................................ Chức vụ: .................................
- Địa chỉ: ..........................................................................................................

BÊN THỬ VIỆC (BÊN B):
- Ông/Bà: ..........................................................................................................
- Sinh ngày: ...../...../......... CCCD số: ................................................................
- Địa chỉ: ..........................................................................................................

Hai bên thống nhất ký kết Hợp đồng thử việc với các điều khoản sau:

ĐIỀU 1: THỜI GIAN VÀ VỊ TRÍ THỬ VIỆC
1. Vị trí thử việc: ................................................................................................
2. Thời gian thử việc: ..... tháng (từ ngày ...../...../202... đến ngày ...../...../202...).

ĐIỀU 2: TIỀN LƯƠNG VÀ CHẾ ĐỘ ĐÃI NGỘ
1. Mức lương thử việc: ................................ VNĐ/tháng (tương đương 85% mức lương chính thức theo Điều 26 BLLĐ).
2. Thời gian làm việc: 8 giờ/ngày, từ ..... giờ đến ..... giờ, từ thứ ..... đến thứ ......

ĐIỀU 3: KẾT THÚC THỜI GIAN THỬ VIỆC
Khi hết thời gian thử việc, Bên A sẽ thông báo kết quả. Nếu đạt yêu cầu, hai bên sẽ tiến hành ký kết Hợp đồng lao động chính thức.

ĐẠI DIỆN BÊN A                                         ĐẠI DIỆN BÊN B
(Ký, ghi rõ họ tên)                                    (Ký, ghi rõ họ tên)`
  },
  {
    id: "bien-ban-thanh-ly-hdld",
    title: "Biên bản Thanh lý Hợp đồng Lao động",
    category: "Chấm dứt HĐ",
    desc: "Biên bản chốt công nợ, tiền lương còn lại, hoàn trả tài sản và chốt sổ BHXH khi nhân sự nghỉ việc.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

BIÊN BẢN THANH LÝ HỢP ĐỒNG LAO ĐỘNG

Căn cứ Hợp đồng lao động số ......./HĐLĐ ký ngày ...../...../202...;
Căn cứ Quyết định chấm dứt HĐLĐ số ......./QĐ-CT ngày ...../...../202...;

Hôm nay, ngày ..... tháng ..... năm 202..., tại Văn phòng Công ty .....................................
Hai bên gồm:
- BÊN A (Công ty): ................................................. Đại diện: Ông/Bà .................................
- BÊN B (Người lao động): Ông/Bà .......................... Chức vụ: .........................................

Sau khi tiến hành kiểm tra và đối chiếu các quyền lợi, nghĩa vụ, hai bên thống nhất:

1. BÀN GIAO CÔNG VIỆC VÀ TÀI SẢN:
- Bên B đã bàn giao toàn bộ tài liệu, hồ sơ, máy tính, thẻ nhân viên và các tài sản thuộc sở hữu của Bên A.
- Tình trạng tài sản: Đầy đủ, hoạt động bình thường, không xảy ra hư hại.

2. QUYẾT TOÁN CÁC KHOẢN TÀI CHÍNH:
- Tiền lương tháng làm việc cuối cùng: ....................................... VNĐ.
- Tiền thanh toán số ngày phép năm chưa nghỉ (..... ngày): ..................... VNĐ.
- Các khoản trợ cấp / thưởng khác (nếu có): ................................... VNĐ.
- Các khoản Bên B phải hoàn trả / tạm ứng (nếu có): ........................... VNĐ.
- Tổng số tiền thực nhận còn lại: ........................................... VNĐ.
Hình thức chi trả: Chuyển khoản vào tài khoản ngân hàng của Bên B trước ngày ...../...../202...

3. TRÁCH NHIỆM BẢO HIỂM:
Bên A có trách nhiệm hoàn tất thủ tục chốt sổ BHXH và bàn giao lại sổ BHXH cho Bên B đúng thời hạn.

Biên bản này được lập thành 02 bản có giá trị như nhau.

ĐẠI DIỆN CÔNG TY                                       NGƯỜI LAO ĐỘNG
(Ký, đóng dấu)                                         (Ký, ghi rõ họ tên)`
  },
  {
    id: "don-xin-nghi-phep",
    title: "Đơn xin Nghỉ phép (Phép năm / Nghỉ không lương)",
    category: "Hành chính",
    desc: "Mẫu đơn xin nghỉ phép chuẩn dành cho nhân viên kèm phần bàn giao công việc.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

ĐƠN XIN NGHỈ PHÉP

Kính gửi:
- Ban Giám đốc Công ty ........................................................................................
- Trưởng bộ phận .................................................................................................

Tôi tên là: ..............................................................................................................
Chức vụ / Vị trí: ................................................. Bộ phận: ........................................
Mã số nhân viên: ...................................................................................................

Tôi làm đơn này xin phép được nghỉ:
- Từ ngày: ...../...../202... đến hết ngày ...../...../202... (Tổng cộng: ..... ngày).
- Lý do xin nghỉ: ....................................................................................................
- Loại phép: [ ] Phép năm   [ ] Nghỉ việc riêng có lương   [ ] Nghỉ không hưởng lương

BÀN GIAO CÔNG VIỆC:
Trong thời gian nghỉ phép, tôi đã bàn giao công việc lại cho:
- Ông/Bà: ................................................. Chức danh: ...........................................
- Nội dung bàn giao: ............................................................................................
- Số điện thoại liên hệ khi khẩn cấp: ...................................................................

Kính mong Ban Giám đốc và Trưởng bộ phận xem xét phê duyệt.
Xin chân thành cảm ơn!

NGƯỜI BÀN GIAO                TRƯỞNG BỘ PHẬN                   NGƯỜI LÀM ĐƠN
(Ký, ghi rõ họ tên)           (Ký duyệt)                        (Ký, ghi rõ họ tên)`
  },
  {
    id: "giay-de-nghi-tam-ung",
    title: "Giấy đề nghị Tạm ứng tiền lương / Công tác phí",
    category: "Kế toán",
    desc: "Mẫu đề nghị tạm ứng tiền dùng cho nhân sự đi công tác hoặc ứng lương trước kỳ.",
    content: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---o0o---

GIẤY ĐỀ NGHỊ TẠM ỨNG
Số: ......./TU-202...

Kính gửi:
- Ban Giám đốc Công ty ........................................................................................
- Phòng Kế toán - Tài chính

Tôi tên là: ..............................................................................................................
Bộ phận / Phòng ban: ............................................ Chức vụ: .................................

Đề nghị cho tôi được tạm ứng số tiền:
- Bằng số: .................................................... VNĐ.
- Bằng chữ: ............................................................................................................
- Lý do tạm ứng: [ ] Tạm ứng công tác phí     [ ] Tạm ứng tiền lương tháng .....
- Chi tiết mục đích: ............................................................................................
- Thời hạn hoàn ứng / thanh toán chứng từ: Ngày ...../...../202...

Kính mong Ban Giám đốc và Phòng Kế toán phê duyệt giải ngân.

GIÁM ĐỐC                     KẾ TOÁN TRƯỞNG                   NGƯỜI ĐỀ NGHỊ
(Ký duyệt)                   (Ký xác nhận)                    (Ký, ghi rõ họ tên)`
  },
  {
    id: "quyet-dinh-tang-luong",
    title: "Quyết định Tăng lương / Điều chỉnh thu nhập",
    category: "Nhân sự",
    desc: "Mẫu quyết định nâng bậc lương hoặc điều chỉnh mức lương chính thức cho người lao động.",
    content: `CÔNG TY ........................................       CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Số: ......./QĐ-TL-202...                           Độc lập - Tự do - Hạnh phúc
                                                -------------------------
                                                ..., ngày ..... tháng ..... năm 202...

QUYẾT ĐỊNH
Về việc điều chỉnh mức lương của người lao động

TỔNG GIÁM ĐỐC CÔNG TY ....................................................

- Căn cứ Bộ luật Lao động số 45/2019/QH14;
- Căn cứ Điều lệ tổ chức và hoạt động của Công ty;
- Căn cứ kết quả đánh giá năng lực và những đóng góp của Người lao động;
- Xét đề nghị của Trưởng phòng Hành chính - Nhân sự;

QUYẾT ĐỊNH:

ĐIỀU 1: Điều chỉnh mức lương chính thức đối với:
- Ông/Bà: ..........................................................................................................
- Chức vụ / Vị trí: ............................................. Phòng ban: ................................
- Mức lương cũ: ............................................... VNĐ/tháng.
- MỨC LƯƠNG MỚI: ............................................ VNĐ/tháng.
(Bằng chữ: .......................................................................................................)

ĐIỀU 2: Thời gian áp dụng
Mức lương mới được áp dụng kể từ kỳ lương ngày ..... tháng ..... năm 202...

ĐIỀU 3: Trách nhiệm thi hành
Phòng Kế toán, Phòng Hành chính - Nhân sự và Ông/Bà có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.

                                                            TỔNG GIÁM ĐỐC
                                                    (Ký tên và đóng dấu)`
  }
];
