import {
    PermissionFlagsBits,
    type Guild,
    type GuildMember,
} from "discord.js";

import { verificationConfig } from "../../../config/modules/verification.config.js";
import { VerificationSessionService } from "./verification-session.service.js";

export type VerificationResult =
    | "success"
    | "invalid"
    | "expired";

export class VerificationService {
    public static validateCode(
        guildId: string,
        userId: string,
        input: string,
    ): VerificationResult {
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

    public static async grantVerifiedRole(
        guild: Guild,
        member: GuildMember,
    ): Promise<void> {
        const role =
            guild.roles.cache.get(
                verificationConfig.verifiedRoleId,
            );

        if (!role) {
            throw new Error(
                "VERIFICATION_ROLE_NOT_FOUND",
            );
        }

        if (
            member.roles.cache.has(role.id)
        ) {
            return;
        }

        const botMember =
            guild.members.me;

        if (!botMember) {
            throw new Error(
                "BOT_MEMBER_NOT_FOUND",
            );
        }

        if (
            !botMember.permissions.has(
                PermissionFlagsBits.ManageRoles,
            )
        ) {
            throw new Error(
                "BOT_MISSING_MANAGE_ROLES",
            );
        }

        if (
            role.managed ||
            role.position >=
                botMember.roles.highest.position
        ) {
            throw new Error(
                "ROLE_HIERARCHY_ERROR",
            );
        }

        await member.roles.add(
            role,
            "Pomyślna weryfikacja użytkownika",
        );
    }
}