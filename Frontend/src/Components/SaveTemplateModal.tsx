import { Button } from "./ui/button";

interface SaveTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    onSubmit: () => void; // Callback for submission
  }
  
  export default function SaveTemplateModal({
    isOpen,
    onClose,
    message,
    onSubmit,
  }: SaveTemplateModalProps) {
    if (!isOpen) return null;
  
    const handleSave = () => {
      onSubmit();
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded shadow-lg text-center w-3/4 max-w-md">
          <p className="mb-4">{message}</p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white">
              Yes
            </Button>
            <Button onClick={onClose} className="bg-red-500 hover:bg-red-700 text-white">
              No
            </Button>
          </div>
        </div>
      </div>
    );
  }
  