# Tài liệu Nguyên lý và Cơ chế Trò chơi (Game Mechanics)

Tài liệu này tổng hợp toàn bộ các cơ chế cốt lõi hiện có trong source code để bạn dễ dàng nắm bắt, từ đó thiết kế lại hoặc bổ sung thêm tính năng mới.

## 1. Kiến trúc Tổng thể (Architecture)
- **Mô phỏng tĩnh tiến (Lockstep / Deterministic):** Game được thiết kế để có thể chạy multiplayer đồng bộ. Mọi logic di chuyển, chiến đấu đều chạy theo Tick (vòng lặp thời gian) dựa trên `world.time` và `dt` (delta time).
- **Cấu trúc Dữ liệu SoA (Structure of Arrays):** Thay vì tạo mỗi lính là một Object (OOP), toàn bộ dữ liệu của 40.000 lính được lưu trong các mảng TypedArray phẳng (Ví dụ: `x = new Float32Array(40000)`, `y = new Float32Array(40000)`, `hp`, `state`, v.v.). Kiến trúc này giúp tối ưu hóa CPU Cache, cho phép game chạy mượt mà hàng vạn lính trên trình duyệt.

## 2. Hệ thống Quân đội và Chỉ số (Units & Stats)
Trò chơi có 2 phe (Đỏ và Xanh), hỗ trợ các loại binh chủng sau:

| Binh chủng (Type) | Vai trò | HP | Sát thương (DMG) | Tốc độ | Tầm đánh | Tầm nhìn (Aggro) | Đặc điểm nổi bật |
|---|---|---|---|---|---|---|---|
| **Kiếm sĩ (Warrior)** | Cận chiến | 120 | 14 | 62 | 40px | 5 ô | Cân bằng, giáp lá cà tốt. |
| **Kỵ binh (Lancer)** | Cận chiến | 160 | 22 | 88 | 54px | 6 ô | Máu trâu, sát thương cao, chạy rất nhanh, tầm đánh xa hơn Kiếm sĩ (cầm giáo). |
| **Cung thủ (Archer)** | Đánh xa | 70 | 10 | 58 | 6 ô (192px) | 7 ô | Bắn tên bay theo thời gian thực. **Đứng trên đồi cao được cộng thêm 2 ô tầm bắn.** Tự động ngừng bắn nếu bị vướng vật cản (vách đá). |
| **Thầy tu (Monk)** | Hỗ trợ | 60 | 14 (Heal) | 56 | 4 ô | 5 ô | Không đánh địch, tự động tìm đồng minh dưới 85% HP để bơm máu. |
| **Nông dân (Pawn)** | Kinh tế | 50 | 4 | 64 | 36px | 3 ô | Có hệ thống Task riêng (Chặt gỗ, đào vàng, hái quả, xây nhà). |

## 3. Hệ thống Di chuyển và Tìm đường (Pathfinding)
- **Flow Field (Trường Vector):** Khác với thuật toán A* thông thường chỉ tìm đường cho 1 lính, game dùng Flow Field. Khi bạn ra lệnh di chuyển, game tính toán 1 bản đồ lực hướng về đích. Toàn bộ đạo quân chỉ cần nhìn vào bản đồ này để trôi về đích giống như dòng nước, giúp hàng ngàn lính tìm đường cùng lúc mà không lag.
- **Đội hình Vuông (Grid Formation):** (Vừa được nâng cấp) Khi đội quân tiến sát vị trí đích (< 150px), chúng sẽ thoát khỏi Flow Field và tự động dò tìm vị trí "ghế ngồi" (Slot) được cấp sẵn của mình để xếp thành một khối vuông chỉnh chu (cách nhau 40px).
- **Vật lý Đám đông (Separation):** Các lính có lực đẩy nhau (bán kính 32px). Khi di chuyển hoặc chiến đấu, nếu lính chen chúc quá gần, chúng sẽ tự đẩy nhau dạt sang hai bên sườn. Cơ chế này giúp đạo quân tự động dàn hàng ngang hình cánh cung bao vây kẻ địch thay vì đè lên nhau thành một đống.
- **Tốc độ Địa hình (Terrain Speed):** Địa hình ảnh hưởng tốc độ đi. Đi trên cỏ là 100%, đi qua chỗ nước cạn / cầu bị chậm lại.

## 4. Hệ thống Địa hình (Map & Environment)
Bản đồ được chia thành lưới (Grid) với kích thước mỗi ô là 32x32 pixel. Các thuộc tính của ô đất:
- **Độ cao (Elevation / Level):** Bản đồ có nhiều tầng cao độ (0, 1, 2, 3). Bắn từ trên cao xuống thấp sẽ được lợi thế (như Cung thủ được cộng tầm bắn và sát thương). Không thể đi thẳng từ tầng 0 lên vách đá tầng 2 mà phải vòng qua Dốc (Ramp).
- **Rừng cây (Forest / Stealth):** Lính đứng trong rừng được hưởng trạng thái Tàng hình (Stealth) đối với quân địch chưa bước vào rừng, thích hợp để phục kích.
- **Vùng không thể đi (Impassable):** Nước sâu, vách đá dốc đứng không thể đi qua.

## 5. Cơ chế Chiến đấu và Nhắm mục tiêu (Combat & Targeting)
- **Aggro & Target:** Mỗi tick, lính tự động quét xung quanh bán kính Aggro. Nếu thấy địch, nó khóa mục tiêu (Target) và bắt đầu rượt đuổi.
- **Hold Position (Giữ vị trí - Phím H):** Lính đứng yên không rượt theo địch. Bán kính Aggro bị giảm xuống mức tối thiểu (chỉ đánh kẻ thù nào đi ngang qua mặt). Bị tấn công khi đang Hold sẽ được giảm nhẹ sát thương nhận vào.
- **Line of Sight (Tầm nhìn thẳng):** Đơn vị đánh xa (Cung) trước khi bắn phải check xem có bị vướng vách đá / đồi cao che khuất mục tiêu hay không. Nếu vướng, chúng sẽ bỏ qua và tìm mục tiêu khác hoặc tiến lại gần.

## 6. Xây dựng và Kinh tế (Economy & Buildings)
- **Tài nguyên:** Game hỗ trợ 3 loại tài nguyên cơ bản là Vàng (Gold), Gỗ (Wood) và Thịt (Meat). Nông dân có logic gặt hái và mang về nhà chính.
- **Công trình (Buildings):** Có hitbox hình chữ nhật trên lưới. Công trình có máu (HP) và có thể bị phá hủy. Khi bị phá hủy, nó sẽ vỡ vụn kèm hiệu ứng nổ, và giải phóng vùng đất nó từng chiếm dụng.

## 7. Giao diện và Render (Frontend)
- **Render Engine:** Viết bằng Canvas/WebGL tùy chỉnh cực nhẹ. Vẽ hàng chục ngàn sprite lính và đổ bóng (Shadow) siêu tốc bằng cách batching (gộp lệnh vẽ).
- **Camera:** Mượt mà, hỗ trợ zoom, giới hạn biên (không bị viền đen), và tính năng Focus (nhảy mượt đến vị trí các đạo quân).
- **UI (React):** Tích hợp bằng React (Next.js), phủ lên trên lớp Canvas để vẽ các bảng điều khiển, điểm số và minimap.
