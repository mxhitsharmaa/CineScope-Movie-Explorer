export default function MovieSkeleton() {
  return (
    <div className="min-w-0">
      <div className="shimmer aspect-[2/3] rounded-xl" />
      <div className="shimmer mt-3 h-3 w-4/5 rounded-full" />
      <div className="shimmer mt-2 h-3 w-2/5 rounded-full" />
    </div>
  );
}
