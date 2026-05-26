import React, { useMemo, useState } from "react";
import { Star, Search, X, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Review {
  id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface ReviewsModalProps {
  trigger: React.ReactNode;
  reviews: Review[];
  averageRating: number | string;
  totalCount: number;
  title?: string;
}

const removeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  trigger,
  reviews = [],
  averageRating,
  totalCount,
  title = "Tất cả đánh giá",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Calculate rating breakdown (1 to 5 stars)
  const stats = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const ratingKey = Math.round(r.rating) as 5 | 4 | 3 | 2 | 1;
      if (counts[ratingKey] !== undefined) {
        counts[ratingKey]++;
      }
    });

    const total = reviews.length;
    return [5, 4, 3, 2, 1].map((star) => {
      const count = counts[star as 5 | 4 | 3 | 2 | 1];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { star, count, percentage };
    });
  }, [reviews]);

  // Search, filter, and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating
    if (selectedRating !== "all") {
      const targetRating = parseInt(selectedRating, 10);
      result = result.filter((r) => Math.round(r.rating) === targetRating);
    }

    // Filter by search query (accent-insensitive search)
    if (searchQuery.trim()) {
      const query = removeAccents(searchQuery);
      result = result.filter((r) => {
        const comment = r.comment ? removeAccents(r.comment) : "";
        const userName = r.user?.name ? removeAccents(r.user.name) : "";
        return comment.includes(query) || userName.includes(query);
      });
    }

    // Sort reviews
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "highest") {
        return b.rating - a.rating;
      }
      if (sortBy === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });

    return result;
  }, [reviews, searchQuery, selectedRating, sortBy]);

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        // Reset states on close
        setSearchQuery("");
        setSelectedRating("all");
        setSortBy("newest");
      }
    }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] md:h-[75vh] w-[95vw] overflow-hidden rounded-3xl p-6 flex flex-col gap-4 bg-white border border-slate-200 shadow-xl">
        <DialogHeader className="border-b border-slate-100 pb-3 shrink-0">
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {title} ({totalCount})
          </DialogTitle>
        </DialogHeader>

        {/* Responsive Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr] gap-6 overflow-hidden h-full flex-1 min-h-0">
          
          {/* Left column: Overview statistics */}
          <div className="flex flex-col gap-5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 shrink-0">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900">{averageRating}</span>
                <div className="flex items-center gap-0.5">
                  <Star className="size-5 text-amber-500 fill-amber-500 shrink-0" />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Điểm trung bình từ {totalCount} đánh giá của khách hàng
              </p>
            </div>

            <div className="space-y-2">
              {stats.map(({ star, percentage }) => (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-semibold text-slate-600 shrink-0">{star} ★</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-slate-800 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-bold text-slate-500 shrink-0">{percentage}%</span>
                </div>
              ))}
            </div>

            {/* Quick Summary Badge */}
            <div className="mt-auto hidden md:block rounded-2xl bg-sky-50 border border-sky-100/50 p-4">
              <h5 className="text-xs font-bold text-sky-900 flex items-center gap-1.5 mb-1">
                <Users className="size-3.5 text-sky-600" />
                Trải nghiệm thực tế
              </h5>
              <p className="text-[11px] leading-relaxed text-sky-700 font-medium">
                Tất cả đánh giá đến từ những khách hàng thực tế đã hoàn thành thời gian lưu trú tại địa điểm này.
              </p>
            </div>
          </div>

          {/* Right column: Search, Filter, Sort and Reviews Feed */}
          <div className="flex flex-col gap-4 overflow-hidden h-full flex-1">
            {/* Control Bar: Search and Filters */}
            <div className="flex flex-col gap-3 shrink-0">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm nội dung đánh giá..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 rounded-full border-slate-200 focus-visible:ring-sky-500 text-sm h-9 bg-slate-50/50 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-all duration-200"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Filter by star rating and Sort select */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mr-1">Lọc:</span>
                  {["all", "5", "4", "3", "2", "1"].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSelectedRating(val)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all border ${
                        selectedRating === val
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100"
                      }`}
                    >
                      {val === "all" ? "Tất cả" : `${val} ★`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium shrink-0">Sắp xếp:</span>
                  <Select value={sortBy} onValueChange={setSortBy} enableModal={false}>
                    <SelectTrigger className="text-xs font-semibold h-8 min-h-8 rounded-lg px-2.5 py-1 w-[150px] border-slate-200 bg-white">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent className="z-[150] rounded-xl bg-white border border-slate-200 shadow-xl">
                      <SelectItem value="newest" className="text-xs py-2">Mới nhất</SelectItem>
                      <SelectItem value="highest" className="text-xs py-2">Đánh giá cao nhất</SelectItem>
                      <SelectItem value="lowest" className="text-xs py-2">Đánh giá thấp nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Scrollable Reviews Feed */}
            <div className="flex-1 overflow-y-auto pr-1 divide-y divide-slate-100 min-h-0">
              {filteredAndSortedReviews.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm font-medium">
                  Không tìm thấy đánh giá nào khớp với bộ lọc hiện tại.
                </div>
              ) : (
                filteredAndSortedReviews.map((review) => (
                  <div key={review.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {review.user?.avatar ? (
                            <img
                              src={review.user.avatar}
                              alt={review.user.name}
                              className="size-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Users className="size-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">
                            {review.user?.name || "Khách hàng"}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(review.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${
                              i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600 leading-relaxed italic pl-12 pr-2">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
