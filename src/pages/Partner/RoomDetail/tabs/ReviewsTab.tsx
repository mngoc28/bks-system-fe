import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Star, Users } from 'lucide-react';

interface ReviewUser {
  name: string;
  avatar?: string;
}

interface Review {
  id: number | string;
  user?: ReviewUser;
  created_at: string;
  rating: number;
  comment?: string;
}

interface ReviewsData {
  total_count: number;
  average_rating: number | string;
  reviews: Review[];
}

interface ReviewsTabProps {
  reviewsData?: ReviewsData;
  isLoading: boolean;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({ reviewsData, isLoading }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Spinner size="lg" showText text="Đang tải danh sách đánh giá..." />
      </div>
    );
  }

  if (!reviewsData || reviewsData.reviews.length === 0) {
    return (
      <div className="py-16 text-center text-sm italic text-slate-400">
        Chưa có đánh giá nào cho phòng này.
      </div>
    );
  }

  // Calculate rating breakdown
  const totalCount = reviewsData.total_count || reviewsData.reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  reviewsData.reviews.forEach((r) => {
    const rate = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (rate >= 1 && rate <= 5) {
      ratingCounts[rate] += 1;
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
          
          {/* Header Summary & Rating Breakdown Chart */}
          <div className="flex flex-col gap-6 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Nhận xét từ khách hàng</h2>
              <p className="mt-1 text-sm text-slate-500">Đánh giá thực tế về phòng này do khách thuê trải nghiệm và chia sẻ</p>
            </div>
            
            <div className="flex flex-col gap-6 rounded-2xl border border-slate-100/80 bg-slate-50/50 p-6 sm:flex-row sm:items-center">
              {/* Avg Rating Card */}
              <div className="text-center sm:border-r sm:border-slate-200/80 sm:pr-8">
                <div className="flex items-center justify-center gap-2 text-5xl font-black text-slate-900">
                  <Star className="size-9 shrink-0 fill-amber-500 text-amber-500" />
                  {reviewsData.average_rating}
                </div>
                <p className="mt-1 text-xs font-bold text-slate-400">Trên tổng số {totalCount} đánh giá</p>
              </div>
              
              {/* Progress Bars Chart */}
              <div className="w-full space-y-2 sm:w-64">
                {([5, 4, 3, 2, 1] as const).map((stars) => {
                  const count = ratingCounts[stars];
                  const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                      <span className="w-3 text-right">{stars}</span>
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div 
                          className="h-full rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="divide-y divide-slate-100">
            {reviewsData.reviews.slice(0, showAllReviews ? undefined : 5).map((review) => (
              <div key={review.id} className="space-y-4 py-6 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm animate-in zoom-in-75">
                      {review.user?.avatar ? (
                        <img src={review.user.avatar} alt={review.user.name} className="size-full object-cover" />
                      ) : (
                        <Users className="size-6 text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-800">{review.user?.name || "Khách hàng ẩn danh"}</h4>
                      <span className="text-xs font-medium text-slate-400">{new Date(review.created_at).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 shadow-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`size-3.5 ${
                          i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment ? (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 pl-6 text-sm italic leading-relaxed text-slate-600">
                    "{review.comment}"
                  </div>
                ) : (
                  <div className="pl-6 text-sm italic text-slate-400">
                    Khách hàng không để lại nhận xét bằng lời.
                  </div>
                )}
              </div>
            ))}
          </div>

          {reviewsData.reviews.length > 5 && (
            <div className="mt-8 flex justify-center border-t border-slate-100 pt-6">
              <Button
                variant="outline"
                className="rounded-xl border-2 border-slate-100 px-8 py-5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                onClick={() => setShowAllReviews(!showAllReviews)}
              >
                {showAllReviews ? "Thu gọn nhận xét" : `Xem thêm ${reviewsData.reviews.length - 5} nhận xét`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
