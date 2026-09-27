const numberColors = [
  "bg-primary text-primary-foreground",
  "bg-blue-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
  "bg-purple-500 text-white",
];

export function LotteryBall({
  number,
  index,
  isBonus,
}: {
  number: number;
  index: number;
  isBonus?: boolean;
}) {
  return (
    <div
      className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-base shadow-md transition-transform hover:scale-110 ${
        isBonus
          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white ring-2 ring-yellow-300"
          : numberColors[index % numberColors.length]
      }`}
    >
      {number}
    </div>
  );
}
