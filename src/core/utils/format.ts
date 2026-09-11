const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

export function formatBytes(bytes: number, decimals = 2): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return "0 B";
    }

    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        BYTE_UNITS.length - 1,
    );

    const value = bytes / 1024 ** exponent;

    return `${value.toFixed(decimals)} ${BYTE_UNITS[exponent]}`;
}

export function formatDuration(milliseconds: number): string {
    const totalSeconds = Math.max(
        0,
        Math.floor(milliseconds / 1000),
    );

    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];

    if (days > 0) {
        parts.push(`${days}d`);
    }

    if (hours > 0) {
        parts.push(`${hours}h`);
    }

    if (minutes > 0) {
        parts.push(`${minutes}m`);
    }

    if (seconds > 0 || parts.length === 0) {
        parts.push(`${seconds}s`);
    }

    return parts.join(" ");
}