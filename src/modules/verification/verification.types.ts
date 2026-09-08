import type { ButtonStyle, HexColorString } from "discord.js";

export interface VerificationConfig {
    enabled: boolean;

    /**
     * ID roli nadawanej użytkownikowi po poprawnej weryfikacji.
     */
    verifiedRoleId: string;

    code: {
        /**
         * Długość generowanego kodu (wielkie litery + cyfry).
         */
        length: number;

        /**
         * Po ilu sekundach nieużyty kod traci ważność.
         */
        expiresAfterSeconds: number;

        caseInsensitive: boolean;
    };

    attempts: {
        /**
         * Po ilu błędnie przepisanych kodach z rzędu nakładana jest blokada.
         */
        maxFailedAttempts: number;

        /**
         * Jak długo (w sekundach) trwa blokada po przekroczeniu limitu prób.
         */
        lockoutDurationSeconds: number;
    };

    panel: {
        /**
         * Kolor w formacie HEX, np. "#5865F2".
         */
        accentColor: HexColorString;
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
        /**
         * Tytuł okna modala. {CODE} zostanie zastąpione wygenerowanym kodem.
         *
         * Uwaga: Discord ogranicza tytuł modala do 45 znaków — dobierz
         * `code.length` tak, żeby cały tytuł się zmieścił.
         */
        titleTemplate: string;

        input: {
            label: string;
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

        /**
         * {EXPIRES} zostanie zastąpione znacznikiem czasu Discorda (`<t:...:R>`).
         */
        locked: string;

        /**
         * {USER} zostanie zastąpione wzmianką o użytkowniku.
         */
        forceVerified: string;

        /**
         * {USER} zostanie zastąpione wzmianką o użytkowniku.
         */
        limitRemoved: string;
    };
}

/**
 * Aktywny, jeszcze niewykorzystany kod wygenerowany dla danego użytkownika.
 */
export interface VerificationSession {
    code: string;
    guildId: string;
    userId: string;
    expiresAt: number;
}

/**
 * Stan nieudanych prób weryfikacji danego użytkownika.
 */
export interface VerificationAttemptRecord {
    failedAttempts: number;
    lockedUntil: number | null;
}

export type VerificationCodeResult =
    | "success"
    | "invalid"
    | "expired";