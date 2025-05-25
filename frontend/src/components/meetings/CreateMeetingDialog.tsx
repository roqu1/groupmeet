import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/comboBox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import SimpleDatePicker from '@/components/ui/SimpleDatePicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Loader2 } from 'lucide-react';
import { LOCATION_OPTIONS } from '@/config/options';

type CreateMeetingDialogProps = {
  formatOptions: Array<{ value: string; label: string }>;
  artOptions: MultiSelectOption[];
};

const CreateMeetingDialog: React.FC<CreateMeetingDialogProps> = ({ formatOptions, artOptions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMeetingName, setNewMeetingName] = useState('');
  const [newMeetingDescription, setNewMeetingDescription] = useState('');
  const [newMeetingLocation, setNewMeetingLocation] = useState<string>('');
  const [newMeetingMaxParticipants, setNewMeetingMaxParticipants] = useState<string>('');
  const [newMeetingDateTime, setNewMeetingDateTime] = useState<Date | undefined>();
  const [newMeetingFormat, setNewMeetingFormat] = useState<string>('');
  const [newMeetingArt, setNewMeetingArt] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFormFields = () => {
    setNewMeetingName('');
    setNewMeetingDescription('');
    setNewMeetingLocation('');
    setNewMeetingMaxParticipants('');
    setNewMeetingDateTime(undefined);
    setNewMeetingFormat('');
    setNewMeetingArt([]);
  };

  const handleCreateMeetingSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const meetingData = {
      name: newMeetingName,
      description: newMeetingDescription,
      location: newMeetingLocation,
      maxParticipants: newMeetingMaxParticipants ? parseInt(newMeetingMaxParticipants) : undefined,
      dateTime: newMeetingDateTime,
      format: newMeetingFormat,
      art: newMeetingArt,
    };
    console.log('Create meeting submitted:', meetingData);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      resetFormFields();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button>
          {' '}
          <PlusCircle className="mr-2 h-4 w-4" /> Meeting erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neues Meeting erstellen</DialogTitle>
          <DialogDescription>
            Füllen Sie die Details für Ihr neues Meeting aus. Klicken Sie auf "Erstellen", wenn Sie
            fertig sind.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleCreateMeetingSubmit}
          className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-name-modal" className="text-right col-span-1">
              Name*
            </Label>
            <Input
              id="meeting-name-modal"
              value={newMeetingName}
              onChange={(e) => setNewMeetingName(e.target.value)}
              className="col-span-3"
              placeholder="Titel des Meetings"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
            <Label htmlFor="meeting-description-modal" className="text-right col-span-1 pt-2">
              Beschreibung
            </Label>
            <Textarea
              id="meeting-description-modal"
              value={newMeetingDescription}
              onChange={(e) => setNewMeetingDescription(e.target.value)}
              className="col-span-3"
              placeholder="Beschreiben Sie Ihr Meeting..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-location-modal" className="text-right col-span-1">
              Ort
            </Label>
            <Combobox
              id="meeting-location-modal"
              options={LOCATION_OPTIONS}
              value={newMeetingLocation}
              onSelect={setNewMeetingLocation}
              placeholder="Ort wählen..."
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-max-participants-modal" className="text-right col-span-1">
              Max. Teilnehmer
            </Label>
            <Input
              id="meeting-max-participants-modal"
              type="number"
              min="1"
              value={newMeetingMaxParticipants}
              onChange={(e) => setNewMeetingMaxParticipants(e.target.value)}
              className="col-span-3"
              placeholder="z.B. 25"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-datetime-modal" className="text-right col-span-1">
              Datum & Zeit*
            </Label>
            <SimpleDatePicker
              id="meeting-datetime-modal"
              selectedDate={newMeetingDateTime}
              onDateChange={setNewMeetingDateTime}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-format-modal" className="text-right col-span-1">
              Format*
            </Label>
            <Select value={newMeetingFormat} onValueChange={setNewMeetingFormat} required>
              <SelectTrigger id="meeting-format-modal" className="col-span-3">
                <SelectValue placeholder="Format wählen..." />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-art-modal" className="text-right col-span-1">
              Art/Kategorie
            </Label>
            <MultiSelect
              id="meeting-art-modal"
              options={artOptions}
              selected={newMeetingArt}
              onValueChange={setNewMeetingArt}
              placeholder="Art wählen..."
              className="col-span-3"
            />
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeetingDialog;
