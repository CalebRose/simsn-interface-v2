const STREAM_CHANNELS: Record<string, { label: string }> = {
  tnt: { label: "TNT" },
  nbatv: { label: "NBA TV" },
  prime: { label: "Prime" },
  hbo: { label: "HBO" },
  int: { label: "International" },
  cbs: { label: "CBS" },
  tbs: { label: "TBS" },
  espn: { label: "ESPN" },
  ytv: { label: "YouTube TV" },
  "simfba-live": { label: "#simfba-live" },
  "b1g-noon-kickoff": { label: "#b1g-noon-kickoff" },
  "prime-time": { label: "#prime-time" },
  "pac-2-afterdark": { label: "#pac-2-afterdark" },
  "simfcs-live": { label: "#simfcs-live" },
  "simfl-live": { label: "#simfl-live" },
};

export const getStreamChannelLabel = (channel?: string): string => {
  if (!channel) return "";
  return STREAM_CHANNELS[channel.toLowerCase()]?.label ?? "";
};

// Badges are designed at 68x22 and scaled down uniformly.
const BADGE_SCALE = 0.625;

// Every badge renders at the same fixed size; the inner wordmark is styled per channel.
const BADGE_CLASS =
  "inline-flex items-center justify-center w-[68px] h-[22px] rounded-[3px] overflow-hidden leading-none select-none";

// Football channels are Discord channels, each with its own invented branding. They share one
// fixed size (wider than the basketball badges) so every channel name fits and reads clearly.
const BRAND_BADGE_CLASS =
  "inline-flex items-center justify-center w-[108px] h-[26px] rounded-[4px] overflow-hidden leading-none select-none whitespace-nowrap uppercase";

type BrandPart = {
  text: string;
  color: string;
  weight?: number;
  italic?: boolean;
};
const CHANNEL_BRANDS: Record<
  string,
  { background: string; size?: number; parts: BrandPart[] }
> = {
  "simfba-live": {
    background: "linear-gradient(90deg, #0a0a0a 0%, #1f1f1f 100%)",
    parts: [
      { text: "SimFBA", color: "#ffffff", weight: 800 },
      { text: " Live", color: "#ff3b30", weight: 800 },
    ],
  },
  "b1g-noon-kickoff": {
    background: "linear-gradient(90deg, #ffd23f 0%, #ff9f1c 100%)",
    size: 10,
    parts: [
      { text: "B1G", color: "#101010", weight: 900 },
      { text: " Noon Kickoff", color: "#101010", weight: 700 },
    ],
  },
  "prime-time": {
    background: "linear-gradient(90deg, #1b0f3a 0%, #5b21b6 100%)",
    parts: [
      { text: "Prime", color: "#ffd54a", weight: 900, italic: true },
      { text: " Time", color: "#ffffff", weight: 700, italic: true },
    ],
  },
  "pac-2-afterdark": {
    background: "linear-gradient(90deg, #05050d 0%, #1a0b2e 100%)",
    size: 10,
    parts: [
      { text: "Pac-2", color: "#22e5ff", weight: 900 },
      { text: " After Dark", color: "#ff4fd8", weight: 800 },
    ],
  },
  "simfcs-live": {
    background: "linear-gradient(90deg, #14532d 0%, #1f7a43 100%)",
    parts: [
      { text: "SimFCS", color: "#ffffff", weight: 800 },
      { text: " Live", color: "#facc15", weight: 800 },
    ],
  },
  "simfl-live": {
    background: "linear-gradient(90deg, #0b2a5b 0%, #1d4ed8 100%)",
    parts: [
      { text: "SimFL", color: "#ffffff", weight: 800 },
      { text: " Live", color: "#bfdbfe", weight: 800 },
    ],
  },
};

