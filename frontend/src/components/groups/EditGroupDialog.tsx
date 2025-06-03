import React, { useState, useEffect } from 'react';
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
import { Loader2, Edit2 } from 'lucide-react';
import { LOCATION_OPTIONS } from '@/config/options';
import { useUpdateGroup } from '@/hooks/groups/useUpdateGroup';
import { GroupDetails } from '@/types/group';
import { toast } from 'react-toastify';

interface EditGroupDialogProps {
  group: GroupDetails;
  formatOptions:
    | ReadonlyArray<{ value: string; label: string }>
    | Array<{ value: string; label: string }>;
  artOptions: MultiSelectOption[] | ReadonlyArray<MultiSelectOption>;
  onGroupUpdated: () => void;
}

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseIsoDateWithLocalTime = (isoString: string): Date => {
  try {
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);

    let hours = 0,
      minutes = 0,
      seconds = 0;
    if (timePart) {
      const timeComponents = timePart.split(':').map(Number);
      hours = timeComponents[0] || 0;
      minutes = timeComponents[1] || 0;
      seconds = timeComponents[2] || 0;
    }

    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    return date;
  } catch (e) {
    console.error('Error parsing date from ISO string:', e);
    return new Date(isoString);
  }
};

const EditGroupDialog: React.FC<EditGroupDialogProps> = ({
  group,
  formatOptions,
  artOptions,
  onGroupUpdated,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<string>('');
  const [maxParticipants, setMaxParticipants] = useState<string>('');
  const [dateTime, setDateTime] = useState<Date | undefined>();
  const [format, setFormat] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [art, setArt] = useState<string[]>([]);

  const { mutate: updateGroupMutate, isPending: isUpdating } = useUpdateGroup();
  useEffect(() => {
    if (isOpen && group) {
      setTitle(group.title || '');
      setDescription(group.description || '');
      setLocation(group.location || '');
      setMaxParticipants(group.maxParticipants ? group.maxParticipants.toString() : '');
      setFormat(group.format || 'OFFLINE');

      if (group.dateTime) {
        const parsedDate = parseIsoDateWithLocalTime(group.dateTime);
        setDateTime(parsedDate);
      } else {
        setDateTime(undefined);
      }

      if (
        group.meetingTypeNames &&
        Array.isArray(group.meetingTypeNames) &&
        group.meetingTypeNames.length > 0
      ) {
        const validOptions = Array.isArray(artOptions) ? artOptions : [];

        const matchingIds = group.meetingTypeNames
          .map((name) => {
            const match = validOptions.find((opt) => opt.label === name);
            return match ? match.value : null;
          })
          .filter((id): id is string => id !== null);

        if (JSON.stringify(matchingIds) !== JSON.stringify(art)) {
          setArt([...matchingIds]);
        }
      } else {
        if (art.length > 0) {
          setArt([]);
        }
      }
    }
  }, [isOpen, group, artOptions]);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!group.id) return;
    const localDateTime = dateTime ? new Date(dateTime) : undefined;

    const validOptions = Array.isArray(artOptions) ? artOptions : [];
    const meetingTypeNames = art.map((artId) => {
      const option = validOptions.find((opt) => opt.value === artId);
      return option ? option.label : artId;
    });

    const groupData = {
      title,
      description,
      location,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      dateTime: localDateTime,
      format,
      meetingTypeNames: meetingTypeNames.length > 0 ? meetingTypeNames : [],
    };

    updateGroupMutate(
      { groupId: group.id.toString(), groupData },
      {
        onSuccess: () => {
          setIsOpen(false);
          toast.success('Meeting wurde erfolgreich aktualisiert');
          onGroupUpdated();
        },
        onError: (error) => {
          toast.error(
            `Fehler beim Aktualisieren des Meetings: ${error.message || 'Unbekannter Fehler'}`
          );
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="mr-2 h-4 w-4" /> Meeting korrigieren
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Meeting bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie die Details des Meetings und klicken Sie auf "Speichern", wenn Sie fertig
            sind.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-title" className="text-right col-span-1">
              Name*
            </Label>
            <Input
              id="meeting-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Titel des Meetings"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
            <Label htmlFor="meeting-description" className="text-right col-span-1 pt-2">
              Beschreibung
            </Label>
            <Textarea
              id="meeting-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Beschreibe dein Meeting..."
              rows={3}
            />
          </div>{' '}
          {format === 'OFFLINE' && (
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="meeting-location" className="text-right col-span-1">
                Ort*
              </Label>
              <Combobox
                id="meeting-location"
                options={LOCATION_OPTIONS}
                value={location}
                onSelect={setLocation}
                placeholder="Ort wählen..."
                className="col-span-3"
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-max-participants" className="text-right col-span-1">
              Max. Teilnehmer
            </Label>
            <Input
              id="meeting-max-participants"
              type="number"
              min="2"
              max="100"
              value={maxParticipants}
              onChange={(e) => {
                const value = e.target.value;
                const numberValue = parseInt(value);
                if (!isNaN(numberValue)) {
                  if (numberValue > 100) {
                    setMaxParticipants('100');
                  } else if (numberValue < 2) {
                    setMaxParticipants('2');
                  } else {
                    setMaxParticipants(value);
                  }
                } else {
                  setMaxParticipants(value);
                }
              }}
              className="col-span-3"
              placeholder="z.B. 25 (min. 2, max. 100)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-datetime" className="text-right col-span-1">
              Datum & Zeit*
            </Label>
            <Input
              id="meeting-datetime"
              type="datetime-local"
              value={dateTime ? formatDateForInput(dateTime) : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const selectedDate = new Date(e.target.value);
                  setDateTime(selectedDate);
                } else {
                  setDateTime(undefined);
                }
              }}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-format" className="text-right col-span-1">
              Format*
            </Label>{' '}
            <Select
              value={format}
              onValueChange={(value: string) => {
                const newFormat = value as 'ONLINE' | 'OFFLINE';
                setFormat(newFormat);

                if (newFormat === 'ONLINE') {
                  setLocation('');
                }
              }}
              required
            >
              <SelectTrigger id="meeting-format" className="col-span-3">
                <SelectValue placeholder="Format wählen..." />
              </SelectTrigger>{' '}
              <SelectContent>
                {Array.isArray(formatOptions) &&
                  formatOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>{' '}
          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meeting-art" className="text-right col-span-1">
              Art/Kategorie
            </Label>{' '}
            <MultiSelect
              id="meeting-art"
              options={Array.isArray(artOptions) ? [...artOptions] : []}
              selected={art}
              onValueChange={(newValues) => {
                const updatedValues = [...newValues];

                if (JSON.stringify(art.sort()) !== JSON.stringify(updatedValues.sort())) {
                  setArt([...updatedValues]);
                }
              }}
              placeholder="Art wählen..."
              className="col-span-3"
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdating}>
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog;
