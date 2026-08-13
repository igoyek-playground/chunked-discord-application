import type { VerificationSession } from "./verification.types.js";

export class VerificationSessionService {
    private static readonly sessions =
        new Map<string, VerificationSession>();

    public static create(
        guildId: string,
        userId: string,
        code: string,
        expiresAfterSeconds: number,
    ): VerificationSession {
        const session: VerificationSession = {
            guildId,
            userId,
            code,

            expiresAt:
                Date.now() +
                expiresAfterSeconds * 1000,
        };

        this.sessions.set(
            this.getKey(guildId, userId),
            session,
        );

        return session;
    }

    public static get(
        guildId: string,
        userId: string,
    ): VerificationSession | null {
        const key =
            this.getKey(guildId, userId);

        const session =
            this.sessions.get(key);

        if (!session) {
            return null;
        }

        if (
            Date.now() >
            session.expiresAt
        ) {
            this.sessions.delete(key);

            return null;
        }

        return session;
    }

    public static delete(
        guildId: string,
        userId: string,
    ): void {
        this.sessions.delete(
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