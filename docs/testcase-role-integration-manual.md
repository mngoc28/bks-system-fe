# Test Case Manual - Integration Giua Cac Role

## 1. Pham vi

Tai lieu nay bao phu cac luong lien thong giua cac role trong he thong:

- Khach public
- Khach luu tru BKS Stay
- Partner
- Admin

Cac nhom nghiep vu chinh:

- Public tao booking va partner xu ly booking
- Booking duoc dong bo sang Stay Portal
- Huy booking qua nhieu role
- Dich vu trong ky o giua stay va partner
- Hop dong luu tru giua stay, partner va admin
- Phe duyet partner onboarding
- Quan ly phong/phat hanh phong len public
- Doi soat va dong ky thanh toan
- Chat, ho tro va thong bao lien role

## 2. Moi truong va du lieu mau

- Base URL local de xuat: `http://localhost:5173`
- Chay local: `npm run dev`
- Tai khoan can chuan bi:
- 1 tai khoan admin hop le
- 1 tai khoan partner active
- 1 tai khoan partner pending/rejected
- 1 tai khoan BKS Stay hop le
- Du lieu mau nen co:
- It nhat 1 phong dang public va co the dat
- It nhat 1 phong private/deleted de test chan hien thi
- It nhat 1 booking pending
- It nhat 1 booking confirmed
- It nhat 1 booking checked-in
- It nhat 1 booking completed
- It nhat 1 booking dang cho huy
- It nhat 1 contract cho ky
- It nhat 1 yeu cau dich vu noi tru
- It nhat 1 ky doi soat `issued`

## 3. Nguyen tac test

- Test theo chuoi hanh dong xuyen role, khong test don le tung man hinh.
- Sau moi buoc cap nhat trang thai, mo portal role tiep theo de doi chieu du lieu.
- Ghi ro `booking_code`, `roomId`, `propertyId`, `partnerId`, `contractId`, `settlementId` trong qua trinh test de doi chieu.
- Kiem tra ca UI, route, toast, trang thai badge va du lieu filter/tim kiem.
- Neu co polling hoac delay dong bo, cho trong khoang hop ly roi refresh lai de xac nhan.

## 4. Danh sach test case

