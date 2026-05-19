// /components/LiveScoreboard/scoreboardUtils.ts

export const formatClock = (seconds: number | string): string => {
    if (typeof seconds === 'string') {
        if (seconds.includes(':')) return seconds;
        seconds = parseInt(seconds, 10);
    }
    if (isNaN(seconds as number)) return "20:00";
    
    const m = Math.floor((seconds as number) / 60);
    const s = (seconds as number) % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const getPeriodName = (p: number, isSO: boolean = false): string => {
    if (isSO || p === 5) return "SO";
    if (p === 4) return "OT";
    if (p === 0) return "1st"; 
    if (p === 1) return "1st";
    if (p === 2) return "2nd";
    if (p === 3) return "3rd";
    return `P${p}`;
};

export const getQuarterName = (q: number): string => {
    if (q > 4) return `OT${q - 4}`;
    if (q === 0 || q === 1) return "1st";
    if (q === 2) return "2nd";
    if (q === 3) return "3rd";
    if (q === 4) return "4th";
    return `Q${q}`;
};

export const parseYardLine = (losStr: string, homeAbbr: string): number => {
    if (!losStr || losStr === "50") return 50;
    const parts = losStr.split(" ");
    if (parts.length < 2) return 50;
    const team = parts[0];
    const yard = parseInt(parts[1], 10);
    return team === homeAbbr ? yard : 100 - yard;
};