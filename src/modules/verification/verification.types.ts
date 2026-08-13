import type { ButtonStyle } from "discord.js";

export interface VerificationConfig {
    enabled: boolean;

    verifiedRoleId: string;

    code: {
        length: number;
        expiresAfterSeconds: number;
        caseInsensitive: boolean;
    };

    panel: {
        accentColor: number;
        title: string;
        description: string;
        footer: string;

        button: {
            label: string;
            style: ButtonStyle;
            emoji?: string;
        };
    };

    modal: {
        title: string;
        codeText: string;

        input: {
            label: string;
            description: string;
            placeholder: string;
        };
    };

    messages: {
        disabled: string;
        alreadyVerified: string;
        invalidCode: string;
        expiredCode: string;
        verified: string;
        missingRole: string;
        roleHierarchyError: string;
        internalError: string;
    };
}

export interface VerificationSession {
    code: string;
    guildId: string;
    userId: string;
    expiresAt: number;
}