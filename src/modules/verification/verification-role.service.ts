import {
    PermissionFlagsBits,
    type Guild,
    type GuildMember,
} from "discord.js";

import { verificationConfig } from "../../../config/modules/verification.config.js";

export class VerificationRoleService {
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

        if (member.roles.cache.has(role.id)) {
            return;
        }

        const botMember = guild.members.me;

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
            "Weryfikacja użytkownika",
        );
    }
}