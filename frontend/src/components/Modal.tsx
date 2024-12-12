import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean; 
  children: React.ReactNode;
  onClose?: () => void; 
}

const Modal: React.FC<ModalProps> = ({ open, children, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog) {
      if (open) {
        if (!dialog.open) {
          dialog.showModal();
        }
      } else if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  return createPortal(
    <dialog className="modal" ref={dialogRef} onClose={onClose}>
      {open && children}
    </dialog>,
    document.getElementById("modal") as HTMLElement // Ensures the portal target exists
  );
};

export default Modal;
