// 秒 → m:ss（严格对齐 Semi audioPlayer/utils.ts，无小时/NaN 保护）。
export function formatTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
