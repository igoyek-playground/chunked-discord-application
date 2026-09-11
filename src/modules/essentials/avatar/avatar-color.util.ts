import sharp from "sharp";

const SAMPLE_DIMENSION = 48;
const QUANTIZE_STEP = 24;
const MIN_ALPHA = 128;

interface ColorBucket {
    count: number;
    rSum: number;
    gSum: number;
    bSum: number;
}

export class AvatarColorUtil {
    public static async extractDominantColor(
        imageUrl: string,
    ): Promise<number> {
        const buffer = await this.download(imageUrl);

        const { data, info } = await sharp(buffer)
            .resize(SAMPLE_DIMENSION, SAMPLE_DIMENSION, {
                fit: "fill",
            })
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const buckets = this.buildBuckets(data, info.channels);

        if (buckets.size === 0) {
            throw new Error("AVATAR_FULLY_TRANSPARENT");
        }

        const dominant = this.pickLargestBucket(buckets);

        return this.bucketToColor(dominant);
    }

    private static async download(
        imageUrl: string,
    ): Promise<Buffer> {
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error(
                `AVATAR_DOWNLOAD_FAILED (${response.status})`,
            );
        }

        return Buffer.from(await response.arrayBuffer());
    }

    private static buildBuckets(
        data: Buffer,
        channels: number,
    ): Map<string, ColorBucket> {
        const buckets = new Map<string, ColorBucket>();

        for (let i = 0; i + 3 < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (
                r === undefined ||
                g === undefined ||
                b === undefined ||
                a === undefined
            ) {
                continue;
            }

            if (a < MIN_ALPHA) {
                continue;
            }

            const key =
                `${Math.floor(r / QUANTIZE_STEP)}` +
                `-${Math.floor(g / QUANTIZE_STEP)}` +
                `-${Math.floor(b / QUANTIZE_STEP)}`;

            const bucket = buckets.get(key);

            if (bucket) {
                bucket.count++;
                bucket.rSum += r;
                bucket.gSum += g;
                bucket.bSum += b;

                continue;
            }

            buckets.set(key, {
                count: 1,
                rSum: r,
                gSum: g,
                bSum: b,
            });
        }

        return buckets;
    }

    private static pickLargestBucket(
        buckets: Map<string, ColorBucket>,
    ): ColorBucket {
        let largest: ColorBucket | null = null;

        for (const bucket of buckets.values()) {
            if (!largest || bucket.count > largest.count) {
                largest = bucket;
            }
        }

        if (!largest) {
            throw new Error("AVATAR_FULLY_TRANSPARENT");
        }

        return largest;
    }

    private static bucketToColor(bucket: ColorBucket): number {
        const r = Math.round(bucket.rSum / bucket.count);
        const g = Math.round(bucket.gSum / bucket.count);
        const b = Math.round(bucket.bSum / bucket.count);

        return (r << 16) + (g << 8) + b;
    }
}