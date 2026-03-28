import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Component hiển thị icon ngôi sao đánh giá
const StarIcon: React.FC = () => (
  <img src="/assets/rating_star.svg" alt="Đánh giá" className="w-4 h-4" />
);

// Component hiển thị icon ngôi sao rỗng (chưa được đánh giá)
const EmptyStarIcon: React.FC = () => (
  <img src="/assets/star_icon.svg" alt="Chưa đánh giá" className="w-4 h-4" />
);

interface RatingStarsProps {
  rating?: number;
  totalStars?: number;
}

// Component hiển thị rating stars
const RatingStars: React.FC<RatingStarsProps> = ({
  rating = 5,
  totalStars = 5,
}) => {
  return (
    <div className="flex">
      {Array.from({ length: totalStars }).map((_, index) => (
        <div key={index} className="mr-0.5">
          {index < rating ? <StarIcon /> : <EmptyStarIcon />}
        </div>
      ))}
    </div>
  );
};

interface SyllabusTopicProps {
  number: string;
  title: string;
  lessons: string;
  duration: string;
}

// Component syllabus topic
const SyllabusTopic: React.FC<SyllabusTopicProps> = ({
  number,
  title,
  lessons,
  duration,
}) => {
  return (
    <div className="w-full border border-slate-400 bg-slate-50 mb-4">
      <div className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
            {number}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-900">{title}</span>
            <span className="text-base text-slate-900">
              {lessons} bài giảng • {duration} phút
            </span>
          </div>
        </div>
        <Button variant="default" className="p-2">
          <img src="/assets/down_arrow.svg" alt="Mở rộng" />
        </Button>
      </div>
    </div>
  );
};

interface CommunityReviewCardProps {
  avatar: string;
  name: string;
  location: string;
  rating: number;
  review: string;
}

// Component community review card
const CommunityReviewCard: React.FC<CommunityReviewCardProps> = ({
  avatar,
  name,
  location,
  rating,
  review,
}) => {
  return (
    <div className="flex-1">
      <div className="flex justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 p-[5px] bg-slate-50 rounded border border-slate-400 flex items-center justify-center">
            <img src={avatar} alt={name} className="max-w-full max-h-full" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-slate-900">{name}</h3>
            <p className="text-base text-slate-900">{location}</p>
          </div>
        </div>
        <RatingStars rating={rating} />
      </div>
      <p className="text-base text-slate-900 text-justify">{review}</p>
    </div>
  );
};

type CommunityReview = {
  id: number;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
};

