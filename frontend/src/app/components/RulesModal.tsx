import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { CLASSROOM_RULES } from '../lib/mockData';
import { CheckCircle2 } from 'lucide-react';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
  classroomName: string;
}

export function RulesModal({ open, onClose, classroomName }: RulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Reservation Confirmed!</DialogTitle>
          <DialogDescription className="text-center">
            Your reservation for {classroomName} has been successfully confirmed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3 text-[#2563eb]">Classroom Usage Rules</h3>
          <ul className="space-y-2">
            {CLASSROOM_RULES.map((rule, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-[#2563eb] mt-0.5">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <Button onClick={onClose} className="w-full bg-[#2563eb] hover:bg-[#1d4ed8]">
            I Understand
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
