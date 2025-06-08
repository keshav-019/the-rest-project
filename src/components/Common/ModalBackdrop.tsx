interface ModalBackdropProps {
        children: React.ReactNode;
        onClose: () => void;
}

export default function ModalBackdrop ({ children, onClose }: ModalBackdropProps) {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
                className="fixed inset-0 bg-gray-500 dark:bg-gray-900 opacity-75 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                {children}
            </div>
        </div>
    );
};