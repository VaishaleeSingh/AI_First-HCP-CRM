import { X } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "../buttons/Button";

interface ModalProps {
  children: ReactNode;
  open: boolean;
  title: string;
  onClose: () => void;
}

export const Modal = ({ children, onClose, open, title }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <Button
            aria-label="Close modal"
            className="h-8 w-8 px-0"
            leftIcon={<X className="h-4 w-4" />}
            onClick={onClose}
            variant="ghost"
          >
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
};
