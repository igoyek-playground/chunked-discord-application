import { verificationConfig } from "../../../config/modules/verification.config.js";
import type { VerificationCodeResult } from "./verification.types.js";
import { VerificationSessionService } from "./verification-session.service.js";

export class VerificationService {
    public static validateCode(
        guildId: string,
        userId: string,
        input: string,
    ): VerificationCodeResult {
        const session =
            VerificationSessionService.get(
                guildId,
                userId,
            );

        if (!session) {
            return "expired";
        }

        const expected =
            verificationConfig.code.caseInsensitive
                ? session.code.toUpperCase()
                : session.code;

        const received =
            verificationConfig.code.caseInsensitive
                ? input.trim().toUpperCase()
                : input.trim();

        if (expected !== received) {
            return "invalid";
        }

        VerificationSessionService.delete(
            guildId,
            userId,
        );

        return "success";
    }
}