const Wordmark = ({ channel }: { channel: string }) => {
  const brand = CHANNEL_BRANDS[channel];
  if (brand) {
    return (
      <span
        className={BRAND_BADGE_CLASS}
        style={{ background: brand.background }}
      >
        {brand.parts.map((part) => (
          <span
            key={part.text}
            className="tracking-tight"
            style={{
              fontSize: brand.size ?? 12,
              color: part.color,
              fontWeight: part.weight ?? 700,
              fontStyle: part.italic ? "italic" : "normal",
            }}
          >
            {part.text.replace(/ /g, " ")}
          </span>
        ))}
      </span>
    );
  }
  switch (channel) {
    case "tnt":
      return (
        <span className={`${BADGE_CLASS} bg-black text-white`}>
          <span className="text-[13px] font-black tracking-[0.18em] pl-[0.18em]">
            TNT
          </span>
        </span>
      );
    case "nbatv":
      return (
        <span className={`${BADGE_CLASS} text-white font-extrabold`}>
          <span
            className="flex-1 h-full flex items-center justify-center text-[11px] tracking-tight"
            style={{ backgroundColor: "#1d428a" }}
          >
            NBA
          </span>
          <span
            className="w-[24px] h-full flex items-center justify-center text-[11px]"
            style={{ backgroundColor: "#c8102e" }}
          >
            TV
          </span>
        </span>
      );
    case "prime":
      return (
        <span
          className={`${BADGE_CLASS} text-white`}
          style={{ backgroundColor: "#00a8e1" }}
        >
          <span className="text-[17px] font-bold lowercase tracking-tight">
            prime
          </span>
        </span>
      );
    case "hbo":
      return (
        <span
          className={`${BADGE_CLASS} text-white`}
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            background: "linear-gradient(135deg, #002be7 0%, #b535f6 100%)",
          }}
        >
          <span className="text-[14px] font-bold tracking-[0.22em] pl-[0.22em]">
            HBO
          </span>
        </span>
      );
    case "cbs":
      return (
        <span
          className={`${BADGE_CLASS} text-white`}
          style={{ backgroundColor: "#00448a" }}
        >
          <span className="text-[14px] font-extrabold tracking-wide">CBS</span>
        </span>
      );
    case "tbs":
      return (
        <span
          className={`${BADGE_CLASS} bg-white text-black`}
          style={{ border: "1px solid #000" }}
        >
          <span className="text-[14px] font-black tracking-wide">TBS</span>
        </span>
      );
    case "espn":
      return (
        <span
          className={`${BADGE_CLASS} text-white`}
          style={{ backgroundColor: "#d00" }}
        >
          <span className="text-[14px] font-black italic tracking-tight">
            ESPN
          </span>
        </span>
      );
    case "ytv":
      return (
        <span
          className={`${BADGE_CLASS} gap-1 text-white`}
          style={{ backgroundColor: "#212121" }}
        >
          <span
            className="inline-flex items-center justify-center w-[20px] h-[14px] rounded-[4px]"
            style={{ backgroundColor: "#ff0000" }}
          >
            <span
              className="block"
              style={{
                width: 0,
                height: 0,
                borderTop: "3.5px solid transparent",
                borderBottom: "3.5px solid transparent",
                borderLeft: "6px solid #fff",
                marginLeft: "1px",
              }}
            />
          </span>
          <span className="text-[12px] font-bold">TV</span>
        </span>
      );
    case "local":
      return (
        <span
          className={`${BADGE_CLASS} text-white`}
          style={{ backgroundColor: "#475569" }}
        >
          <span className="text-[10px] font-bold tracking-wide">LOCAL TV</span>
        </span>
      );
    default:
      return (
        <span
          className={`${BADGE_CLASS} text-white`}
          style={{ backgroundColor: "#475569" }}
        >
          <span className="text-[10px] font-bold tracking-wide">
            INT&apos;L
          </span>
        </span>
      );
  }
};

// Projection of where an unrevealed game will stream; shown in place of "TBC".
export const StreamChannelBadge = ({ channel }: { channel?: string }) => {
  // No projected channel means the game is not streamed: show it as local TV.
  const key =
    channel && STREAM_CHANNELS[channel.toLowerCase()]
      ? channel.toLowerCase()
      : "local";
  const label = key === "local" ? "Local TV" : STREAM_CHANNELS[key].label;
  return (
    <span
      className="inline-block"
      style={{ zoom: BADGE_SCALE }}
      title={`Projected stream: ${label}`}
    >
      <Wordmark channel={key} />
    </span>
  );
};

// Unrevealed games show their projected channel in place of "TBC". Basketball falls back to
// Local TV when a game has no channel; other leagues only show a badge when a channel is known.
export const hasPendingStream = (
  gameScore: string,
  channel: string | undefined,
  fallbackToLocal: boolean,
) =>
  gameScore === "TBC" && (fallbackToLocal || !!getStreamChannelLabel(channel));
