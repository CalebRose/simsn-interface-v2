const LAX_STREAM_CHANNELS: Record<string, string> = {
  flo: "FloSports",
  laxtv: "Lacrosse TV",
  abc: "ABC",
  espnu: "ESPNU",
};

// Badges are designed at 68x22 and scaled down uniformly, like the other sports' channel badges.
const BADGE_SCALE = 0.625;
const BADGE_CLASS =
  "inline-flex items-center justify-center w-[68px] h-[22px] rounded-[3px] overflow-hidden leading-none select-none";

const Wordmark = ({ channel }: { channel: string }) => {
  switch (channel) {
    case "flo":
      return (
        <span className={`${BADGE_CLASS} bg-white gap-[2px]`} style={{ border: "1px solid #e5e7eb" }}>
          <svg width="13" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3 0H14L13 3.2H1.8Z" fill="#ef2b24" />
            <path d="M0.5 14C1 8 4 5.5 8.5 5.5H12L11 8.6H9C6.5 8.6 5 10 4.2 14Z" fill="#ef2b24" />
          </svg>
          <span className="text-[9px] font-black italic uppercase tracking-tighter text-black">
            FloSports
          </span>
        </span>
      );
    case "laxtv":
      return (
        <span className={`${BADGE_CLASS} text-white font-extrabold`}>
          <span className="flex-1 h-full flex items-center justify-center text-[11px] tracking-tight" style={{ backgroundColor: "#166534" }}>LAX</span>
          <span className="w-[24px] h-full flex items-center justify-center text-[11px]" style={{ backgroundColor: "#facc15", color: "#111" }}>TV</span>
        </span>
      );
    case "abc":
      return (
        <span className={`${BADGE_CLASS} bg-black text-white`}>
          <span className="text-[16px] font-bold lowercase tracking-tight">abc</span>
        </span>
      );
    default:
      return (
        <span className={`${BADGE_CLASS} text-white font-extrabold`}>
          <span className="flex-1 h-full flex items-center justify-center text-[12px] italic tracking-tight" style={{ backgroundColor: "#d00" }}>ESPN</span>
          <span className="w-[16px] h-full flex items-center justify-center text-[12px] bg-white" style={{ color: "#d00" }}>U</span>
        </span>
      );
  }
};

export const hasLaxStreamChannel = (channel?: string | null) => !!channel && !!LAX_STREAM_CHANNELS[channel.toLowerCase()];

// Projection of the network an unplayed game will stream on; shown in place of "TBC".
export const LaxStreamChannelBadge = ({ channel }: { channel: string }) => {
  const key = channel.toLowerCase();
  return (
    <span className="inline-block align-middle" style={{ zoom: BADGE_SCALE }} title={`Projected stream: ${LAX_STREAM_CHANNELS[key]}`}>
      <Wordmark channel={key} />
    </span>
  );
};
