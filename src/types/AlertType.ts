export type AlertType =
    | 'success'
    | 'error'
    | 'warn'
    | 'info'
    | 'confirm'
    | 'custom';

// ─── Button definition ────────────────────────────────────────────────────────

export type ButtonStyle = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface AlertButton {
    label: string;
    style?: ButtonStyle;
    onPress?: () => boolean | void | Promise<boolean | void>;
    fullWidth?: boolean;
    icon?: string;
    preventClose?: boolean;
}

// ─── Full alert config ────────────────────────────────────────────────────────

export interface AlertConfig {
    id?: string;
    type: AlertType;
    title?: string;
    message: string;
    buttons?: AlertButton[];
    autoDismissMs?: number;
    dismissOnBackdrop?: boolean;
    customIcon?: string;
    children?: React.ReactNode;
}

// ─── Internal queued item ────────────────────────────────────────────────────

export interface AlertItem extends Required<Pick<AlertConfig, 'id'>> {
    config: AlertConfig;
}

// ─── Context shape ────────────────────────────────────────────────────────────

export interface AlertContextValue {
    show: (config: AlertConfig) => () => void;
    success: (message: string, options?: Partial<AlertConfig>) => () => void;
    error: (message: string, options?: Partial<AlertConfig>) => () => void;
    warn: (message: string, options?: Partial<AlertConfig>) => () => void;
    info: (message: string, options?: Partial<AlertConfig>) => () => void;
    confirm: (
        message: string,
        buttons: AlertButton[],
        options?: Partial<AlertConfig>,
    ) => () => void;
    dismiss: () => void;
    dismissAll: () => void;
}