import { verificationConfig } from "../../../config/modules/verification.config.js";
import type { VerificationAttemptRecord } from "./verification.types.js";

export class VerificationAttemptService {
    private static readonly records =
        new Map<string, VerificationAttemptRecord>();


    public static isLocked(
        guildId: string,
        userId: string,
    ): number | null {
        const record =
            this.records.get(
                this.getKey(guildId, userId),
            );

        if (
            !record ||
            record.lockedUntil === null
        ) {
            return null;
        }

        if (Date.now() > record.lockedUntil) {
            this.reset(guildId, userId);

            return null;
        }

        return record.lockedUntil;
    }


    public static registerFailure(
        guildId: string,
        userId: string,
    ): number | null {
        const key =
            this.getKey(guildId, userId);

        const record: VerificationAttemptRecord =
            this.records.get(key) ?? {
                failedAttempts: 0,
                lockedUntil: null,
            };

        record.failedAttempts += 1;

        if (
            record.failedAttempts >=
            verificationConfig.attempts.maxFailedAttempts
        ) {
            record.lockedUntil =
                Date.now() +
                verificationConfig.attempts.lockoutDurationSeconds * 1000;

            record.failedAttempts = 0;
        }

        this.records.set(key, record);

        return record.lockedUntil;
    }


    public static reset(
        guildId: string,
        userId: string,
    ): void {
        this.records.delete(
            this.getKey(guildId, userId),
        );
    }

    
    private static getKey(
        guildId: string,
        userId: string,
    ): string {
        return `${guildId}:${userId}`;
    }
}