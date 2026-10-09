"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ title, onClose, children }: ModalProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog for keyboard and screen-reader users.
    boxRef.current?.querySelector<HTMLElement>(
      "input, select, textarea, button"
    )?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="mb"
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button className="x" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>,
    document.body
  );
}