| TC ID | Luong lien role | Role tham gia | URL chinh | Tien dieu kien | Hanh dong test manual | Ket qua mong doi |
|---|---|---|---|---|---|---|
| INT-01 | Public tao booking moi | Public -> Partner -> Admin | `/booking/:roomId`, `/partner/bookings`, `/admin/booking-manage` | Room dang public va con kha dung | 1. Tao booking tu public 2. Ghi lai `booking_code` 3. Login partner mo danh sach booking 4. Login admin mo booking manage va tim theo ma | Booking moi xuat hien day du o partner va admin voi cung thong tin phong, ngay o, khach, tong tien |
| INT-02 | Booking pending duoc partner duyet | Public -> Partner -> Stay | `/my-bookings`, `/partner/bookings`, `/bks-stay/bookings/:id` | Da tao booking pending thanh cong | 1. Public tra cuu booking 2. Partner bam `Duyet` 3. Mo lai `my-bookings` 4. Login Stay va mo booking detail | Trang thai booking chuyen sang confirmed dong bo o public va stay, cac CTA phu hop duoc mo |
| INT-03 | Booking pending bi partner tu choi | Public -> Partner -> Admin | `/my-bookings`, `/partner/bookings`, `/admin/booking-manage` | Booking dang pending | 1. Partner tu choi booking va nhap ly do 2. Public tra cuu lai 3. Admin tim booking theo ma | Booking hien trang thai bi tu choi/da huy dung rule, ly do tu choi hien dung o admin neu co |
| INT-04 | Public tao booking, admin theo doi xuyen module | Public -> Admin | `/booking-success`, `/admin/dashboard`, `/admin/booking-manage` | He thong co dashboard KPI | 1. Tao booking moi 2. Mo admin dashboard 3. Kiem tra KPI va drill-down 4. Mo booking manage | So lieu dashboard va danh sach booking cua admin cap nhat them booking moi hoac hien sau refresh hop ly |
| INT-05 | Partner check-in booking da duyet | Partner -> Stay -> Admin | `/partner/bookings`, `/bks-stay/dashboard`, `/admin/booking-manage` | Booking confirmed du dieu kien check-in | 1. Partner bam `Check-in` 2. Mo Stay dashboard va booking detail 3. Admin mo booking manage | Booking chuyen sang dang o/checked-in tren ca 3 portal, Stay mo them thong tin noi tru, service, wifi neu co |
| INT-06 | Partner check-out booking | Partner -> Stay -> Admin | `/partner/bookings`, `/bks-stay/bookings`, `/admin/booking-manage` | Booking dang o | 1. Partner bam `Check-out` 2. Stay mo lai lich su booking 3. Admin doi chieu booking | Booking chuyen sang completed tren partner, stay va admin; cac hanh dong chi danh cho ky dang o bi dong |
| INT-07 | Public tra cuu booking sau khi partner check-in | Partner -> Public | `/partner/bookings`, `/my-bookings` | Booking da duoc check-in | 1. Partner thuc hien check-in 2. Public vao `my-bookings` tra cuu lai ma don | Public nhin thay trang thai moi nhat cua booking, khong con hien thong tin cu |
| INT-08 | Public tra cuu booking sau khi partner check-out | Partner -> Public -> Stay | `/partner/bookings`, `/my-bookings`, `/bks-stay/bookings` | Booking da completed | 1. Partner check-out 2. Public tra cuu booking 3. Stay vao history | Booking duoc dua vao nhom hoan thanh o public va stay, co the xem hoa don/voucher neu flow ho tro |
| INT-09 | Stay gui yeu cau huy booking confirmed | Stay -> Partner -> Admin | `/bks-stay/bookings/:id`, `/partner/cancellation-requests`, `/admin/booking-manage` | Booking confirmed cho phep gui yeu cau huy | 1. Stay gui yeu cau huy 2. Partner mo danh sach yeu cau huy 3. Admin tim booking | Partner nhan duoc yeu cau huy dung booking, admin nhin thay booking o trang thai cho xu ly huy |
| INT-10 | Partner duyet yeu cau huy tu Stay | Stay -> Partner -> Public/Admin | `/bks-stay/bookings/:id`, `/partner/cancellation-requests`, `/my-bookings`, `/admin/booking-manage` | Da co yeu cau huy tu Stay | 1. Partner duyet huy 2. Stay refresh booking detail 3. Public tra cuu lai 4. Admin doi chieu | Booking chuyen sang huy tren stay, public va admin; cac CTA khong con cho ky o dang dien ra |
| INT-11 | Partner tu choi yeu cau huy tu Stay | Stay -> Partner -> Admin | `/bks-stay/bookings/:id`, `/partner/cancellation-requests`, `/admin/booking-manage` | Da co yeu cau huy tu Stay | 1. Partner tu choi yeu cau huy 2. Stay refresh 3. Admin kiem tra lich su/trang thai | Booking quay ve trang thai confirmed/active phu hop, thong tin tu choi huy duoc dong bo |
| INT-12 | Stay rut yeu cau huy | Stay -> Partner | `/bks-stay/bookings/:id`, `/partner/cancellation-requests` | Booking dang pending cancellation | 1. Stay bam `Rut yeu cau huy` 2. Partner refresh danh sach huy | Yeu cau huy bien mat hoac doi trang thai theo rule, booking quay ve trang thai hop le |
| INT-13 | Stay nop bien lai coc, partner xac nhan | Stay -> Partner -> Admin | `/bks-stay/bookings/:id`, `/partner/bookings`, `/admin/booking-manage` | Booking yeu cau nop coc | 1. Stay upload bien lai coc 2. Partner mo chi tiet booking/receipt 3. Xac nhan coc neu co 4. Admin doi chieu | Bien lai hien dung ben partner, trang thai dat coc cap nhat dung o stay va admin |
| INT-14 | Chan check-in khi coc chua hop le | Stay -> Partner | `/bks-stay/bookings/:id`, `/partner/bookings` | Booking chua xac thuc coc | 1. Stay chua nop hoac nop sai bien lai 2. Partner mo danh sach booking | Nut `Check-in` ben partner bi khoa hoac bao ly do dung theo rule dat coc |
| INT-15 | Stay doi phuong thuc thanh toan | Stay -> Partner -> Admin | `/bks-stay/bookings/:id`, `/partner/bookings`, `/admin/booking-manage` | Booking cho phep doi payment method | 1. Stay doi phuong thuc thanh toan 2. Partner refresh booking 3. Admin mo booking detail | Phuong thuc thanh toan moi duoc dong bo o partner va admin |
| INT-16 | Stay gui yeu cau gia han o | Stay -> Partner -> Admin | `/bks-stay/dashboard`, `/partner/bookings`, `/admin/booking-manage` | Booking dang o va cho phep gia han | 1. Stay gui yeu cau gia han 2. Partner kiem tra booking 3. Admin tim theo ma booking | He thong ghi nhan yeu cau gia han dung booking, du lieu hien o role quan ly de xu ly tiep |
| INT-17 | Stay goi dich vu nhanh | Stay -> Partner | `/bks-stay/services`, `/partner/stay-services` | Co active booking va feature dich vu bat | 1. Stay gui mot yeu cau dich vu 2. Partner mo danh sach stay-services | Yeu cau moi xuat hien ngay o partner voi dung phong, noi dung va trang thai cho xu ly |
| INT-18 | Partner cap nhat tien do yeu cau dich vu | Partner -> Stay | `/partner/stay-services`, `/bks-stay/services` | Da co yeu cau dich vu moi | 1. Partner chuyen trang thai yeu cau sang `dang xu ly` roi `hoan thanh` 2. Stay refresh trang service | Timeline/trang thai yeu cau ben stay cap nhat dung theo tung buoc |
| INT-19 | Stay gui yeu cau bao su co | Stay -> Partner | `/bks-stay/support`, `/partner/stay-services` hoac module lien quan | Feature support bat | 1. Stay gui yeu cau su co/co note 2. Partner refresh module tiep nhan | Partner nhan duoc ticket hoac request tuong ung voi noi dung su co |
| INT-20 | Chat giua Stay va Partner | Stay -> Partner | `/bks-stay/chat`, `/partner/chat` | Co conversation hoac co the tao moi | 1. Stay gui tin nhan text 2. Partner mo chat 3. Partner tra loi 4. Stay refresh | Tin nhan hai chieu hien dung thu tu, dung nguoi gui, khong mat noi dung |
| INT-21 | Gui anh trong chat va mo preview cheo role | Stay -> Partner | `/bks-stay/chat`, `/partner/chat` | Chat ho tro upload anh | 1. Stay gui anh 2. Partner mo preview 3. Partner gui lai anh 4. Stay mo preview | Anh hien thi va preview duoc o ca hai portal, khong hong lien ket file |
| INT-22 | Partner tao phong public va kiem tra public search | Partner -> Public -> Admin | `/partner/units` hoac `/partner/rooms/:roomId`, `/search/rooms`, `/admin/rooms` | Co property hop le | 1. Partner tao phong moi va de trang thai public 2. Public tim phong 3. Admin mo room manage | Phong moi xuat hien tren trang public va trong danh sach room admin voi cung thong tin co ban |
| INT-23 | Partner an phong khoi public | Partner -> Public -> Admin | `/partner/units`, `/search/rooms`, `/admin/rooms` | Co phong dang public | 1. Partner chuyen phong sang an/private 2. Public tim lai phong 3. Admin kiem tra status | Phong khong con xuat hien tren public nhung admin van thay status noi bo dung |
| INT-24 | Admin sua thong tin phong, public nhan cap nhat | Admin -> Public -> Partner | `/admin/rooms/edit/:id`, `/rooms/:roomId`, `/partner/rooms/:roomId` | Co room dang public | 1. Admin sua ten/gia/co so vat chat cua phong 2. Public mo room detail 3. Partner mo room detail | Du lieu da sua dong bo o public va partner theo cac truong duoc phep hien thi |
| INT-25 | Partner dang ky onboarding, admin phe duyet | Public/Partner -> Admin -> Partner | `/partner/register`, `/partner/onboarding`, `/admin/partner-approval`, `/partner/login` | Chua ton tai doi tac dang ky | 1. Dang ky doi tac hoac nop onboarding 2. Admin mo partner approval va duyet 3. Dang nhap lai partner | Sau phe duyet, partner dang nhap vao dashboard thay vi onboarding |
| INT-26 | Admin tu choi partner onboarding | Partner -> Admin -> Partner | `/partner/onboarding`, `/admin/partner-approval`, `/partner/login` | Co partner dang pending | 1. Admin tu choi doi tac 2. Partner login lai | Partner bi dieu huong ve onboarding hoac nhin thay trang thai tu choi dung voi noi dung phan hoi |
| INT-27 | Stay ky hop dong, partner/admin doi chieu | Stay -> Partner -> Admin | `/bks-stay/contracts/:id`, `/partner/contracts`, `/admin/partner-information/detail/:id` hoac module lien quan | Co contract cho ky | 1. Stay ky hop dong 2. Partner mo hop dong 3. Admin doi chieu trang thai | Trang thai hop dong cap nhat dong bo thanh da ky/hieu luc theo rule |
| INT-28 | Stay upload tai lieu hop dong | Stay -> Partner/Admin | `/bks-stay/contracts/:id`, `/partner/contracts` | Flow hop dong can upload tai lieu | 1. Stay upload file 2. Partner refresh 3. Admin kiem tra neu co man hinh doi chieu | File tai lieu duoc luu dung va co the truy cap o role can quan sat |
| INT-29 | Admin dong ky doi soat | Admin -> Partner | `/admin/settlements/:id`, `/partner/finance` | Co ky doi soat `issued` | 1. Admin nhap ma tham chieu ngan hang va xac nhan thanh toan 2. Partner mo finance | Ky doi soat chuyen sang da thanh toan/da dong va partner nhin thay thong tin moi nhat |
| INT-30 | Booking bi khoa sau khi dong ky doi soat | Admin -> Partner | `/admin/settlements/:id`, `/partner/bookings` | Da dong ky doi soat chua booking lien quan | 1. Admin dong ky doi soat 2. Partner mo cac booking trong ky | Booking lien quan bi khoa thao tac theo rule, khong cho sua/huy trai quy dinh |
| INT-31 | Admin tao user role partner, dang nhap partner portal | Admin -> Partner | `/admin/user-management`, `/partner/login` | Chua co user partner can test | 1. Admin tao user moi voi role partner 2. Dung tai khoan moi dang nhap partner | User moi dang nhap duoc vao portal partner neu da du dieu kien lien ket |
| INT-32 | Admin doi role user, chan truy cap sai portal | Admin -> Admin/Partner | `/admin/user-management/detail/:id`, `/admin/login`, `/partner/login` | Co user dang hoat dong | 1. Admin doi role cua user 2. Thu dang nhap vao portal cu va portal moi | Quyen truy cap thay doi dung theo role moi, portal khong phu hop bi chan |
| INT-33 | Public xem phong sau khi admin/partner xoa hoac an du lieu | Admin/Partner -> Public | `/admin/rooms`, `/partner/units`, `/rooms/:roomId` | Co room dang public | 1. Admin hoac partner an/xoa phong 2. Public mo room detail cu va search lai | Public khong con truy cap duoc phong da an/xoa, hien thong bao/404/empty state phu hop |
| INT-34 | Public doc tin tuc sau khi admin publish | Admin -> Public | `/admin/news`, `/news-list`, `/news/:newsId` | Co bai viet draft/pending | 1. Admin publish bai viet 2. Public mo news list va chi tiet | Bai viet xuat hien trong danh sach public va vao duoc trang chi tiet |
| INT-35 | Public khong thay tin tuc bi an | Admin -> Public | `/admin/news`, `/news-list`, `/news/:newsId` | Co bai viet da tung publish | 1. Admin unpublish/hidden bai viet 2. Public refresh list va mo link cu | Bai viet bien mat khoi danh sach va link cu hien thong bao phu hop |
| INT-36 | Admin tao dich vu, Stay/Partner cung thay danh muc moi | Admin -> Partner -> Stay | `/admin/service-management`, `/partner/catalog/services`, `/bks-stay/services` | Feature dich vu bat | 1. Admin tao dich vu moi 2. Partner mo catalog services 3. Stay mo trang services | Dich vu moi hien dung ten/thong tin o partner va co the duoc su dung trong Stay theo rule |
| INT-37 | Admin tao tien ich, public room detail nhan du lieu | Admin -> Partner/Public | `/admin/amenity-management`, `/partner/rooms/:roomId`, `/rooms/:roomId` | Co room gan amenity | 1. Admin tao/cap nhat amenity 2. Partner gan amenity cho room 3. Public mo room detail | Amenity moi hien dung o room detail public va room detail partner |
| INT-38 | Public dat phong cho room vua duoc partner cap nhat gia | Partner -> Public -> Admin | `/partner/rooms/:roomId`, `/booking/:roomId`, `/admin/booking-manage` | Room dang public | 1. Partner cap nhat gia phong 2. Public mo booking form va dat phong 3. Admin mo booking detail | Gia va tong tien booking su dung muc gia moi nhat dong nhat o public va admin |
| INT-39 | Stay gui review sau khi hoan tat, partner nhin thay danh gia | Stay -> Partner/Public | `/bks-stay/bookings/:id`, `/partner/rooms/:roomId` | Booking completed va co review flow | 1. Stay gui review 2. Partner mo chi tiet phong 3. Public mo room detail neu co hien review | Danh gia moi xuat hien dung noi quy dinh, khong lap hoac mat diem |
| INT-40 | Dieu huong cheo role tu admin cross-nav | Admin -> Partner/Admin | `/admin/partner-information`, `/admin/properties`, `/admin/rooms`, `/admin/booking-manage` | Co du lieu lien ket day du | 1. Tu admin mo partner/property/room 2. Bam cross-nav sang bookings 3. Doi chieu voi booking thuc te cua partner | Cross-nav dua den dung danh sach co bo loc context chinh xac, du lieu khop voi ben partner |

## 5. Test bo sung uu tien cao

- Thu lai luong `Public -> Partner -> Stay` voi truong hop room gan het phong, room bi an giua qua trinh dat va room doi gia sat thoi diem submit.
- Thu lai luong huy booking voi tung moc trang thai: `pending`, `confirmed`, `checked-in`.
- Thu tren mobile cho cac luong co upload file, chat, share voucher, copy clipboard.
- Thu tren moi truong co latency de kiem tra polling va refresh du lieu cheo portal.

## 6. Ghi chu

- Neu can tach rieng testcase theo nghiep vu backend, co the chia tiep thanh cac nhom: booking lifecycle, partner lifecycle, settlement lifecycle, content lifecycle.
- Cac test case nay nen uu tien chay tren moi truong sandbox co du lieu on dinh de de doi chieu xuyen role.
