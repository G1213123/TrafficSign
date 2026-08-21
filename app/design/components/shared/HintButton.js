'use client';

import { useEffect, useRef, useState } from 'react';

import { HintModal } from '../../lib/modal/md-hint.js';
import { useTouchLongPress } from '../../lib/canvas/touchEvents.js';

export default function HintButton({ hintPath, label }) {
    const [hintModalState, setHintModalState] = useState({ isOpen: false, anchorRect: null });
    const closeTimerRef = useRef(null);
    const modalHoverRef = useRef(false);

    useEffect(() => () => {
        clearTimeout(closeTimerRef.current);
    }, []);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const openHint = (element) => {
        clearCloseTimer();
        modalHoverRef.current = false;
        setHintModalState({ isOpen: true, anchorRect: element.getBoundingClientRect() });
    };

    const scheduleCloseHint = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => {
            if (!modalHoverRef.current) {
                setHintModalState({ isOpen: false, anchorRect: null });
            }
        }, 500);
    };

    const closeHint = () => {
        clearCloseTimer();
        modalHoverRef.current = false;
        setHintModalState({ isOpen: false, anchorRect: null });
    };

    const { touchHandlers, shouldSuppressClick } = useTouchLongPress(
        (event) => openHint(event.currentTarget),
        {
            onLongPressEnd: () => {
                clearCloseTimer();
                closeTimerRef.current = setTimeout(closeHint, 2500);
            },
        }
    );

    return (
        <>
            <button
                type="button"
                className="help-icon"
                aria-label={label}
                title={label}
                onClick={(event) => {
                    if (shouldSuppressClick()) {
                        return;
                    }
                    if (hintModalState.isOpen) {
                        closeHint();
                    } else {
                        openHint(event.currentTarget);
                    }
                }}
                onMouseEnter={(event) => openHint(event.currentTarget)}
                onMouseLeave={scheduleCloseHint}
                onFocus={(event) => openHint(event.currentTarget)}
                onBlur={scheduleCloseHint}
                {...touchHandlers}
            >
                ?
            </button>
            <HintModal
                isOpen={hintModalState.isOpen}
                onClose={closeHint}
                hintPath={hintPath}
                anchorRect={hintModalState.anchorRect}
                onMouseEnter={() => {
                    clearCloseTimer();
                    modalHoverRef.current = true;
                }}
                onMouseLeave={() => {
                    modalHoverRef.current = false;
                    scheduleCloseHint();
                }}
            />
        </>
    );
}