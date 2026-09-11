import { ButtonStyle, TextInputStyle } from "discord.js";

import type {
    TicketClaimMode,
    TicketsConfig,
} from "../../src/modules/tickets/tickets.types.js";

export const ticketsConfig = {
    // =========================================================================
    // PODSTAWOWA KONFIGURACJA
    // =========================================================================

    /**
     * Włącza lub wyłącza cały moduł ticketów.
     */
    enabled: true,


    // =========================================================================
    // LIMIT TICKETÓW NA UŻYTKOWNIKA
    // =========================================================================

    limits: {
        /**
         * Maksymalna liczba jednocześnie otwartych ticketów na użytkownika.
         *
         * 0 = brak limitu.
         */
        maxOpenTicketsPerUser: 2,

        /**
         * true  - limit dotyczy SUMY wszystkich otwartych ticketów
         *          użytkownika, niezależnie od kategorii (np. 2 tickety
         *          łącznie, nieważne z jakich kategorii).
         * false - limit liczony jest OSOBNO dla każdej kategorii (np.
         *          2 tickety "Wsparcie" ORAZ osobno 2 tickety "Zgłoszenia").
         */
        limitAppliesAcrossAllCategories: true,
    },


    // =========================================================================
    // PRZEJMOWANIE TICKETA
    // =========================================================================

    claim: {
        /**
         * Zachowanie po kliknięciu przycisku "Przejmij":
         *
         * "isolateOthers"  - pozostałe role administracyjne tracą widok
         *                     ticketa, zostaje tylko zainteresowany
         *                     i osoba przejmująca.
         * "readOnlyOthers" - pozostałe role zachowują widok, ale tracą
         *                     możliwość pisania. W wątkach Discord nie
         *                     pozwala na taką granulację - w tym trybie
         *                     wątki zachowują się jak "isolateOthers"
         *                     (osoby spoza zainteresowanego/przejmującego
         *                     są usuwane z wątku).
         * "silent"         - nic się nie zmienia, tylko informacja
         *                     o przejęciu.
         */
        mode: "isolateOthers" as TicketClaimMode,
    },


    // =========================================================================
    // LOGI / TRANSKRYPCJE
    // =========================================================================

    logs: {
        /**
         * ID kanału, na który trafiają transkrypcje zamkniętych ticketów.
         */
        transcriptChannelId: "1416378667721818132",
    },


    // =========================================================================
    // PANEL (SELECT MENU)
    // =========================================================================

    panel: {
        accentColor: "#5865F2",

        title: "🎫 CENTRUM POMOCY",

        description:
            "Wybierz kategorię z listy poniżej, aby otworzyć ticket.\n" +
            "Odpowiedz na kilka krótkich pytań, a nasz zespół zajmie się resztą.",

        footer: "Nadużywanie systemu ticketów może skutkować sankcjami.",

        placeholder: "Wybierz kategorię ticketa...",
    },


    // =========================================================================
    // WIADOMOŚĆ OTWIERAJĄCA TICKET
    // =========================================================================

    ticketMessage: {
        embedColor: "#5865F2",

        /**
         * Po ilu sekundach usuwana jest wiadomość z pingami wysyłana
         * zaraz po utworzeniu kanału/wątku.
         */
        pingMessageDeleteAfterSeconds: 2,
    },


    // =========================================================================
    // PRZYCISKI
    // =========================================================================

    buttons: {
        close: {
            label: "Zamknij",
            style: ButtonStyle.Danger,
            emoji: "🔒",
        },
        claim: {
            label: "Przejmij",
            style: ButtonStyle.Success,
            emoji: "🙋",
        },
        settings: {
            label: "Ustawienia",
            style: ButtonStyle.Secondary,
            emoji: "⚙️",
        },

        closeConfirm: {
            label: "Tak, zamknij",
            style: ButtonStyle.Danger,
            emoji: undefined,
        },
        closeCancel: {
            label: "Anuluj",
            style: ButtonStyle.Secondary,
            emoji: undefined,
        },

        settingsAddUser: {
            label: "Dodaj użytkownika",
            style: ButtonStyle.Secondary,
            emoji: "➕",
        },
        settingsNotifyOwner: {
            label: "Powiadom na PV",
            style: ButtonStyle.Secondary,
            emoji: "🔔",
        },
        settingsSendDm: {
            label: "Wyślij wiadomość PV",
            style: ButtonStyle.Secondary,
            emoji: "✉️",
        },
    },


    // =========================================================================
    // KOMUNIKATY
    // =========================================================================

    messages: {
        disabled: "Moduł ticketów jest obecnie wyłączony.",

        limitReached:
            "Osiągnąłeś limit jednocześnie otwartych ticketów ({LIMIT}). " +
            "Zamknij jeden z obecnych ticketów, aby otworzyć nowy.",

        invalidCategory: "Wybrana kategoria ticketów już nie istnieje.",

        missingPermissions:
            "Bot nie posiada wymaganych uprawnień, aby utworzyć ticket. Skontaktuj się z administracją.",

        categoryMisconfigured:
            "Ta kategoria ticketów jest niepoprawnie skonfigurowana. Skontaktuj się z administracją.",

        internalError:
            "Wystąpił błąd podczas obsługi ticketa. Spróbuj ponownie później.",

        closeConfirmPrompt:
            "Czy na pewno chcesz zamknąć ten ticket? Ta akcja jest nieodwracalna.",

        closeCancelled: "Zamknięcie ticketa zostało anulowane.",

        /**
         * {CHANNEL}, {OWNER}, {CATEGORY}, {CLAIMED_BY} - placeholdery.
         */
        transcriptLogTitle: "📋 Transkrypt ticketa: {CHANNEL}",

        /**
         * {USER} - wzmianka osoby przejmującej ticket.
         */
        claimedAnnouncement: "🙋 Ticket został przejęty przez {USER}.",

        claimReadOnlyThreadFallbackNotice:
            "Uwaga: w wątkach Discord nie pozwala na tryb tylko-do-odczytu dla pojedynczych osób - pozostali członkowie zostali usunięci z wątku.",

        settingsAddUserPrompt: "Wybierz użytkownika, którego chcesz dodać do ticketa:",

        /**
         * {USER} - wzmianka dodanego użytkownika.
         */
        settingsUserAdded: "{USER} został dodany do ticketa.",

        settingsNotifySent: "Zainteresowany otrzymał powiadomienie na PV.",
        settingsNotifyDmFailed:
            "Nie udało się wysłać powiadomienia - zainteresowany ma zablokowane wiadomości prywatne.",

        settingsDmModalTitle: "Wiadomość prywatna do zainteresowanego",
        settingsDmInputLabel: "Treść wiadomości",
        settingsDmInputPlaceholder: "Wpisz wiadomość, która zostanie wysłana na PV...",
        settingsDmSent: "Wiadomość została wysłana na PV.",
        settingsDmFailed:
            "Nie udało się wysłać wiadomości - zainteresowany ma zablokowane wiadomości prywatne.",

        /**
         * {CHANNEL} - nazwa kanału/wątku ticketa.
         */
        ownerNotifyDmContent:
            "Cześć! Masz nową wiadomość w swoim tickecie ({CHANNEL}). Sprawdź go na serwerze.",
    },


    // =========================================================================
    // KATEGORIE TICKETÓW
    // =========================================================================

    categories: [
        {
            key: "wsparcie",

            select: {
                label: "Wsparcie techniczne",
                description: "Problemy z serwerem, kontem lub botem.",
                emoji: "🛠️",
            },

            channelPrefix: "wsparcie",

            /**
             * Ta kategoria tworzy KLASYCZNE KANAŁY w podanej kategorii
             * Discorda (parentCategoryId).
             */
            location: {
                type: "channel",
                parentCategoryId: "1111111111111111111",
            },

            staffRoles: [
                { roleId: "2222222222222222222" },
                { roleId: "3333333333333333333" },
            ],

            pingRoleIds: ["3333333333333333333"],

            questions: [
                {
                    id: "opis",
                    label: "Opisz swój problem",
                    style: TextInputStyle.Paragraph,
                    placeholder: "Podaj jak najwięcej szczegółów...",
                    required: true,
                    minLength: 10,
                    maxLength: 1000,
                },
                {
                    id: "kiedy",
                    label: "Kiedy problem wystąpił po raz pierwszy?",
                    style: TextInputStyle.Short,
                    placeholder: "Np. dzisiaj rano",
                    required: false,
                    maxLength: 200,
                },
            ],
        },

        {
            key: "zgloszenie",

            select: {
                label: "Zgłoszenie użytkownika",
                description: "Zgłoś naruszenie regulaminu przez innego użytkownika.",
                emoji: "🚨",
            },

            channelPrefix: "zgloszenie",

            /**
             * Ta kategoria tworzy PRYWATNE WĄTKI pod podanym kanałem
             * (parentChannelId).
             */
            location: {
                type: "thread",
                parentChannelId: "4444444444444444444",
            },

            staffRoles: [
                { roleId: "2222222222222222222" },
            ],

            pingRoleIds: ["2222222222222222222"],

            questions: [
                {
                    id: "zglaszany",
                    label: "Kogo zgłaszasz? (nick lub ID)",
                    style: TextInputStyle.Short,
                    required: true,
                    maxLength: 100,
                },
                {
                    id: "opis",
                    label: "Opisz sytuację",
                    style: TextInputStyle.Paragraph,
                    required: true,
                    minLength: 10,
                    maxLength: 1000,
                },
                {
                    id: "dowody",
                    label: "Linki do dowodów (screeny, nagrania)",
                    style: TextInputStyle.Paragraph,
                    required: false,
                    maxLength: 500,
                },
            ],
        },
    ],
} satisfies TicketsConfig;