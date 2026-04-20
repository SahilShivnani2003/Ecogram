import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import AlertModal from '@components/AlertModal';
import { AlertButton, AlertConfig, AlertContextValue, AlertItem } from '@/types/AlertType';

// ─── Context ──────────────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextValue | null>(null);

// ─── Default auto-dismiss map ─────────────────────────────────────────────────

const DEFAULT_AUTO_DISMISS: Record<AlertConfig['type'], number> = {
    success: 3000,
    info: 3000,
    warn: 0,
    error: 0,
    confirm: 0,
    custom: 0,
};

const DEFAULT_BACKDROP: Record<AlertConfig['type'], boolean> = {
    success: true,
    info: true,
    warn: true,
    error: true,
    confirm: false,
    custom: true,
};

let _idCounter = 0;
function genId(): string {
    return `alert_${Date.now()}_${++_idCounter}`;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface AlertProviderProps {
    children: React.ReactNode;
    maxQueue?: number;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children, maxQueue = 10 }) => {
    const [queue, setQueue] = useState<AlertItem[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // The currently visible alert is always queue[0]
    const current = queue[0] ?? null;

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const removeById = useCallback(
        (id: string) => {
            clearTimer();
            setQueue(q => q.filter(item => item.id !== id));
        },
        [clearTimer],
    );

    const startTimer = useCallback(
        (id: string, ms: number) => {
            clearTimer();
            if (ms > 0) {
                timerRef.current = setTimeout(() => removeById(id), ms);
            }
        },
        [clearTimer, removeById],
    );

    // Whenever queue[0] changes, set up the auto-dismiss timer
    React.useEffect(() => {
        if (!current) return;
        const ms = current.config.autoDismissMs ?? DEFAULT_AUTO_DISMISS[current.config.type];
        startTimer(current.id, ms);
        return () => clearTimer();
    }, [current?.id]); // only re-run when the front item changes

    // ── Public API ─────────────────────────────────────────────────────────

    const show = useCallback(
        (config: AlertConfig): (() => void) => {
            const id = config.id ?? genId();
            const item: AlertItem = { id, config };

            setQueue(q => {
                const next = [...q, item];
                return next.length > maxQueue ? next.slice(next.length - maxQueue) : next;
            });

            return () => removeById(id);
        },
        [maxQueue, removeById],
    );

    const success = useCallback(
        (message: string, options?: Partial<AlertConfig>) =>
            show({ type: 'success', message, title: 'Success', ...options }),
        [show],
    );

    const error = useCallback(
        (message: string, options?: Partial<AlertConfig>) =>
            show({ type: 'error', message, title: 'Error', ...options }),
        [show],
    );

    const warn = useCallback(
        (message: string, options?: Partial<AlertConfig>) =>
            show({ type: 'warn', message, title: 'Warning', ...options }),
        [show],
    );

    const info = useCallback(
        (message: string, options?: Partial<AlertConfig>) =>
            show({ type: 'info', message, title: 'Info', ...options }),
        [show],
    );

    const confirm = useCallback(
        (message: string, buttons: AlertButton[], options?: Partial<AlertConfig>) =>
            show({
                type: 'confirm',
                message,
                title: 'Confirm',
                buttons,
                dismissOnBackdrop: false,
                ...options,
            }),
        [show],
    );

    const dismiss = useCallback(() => {
        if (current) removeById(current.id);
    }, [current, removeById]);

    const dismissAll = useCallback(() => {
        clearTimer();
        setQueue([]);
    }, [clearTimer]);

    // ── Handle backdrop press ──────────────────────────────────────────────

    const handleBackdropPress = useCallback(() => {
        if (!current) return;
        const canDismiss =
            current.config.dismissOnBackdrop ?? DEFAULT_BACKDROP[current.config.type];
        if (canDismiss) removeById(current.id);
    }, [current, removeById]);

    // ── Handle button press ────────────────────────────────────────────────

    const handleButtonPress = useCallback(
        async (btn: AlertButton) => {
            if (!current) return;

            const result = await btn.onPress?.();
            // If handler explicitly returns false OR preventClose is set, don't close
            if (result === false || btn.preventClose) return;

            removeById(current.id);
        },
        [current, removeById],
    );

    // ── Context value ──────────────────────────────────────────────────────

    const value: AlertContextValue = {
        show,
        success,
        error,
        warn,
        info,
        confirm,
        dismiss,
        dismissAll,
    };

    return (
        <AlertContext.Provider value={value}>
            {children}

            {/* Render the current (top-of-queue) alert */}
            {current && (
                <AlertModal
                    key={current.id}
                    config={current.config}
                    onBackdropPress={handleBackdropPress}
                    onButtonPress={handleButtonPress}
                    onDismiss={() => removeById(current.id)}
                    queueLength={queue.length}
                />
            )}
        </AlertContext.Provider>
    );
};

export function useAlert(): AlertContextValue {
    const ctx = useContext(AlertContext);
    if (!ctx) {
        throw new Error('useAlert must be used inside <AlertProvider>.');
    }
    return ctx;
}

export default AlertContext;
