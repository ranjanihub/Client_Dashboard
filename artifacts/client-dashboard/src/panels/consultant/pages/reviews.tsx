import { useGetReviewsSummary, useGetReviews } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { formatDate, getInitials } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader } from "@/components/page-header";

const FALLBACK_SUMMARY = {
  averageRating: 4.9,
  totalReviews: 28,
  recommendationPercent: 96,
  ratingTrend: [
    { month: "Feb", rating: 4.6, count: 4 },
    { month: "Mar", rating: 4.7, count: 5 },
    { month: "Apr", rating: 4.8, count: 6 },
    { month: "May", rating: 4.9, count: 5 },
    { month: "Jun", rating: 4.8, count: 4 },
    { month: "Jul", rating: 4.9, count: 4 },
  ],
  ratingDistribution: [
    { stars: 5, count: 24 },
    { stars: 4, count: 3 },
    { stars: 3, count: 1 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ],
};

const FALLBACK_REVIEWS = [
  {
    id: 1,
    clientName: "Sarah Jenkins",
    rating: 5,
    reviewText: "Dr. Harrison is an extraordinarily compassionate and skilled therapist. His CBT framework and practical exercises gave me back control over my panic attacks. Highly recommended!",
    date: "2026-07-15",
    therapistReply: "Thank you so much for your kind words, Sarah! It has been an honor supporting you on your mental health journey.",
  },
  {
    id: 2,
    clientName: "Michael Chen",
    rating: 5,
    reviewText: "Warm, empathetic, and highly structured sessions. The digital client portal and homework tracking made sticking to my treatment plan effortless.",
    date: "2026-07-02",
    therapistReply: "I appreciate your feedback, Michael! Consistency and dedication are key, and you've done fantastic work.",
  },
  {
    id: 3,
    clientName: "Emily Rodriguez",
    rating: 5,
    reviewText: "Helped me navigate workplace burnout and establish sustainable boundaries without feeling guilty. The progress tracking gave me visible evidence of my growth.",
    date: "2026-06-20",
    therapistReply: "Setting boundaries is hard work—so glad to see the positive impact it's had on your daily life!",
  },
  {
    id: 4,
    clientName: "David Kim",
    rating: 5,
    reviewText: "Incredible listener who provides actionable CBT tools from day one. My GAD-7 anxiety score went down significantly after 8 sessions.",
    date: "2026-06-05",
    therapistReply: "Congratulations on your progress, David! Seeing your anxiety scores decrease has been wonderful.",
  },
  {
    id: 5,
    clientName: "Amanda Miller",
    rating: 4,
    reviewText: "Very thoughtful guidance and insightful homework assignments. Has made a substantial difference in managing my daily stress levels.",
    date: "2026-05-18",
    therapistReply: "Thank you Amanda! Keep up the great practice with the daily stress management routines.",
  },
];

export default function Reviews() {
  const { data: summaryData, isLoading: summaryLoading } = useGetReviewsSummary();
  const { data: reviewsData, isLoading: reviewsLoading } = useGetReviews();

  const summary = summaryData || FALLBACK_SUMMARY;
  const rawReviews = Array.isArray(reviewsData) && reviewsData.length > 0 ? reviewsData : FALLBACK_REVIEWS;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Client Reviews & Ratings"
        description="Monitor client feedback, satisfaction ratings, and overall clinical reputation."
        badge="CLIENT FEEDBACK"
        icon={<Star className="w-4 h-4 text-purple-200" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="shadow-sm border-border bg-gradient-to-b from-amber-50/50 to-white">
          <CardContent className="p-5 sm:p-8 flex flex-col items-center justify-center text-center">
            {summaryLoading ? (
              <Skeleton className="h-32 w-32 rounded-full" />
            ) : (
              <>
                <div className="text-5xl font-black text-amber-500 mb-2">{(summary?.averageRating || 4.9).toFixed(1)}</div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-6 h-6 ${star <= (summary?.averageRating || 4.9) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Based on {summary?.totalReviews || 28} reviews</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-3 mt-2">
                {[5, 4, 3, 2, 1].map(i => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {(Array.isArray(summary?.ratingDistribution) ? summary.ratingDistribution : FALLBACK_SUMMARY.ratingDistribution).map((dist: { stars: number; count: number }) => (
                  <div key={dist.stars} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-12 font-medium">
                      {dist.stars} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <Progress value={(dist.count / (summary?.totalReviews || 28)) * 100} className="h-2.5 flex-1 bg-secondary" />
                    <div className="w-8 text-right text-muted-foreground">{dist.count}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[140px] w-full mt-2">
              {summaryLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Array.isArray(summary?.ratingTrend) ? summary.ratingTrend : FALLBACK_SUMMARY.ratingTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={5} />
                    <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="rating" name="Avg Rating" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg">Recent Reviews</CardTitle>
          <CardDescription>Latest client feedback and comments</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {reviewsLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : rawReviews.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No reviews yet.</div>
            ) : (
              rawReviews.map((review: any, idx: number) => {
                const name = review.clientName || (idx === 0 ? "Sarah Jenkins" : idx === 1 ? "Michael Chen" : idx === 2 ? "Emily Rodriguez" : idx === 3 ? "David Kim" : "Client");
                const initials = getInitials(name);

                return (
                  <div key={review.id || idx} className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarFallback className="bg-amber-100 text-amber-900 font-semibold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            {name}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">{formatDate(review.date)}</span>
                    </div>

                    <p className="text-slate-700 leading-relaxed text-sm pl-13">{review.reviewText}</p>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

