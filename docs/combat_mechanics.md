# Tài liệu Cơ chế Chiến đấu (Combat Mechanics)

Tài liệu này đi sâu vào logic chiến đấu cốt lõi (Combat Loop) đang được cài đặt trong `shared/src/world.ts`. Việc nắm rõ cơ chế này sẽ giúp bạn dễ dàng cân bằng game (Balancing) hoặc thiết kế thêm kỹ năng mới.

## 1. Chu trình Khóa Mục Tiêu (Target Acquisition)
Mỗi đơn vị lính hoạt động theo một vòng lặp logic (Tick):
- **Kiểm tra mục tiêu cũ:** Nếu mục tiêu đã chết, hoặc tàng hình (chạy vào rừng), lính sẽ mất dấu (`target = -1`).
- **Quét mục tiêu mới (Retarget):** Cứ mỗi 8 tick, lính sẽ tự động quét xung quanh dựa trên bán kính **Aggro** của binh chủng.
- **Trường hợp Cung thủ (Archer):** Lính bắn xa có thêm cơ chế kiểm tra Tầm nhìn thẳng (Line of Sight - `clearLine`). Nếu mục tiêu nằm trong tầm ngắm nhưng bị chắn bởi vách đá cao, Cung thủ sẽ lập tức bỏ qua mục tiêu đó để tránh việc đứng ngắm bắn vào vách núi vô ích.
- **Lệnh Hold Position (Phím H):** Khi đang ở trạng thái Giữ vị trí, bán kính Aggro của lính cận chiến giảm xuống chỉ còn 2 ô. Chúng sẽ mặc kệ kẻ thù bơi xung quanh, chỉ tấn công khi địch dâng lên sát mặt.

## 2. Di chuyển và Tiếp cận (Engage)
- Nếu khoảng cách đến mục tiêu lớn hơn Tầm đánh (`range`), lính sẽ tự động chạy thẳng về phía mục tiêu.
- **Tắc nghẽn (Stuck):** Nếu lính bị kẹt lại phía sau đồng đội quá `0.6` giây mà không nhúc nhích được bước nào, nó sẽ tự động hủy mục tiêu hiện tại (`target = -1`) để chu kỳ quét tiếp theo tìm một kẻ địch khác gần hơn hoặc thoáng hơn.
- Cơ chế **Separation (Lực đẩy)**: Các lính luôn tạo ra một lực đẩy nhau ra xa (Bán kính 32px, lực đẩy 0.8). Do đó, những lính bị "Stuck" kẹt lại phía sau sẽ bị trượt dạt sang hai bên sườn, tự động mở rộng mặt trận chiến đấu (Flanking).

## 3. Thực thi Đòn Đánh (Attack Execution)
Khi khoảng cách đã nằm trong `range`, lính chuyển sang trạng thái `S_ATTACK`.
- **Hồi chiêu (Cooldown - CD):** Thời gian giữa 2 đòn đánh. Đặc biệt, game cộng thêm một lượng ngẫu nhiên `(0.85 tới 1.15)` vào Cooldown mỗi lần chém để tạo cảm giác các vung kiếm không bị đều tăm tắp như robot (Desync animation).
- **Sát thương ngẫu nhiên (Damage Roll):** Mỗi đòn đánh không cố định mà dao động từ `80% đến 120%` sức mạnh cơ bản của lính.
- **Cận chiến (Kiếm, Giáo):** Gây sát thương ngay lập tức (`damage()`) lên máu kẻ thù.

## 4. Cơ chế Bắn cung và Đạn đạo (Projectiles)
Lính đánh xa không gây sát thương ngay lập tức, mà tạo ra một thực thể "Mũi tên" (Arrow).
- **Lợi thế Độ cao (High Ground Advantage):** 
  - Nếu Cung thủ đứng ở độ cao cao hơn mục tiêu, Tầm bắn được **cộng thêm 2 ô** (64px).
  - Sát thương của mũi tên bắn từ trên cao xuống được **nhân thêm 1.3 lần** (Crit 130%).
- **Né đạn (Dodge):** Mũi tên cần thời gian để bay tới đích (tùy thuộc khoảng cách). Khi chạm đất, mũi tên kiểm tra xem mục tiêu có còn đứng ở vị trí đó không (bán kính nổ 48px). Nếu mục tiêu (ví dụ: Kỵ binh) chạy quá nhanh và thoát khỏi bán kính nổ, mũi tên sẽ trượt (Miss).

## 5. Giảm trừ Sát thương (Damage Mitigation)
- Hiện tại game chưa có chỉ số Giáp (Armor).
- Tuy nhiên, tính năng phòng thủ duy nhất là **Hold Position**. Nếu một lính bị chém trúng khi đang trong trạng thái Giữ vị trí (Hold), sát thương nó nhận vào sẽ được **giảm 40%** (`amount *= 0.6`). Điều này làm cho đội hình khiêng/giáo đứng im phòng thủ trở nên cực kỳ trâu bò trước các đợt càn quét.

## 6. Hồi máu (Monk)
Thầy tu (Monk) có logic đảo ngược so với lính thường:
- Quét các đồng minh xung quanh có HP dưới 85% để target.
- Khi tiếp cận, thay vì gây sát thương, Monk sẽ cộng HP cho đồng minh bằng đúng chỉ số `dmg` của mình.

---
**Tóm tắt các thông số dễ dàng cân chỉnh sau này (Nằm ở `assets-def.ts` và `world.ts`):**
- Tầm nhìn: `aggro`
- Khoảng cách né đạn nổ: `48px`
- Bán kính lực dạt: `SEP = 32`
- Kháng sát thương Hold: `0.6` (Nhận 60%)
## Cập nhật: Vision, Bao vây, Trinh sát

### Trinh sát (Scout)
- Nông dân đổi thành Trinh sát, HP=30, Speed=95 (nhanh nhất game), tầm nhìn 12 ô.
- Không hồi sinh, không tự làm việc kinh tế. Do người chơi điều khiển hoàn toàn.

### Sương mù chiến tranh (Fog of War)
- Mỗi phe có visCount[] (đang thấy) và explored[] (đã khám phá) riêng.
- Tính sẵn 16 mặt nạ hình tròn (VIS_MASKS[0..15]), không tính lại mỗi tick.
- Cập nhật 3Hz: gộp tầm nhìn theo ô (bestR[tile]), stamp mask, cộng vào visCount.
- Địa hình ảnh hưởng tầm nhìn: Rừng ×0.5, Đồi cao +3 ô.
- Renderer vẽ offscreen canvas 512×512 (1px=1 ô), lerp alpha 60Hz để viền mờ mềm.
- 3 mức alpha: thấy rõ=0, đã khám phá=0.55, chưa khám phá=1.0.
- Lính địch ở ô chưa thấy sẽ ẩn đi (không vẽ).

### Bao vây & Cuồng chiến (Encirclement & Berserk)
- Lưới thô 8x8 ô, O(n lính) mỗi lần chạy.
- Ô bị bao vây: địch > 1.5× ta VÀ địch ở ít nhất 1 cặp hướng đối diện (T-B hoặc T-P).
- Lính bị bao vây: sát thương gây ra −30%, sát thương nhận vào +20%.
- Cuồng chiến (5%): kích hoạt khi bị bao vây và HP<50%, sát thương x2, không bị phạt bao vây.