const Course: React.FC = () => {
  // Data mẫu cho community reviews
  const communityReviews: CommunityReview[] = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      location: "Hà Nội",
      avatar: "/assets/community_avatar.svg",
      rating: 4,
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      id: 2,
      name: "Nguyễn Văn A",
      location: "Hà Nội",
      avatar: "/assets/community_avatar.svg",
      rating: 4,
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
  ];

  return (
    <div className="w-full">
      {/* Cover Section */}
      <section className="flex px-[120px] py-16 bg-red-50">
        <div className="flex-1 py-6 px-10 bg-white rounded">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 mb-3">
            <Link to="/courses" className="text-sm text-sky-500">
              Toán 9
            </Link>
            <img
              src="/assets/breadcrumb_arrow.svg"
              alt=">"
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-900">
              Toán 9 - Bộ cánh diều
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Toán 9 - Bộ cánh diều
          </h1>

          {/* Description */}
          <p className="text-base text-slate-700 mb-6">
            Xây dựng kỹ năng tư duy và khả năng giải quyết vấn đề với khóa Toán
            9 bám sát theo bộ sách Cánh diều.
          </p>

          {/* Teacher info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 p-[5px] border border-slate-400 rounded flex items-center justify-center">
              <img
                src="/assets/course_teacher_avatar.svg"
                alt="Teacher Avatar"
                className="max-w-full max-h-full"
              />
            </div>
            <span className="text-base text-slate-900">
              Giáo viên: Nguyễn Thị B
            </span>
          </div>

          {/* Button & Enrollments */}
          <div className="flex items-center gap-3">
            <Button variant="default" className="py-3 px-6">
              Bắt đầu ngay
            </Button>
            <div className="flex items-center">
              <div className="relative flex items-center">
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-50">
                  <img
                    src="/assets/learner_avatar_1.svg"
                    alt="Học viên"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-50 -ml-2">
                  <img
                    src="/assets/learner_avatar_2.svg"
                    alt="Học viên"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-50 -ml-2">
                  <img
                    src="/assets/learner_avatar_3.svg"
                    alt="Học viên"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <span className="text-base font-bold text-gray-900">1.000</span>
                <span className="text-base text-gray-900">đã học</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Info Box */}
        <div className="ml-[232px] w-[400px] border border-slate-400 bg-white px-10 py-6 h-fit">
          <div className="space-y-6">
            {/* Category */}
            <div className="flex items-center gap-3">
              <img src="/assets/list_icon.svg" alt="Danh mục" />
              <div className="flex flex-col">
                <span className="text-base text-slate-900">Giáo trình</span>
                <span className="text-base font-bold text-slate-900">
                  5 danh mục
                </span>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3">
              <img src="/assets/time_icon.svg" alt="Thời gian" />
              <div className="flex flex-col">
                <span className="text-base text-slate-900">
                  Thời gian hoàn thành
                </span>
                <span className="text-base font-bold text-slate-900">
                  4 giờ
                </span>
              </div>
            </div>

            {/* Level */}
            <div className="flex items-center gap-3">
              <img src="/assets/level_icon.svg" alt="Cấp độ" />
              <div className="flex flex-col">
                <span className="text-base text-slate-900">Cấp độ</span>
                <span className="text-base font-bold text-slate-900">
                  Cơ bản
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <img src="/assets/star_icon.svg" alt="Đánh giá" />
              <div className="flex flex-col">
                <span className="text-base text-slate-900">
                  Đánh giá từ người học
                </span>
                <span className="text-base font-bold text-slate-900">
                  4.6 (500 đánh giá)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Detail Section */}
      <section className="px-[120px] py-20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1.5">
            Mô tả khóa học
          </h2>
          <p className="text-base text-black text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1.5">
            Kết quả học tập
          </h2>
          <div className="space-y-2">
            <p className="text-base text-black text-justify">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-base text-black text-justify">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-base text-black text-justify">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
        </div>
      </section>

      {/* Course Syllabus Section */}
      <section className="px-[120px] py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-1.5">
            Giáo trình
          </h2>
          <p className="text-base text-slate-900">
            5 danh mục • 15 bài giảng • 7 bài tập
          </p>
        </div>

        <div>
          <SyllabusTopic
            number="1"
            title="Lorem ipsum"
            lessons="3"
            duration="40"
          />
          <SyllabusTopic
            number="2"
            title="Lorem ipsum"
            lessons="3"
            duration="40"
          />
          <SyllabusTopic
            number="3"
            title="Lorem ipsum"
            lessons="3"
            duration="40"
          />
          <SyllabusTopic
            number="4"
            title="Lorem ipsum"
            lessons="3"
            duration="40"
          />
          <SyllabusTopic
            number="5"
            title="Lorem ipsum"
            lessons="3"
            duration="40"
          />
        </div>
      </section>

      {/* Teacher Section */}
      <section className="px-[120px] py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Giáo viên</h2>

        <div className="flex gap-8">
          <div className="w-[250px] h-[250px] p-[5px] flex items-center justify-center bg-slate-50 rounded border border-slate-400">
            <img
              src="/assets/teacher_image.svg"
              alt="Giáo viên"
              className="max-w-full max-h-full"
            />
          </div>

          <div className="flex flex-col gap-6 py-3">
            <h3 className="text-xl font-bold text-sky-500">Nguyễn Văn A</h3>

            <div className="flex items-center gap-2">
              <img
                src="/assets/star_filled_icon.svg"
                alt="Đánh giá"
                className="w-5 h-5"
              />
              <span className="text-base text-slate-900">
                4.7 Đánh giá giáo viên
              </span>
            </div>

            <div className="flex items-center gap-2">
              <img
                src="/assets/user_icon.svg"
                alt="Học sinh"
                className="w-5 h-5"
              />
              <span className="text-base text-slate-900">12,202 Học sinh</span>
            </div>

            <div className="flex items-center gap-2">
              <img
                src="/assets/video_icon.svg"
                alt="Khóa học"
                className="w-5 h-5"
              />
              <span className="text-base text-slate-900">30 Khóa học</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Reviews Section */}
      <section className="px-[120px] py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Đánh giá từ người học
          </h2>
          <div className="flex items-center gap-1.5">
            <img
              src="/assets/rating_star.svg"
              alt="Đánh giá"
              className="w-5 h-5"
            />
            <span className="text-base font-bold text-slate-900">
              4.6 • 500 đánh giá
            </span>
          </div>
        </div>

        <div className="flex gap-8 mb-6">
          {communityReviews.map((review) => (
            <CommunityReviewCard
              key={review.id}
              avatar={review.avatar}
              name={review.name}
              location={review.location}
              rating={review.rating}
              review={review.review}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="default" className="py-3 px-6">
            Xem thêm đánh giá
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Course;
