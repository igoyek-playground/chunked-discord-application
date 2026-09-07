import { ButtonStyle } from "discord.js";

import type { VerificationConfig } from "../../src/modules/verification/verification.types.js";

export const verificationConfig = {
    // =========================================================================
    // PODSTAWOWA KONFIGURACJA
    // =========================================================================

    /**
     * Włącza lub wyłącza cały moduł weryfikacji.
     */
    enabled: true,

    /**
     * ID roli nadawanej użytkownikowi po poprawnej weryfikacji.
     */
    verifiedRoleId: "1364686353933144074",


    // =========================================================================
    // KOD WERYFIKACYJNY
    // =========================================================================

    code: {
        /**
         * Długość generowanego kodu.
         *
         * Przykład:
         * 4 -> 4PL7
         * 6 -> 19PA7B
         *
         * Pamiętaj, że kod trafia bezpośrednio do TYTUŁU modala razem
         * z tekstem z `modal.titleTemplate` — Discord ogranicza tytuł
         * do 45 znaków.
         */
        length: 6,

        /**
         * Po ilu sekundach nieużyty kod traci ważność.
         *
         * 300 = 5 minut.
         */
        expiresAfterSeconds: 300,

        /**
         * Jeśli true:
         * "4PL7" oraz "4pl7" będą traktowane tak samo.
         */
        caseInsensitive: false,
    },


    // =========================================================================
    // BLOKADA PO BŁĘDNYCH PRÓBACH (COOLDOWN)
    // =========================================================================

    attempts: {
        /**
         * Po ilu błędnie przepisanych kodach z rzędu użytkownik
         * zostaje czasowo zablokowany.
         */
        maxFailedAttempts: 3,

        /**
         * Jak długo (w sekundach) trwa blokada po przekroczeniu limitu prób.
         *
         * 900 = 15 minut.
         */
        lockoutDurationSeconds: 900,
    },


    // =========================================================================
    // PANEL WERYFIKACJI
    // =========================================================================

    panel: {
        /**
         * Kolor bocznego akcentu kontenera Components V2.
         */
        accentColor: 0x5865F2,

        title: "WERYFIKACJA",

        description:
            "Potwierdź, że znasz **regulamin serwera**, a otrzymasz dostęp do pozostałych kanałów.\n" +
            "Kliknij przycisk obok i przepisz wygenerowany kod.",

        footer:
            "Masz problem z weryfikacją? Skontaktuj się z administracją.",

        button: {
            label: "Zweryfikuj się",
            style: ButtonStyle.Success,

            /**
             * Opcjonalne emoji przycisku.
             *
             * Ustaw undefined, jeśli przycisk ma być bez emoji.
             */
            emoji: "✅",
        },
    },


    // =========================================================================
    // MODAL
    // =========================================================================

    modal: {
        /**
         * {CODE} zostanie zastąpione wygenerowanym kodem.
         */
        titleTemplate: "Przepisz kod: {CODE}",

        input: {
            label: "Kod weryfikacyjny",
            placeholder: "Np. 4PL7A9",
        },
    },


    // =========================================================================
    // KOMUNIKATY
    // =========================================================================

    messages: {
        disabled:
            "Moduł weryfikacji jest obecnie wyłączony.",

        alreadyVerified:
            "Posiadasz już rolę zweryfikowanego użytkownika.",

        invalidCode:
            "Podany kod weryfikacyjny jest niepoprawny.",

        expiredCode:
            "Kod weryfikacyjny wygasł. Kliknij przycisk weryfikacji ponownie.",

        verified:
            "Weryfikacja zakończona pomyślnie. Otrzymałeś dostęp do serwera.",

        missingRole:
            "Nie znaleziono skonfigurowanej roli weryfikacyjnej.",

        roleHierarchyError:
            "Bot nie może nadać roli weryfikacyjnej. Sprawdź hierarchię ról i uprawnienie Zarządzanie rolami.",

        internalError:
            "Wystąpił błąd podczas weryfikacji. Spróbuj ponownie później.",

        locked:
            "Zbyt wiele nieudanych prób weryfikacji. Spróbuj ponownie {EXPIRES}.",

        forceVerified:
            "{USER} został zweryfikowany ręcznie.",

        limitRemoved:
            "Limit prób weryfikacji dla {USER} został zresetowany.",
    },
} satisfies VerificationConfig;