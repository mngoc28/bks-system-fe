# Component Course

Component Course hiển thị trang chi tiết về một khóa học, được thiết kế theo Figma.

## Cấu trúc

Component Course được chia thành năm phần chính:

1. **Cover**: Thông tin tổng quan về khóa học và giáo viên
2. **Course Detail**: Mô tả khóa học và kết quả học tập
3. **Syllabus**: Nội dung giáo trình của khóa học
4. **Teacher**: Thông tin về giáo viên
5. **Community Reviews**: Đánh giá từ học viên

## Components Con

Component Course sử dụng các component con sau:

### StarIcon và EmptyStarIcon

Hiển thị icon sao đánh giá (đã đánh giá và chưa đánh giá).

```tsx
const StarIcon: React.FC = () => (
  <img src="/assets/rating_star.svg" alt="Đánh giá" className="w-4 h-4" />
);

const EmptyStarIcon: React.FC = () => (
  <img src="/assets/star_icon.svg" alt="Chưa đánh giá" className="w-4 h-4" />
);
```

### RatingStars

Hiển thị đánh giá dưới dạng các ngôi sao.

```tsx
interface RatingStarsProps {
  rating?: number;
  totalStars?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 5,
  totalStars = 5,
}) => {
  // Component code
};
```

### SyllabusTopic

Hiển thị một chủ đề trong giáo trình.

```tsx
interface SyllabusTopicProps {
  number: string;
  title: string;
  lessons: string;
  duration: string;
}

const SyllabusTopic: React.FC<SyllabusTopicProps> = ({
  number,
  title,
  lessons,
  duration,
}) => {
  // Component code
};
```

### CommunityReviewCard

Hiển thị một đánh giá của học viên.

```tsx
interface CommunityReviewCardProps {
  avatar: string;
  name: string;
  location: string;
  rating: number;
  review: string;
}

const CommunityReviewCard: React.FC<CommunityReviewCardProps> = ({
  avatar,
  name,
  location,
  rating,
  review,
}) => {
  // Component code
};
```

## Màu sắc và Kích thước

Component Course sử dụng các màu sắc và kích thước theo Figma:

### Màu sắc

- **Nền cover**: #FEF2F2 (red-50)
- **Nền chính**: #FFFFFF (white)
- **Nền ảnh/card**: #F8FAFC (slate-50)
- **Tiêu đề**: #0F172A (slate-900)
- **Text mô tả**: #334155 (slate-700)
- **Text thường**: #0F172A (slate-900)
- **Text link**: #0EA5E9 (sky-500)
- **Nút chính**: #2563EB (blue-600)
- **Icon sao đánh giá**: #FDE047 (yellow-300)
- **Viền**: #94A3B8 (slate-400)

### Kích thước

- **Container chính**: 1440px
- **Padding container**: 120px (trái/phải)
- **Tiêu đề lớn**: text-4xl, font-bold
- **Tiêu đề phần**: text-2xl, font-bold
- **Tiêu đề card**: text-xl, font-bold
- **Text thường**: text-base
- **Text nhỏ**: text-sm

## Hình ảnh

Component sử dụng các hình ảnh lưu trong thư mục `/public/assets/`:

- breadcrumb_arrow.svg
- course_teacher_avatar.svg
- learner_avatar_1.svg, learner_avatar_2.svg, learner_avatar_3.svg
- list_icon.svg
- time_icon.svg
- level_icon.svg
- star_icon.svg
- star_filled_icon.svg
- rating_star.svg
- teacher_image.svg
- user_icon.svg
- video_icon.svg
- down_arrow.svg
- community_avatar.svg

## Cách sử dụng

```tsx
import Course from "../components/Course";

// Trong component của bạn
function CoursePage() {
  return (
    <div>
      <Course />
    </div>
  );
}
```

## Responsive

Component Course hiện được thiết kế cho desktop (1440px) và cần phát triển thêm cho các kích thước màn hình khác.

## Các tính năng tương lai

- Thêm props để truyền dữ liệu khóa học từ component cha
- Thêm state để mở/đóng các mục trong giáo trình
- Thêm tính năng responsive cho các kích thước màn hình khác nhau
- Thêm tính năng đăng ký khóa học
- Thêm tính năng phân trang cho phần đánh giá
