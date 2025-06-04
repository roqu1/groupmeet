import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxOption } from '@/components/ui/comboBox';
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
import { Loader2, Edit2, AlertCircle } from 'lucide-react';
import { LOCATION_OPTIONS } from '@/config/options';
import { useUpdateGroup, UpdateGroupData } from '@/hooks/groups/useUpdateGroup';
import { useInterestOptions } from '@/hooks/options/useInterestOptions';
import { GroupDetails } from '@/types/group';
import { toast } from 'react-toastify';

interface EditGroupDialogProps {
  group: GroupDetails;
  formatOptions:
    | ReadonlyArray<{ value: string; label: string }>
    | Array<{ value: string; label: string }>;
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

const editGroupSchema = z
  .object({
    title: z.string().min(1, 'Titel ist erforderlich').max(255, 'Titel zu lang'),
    description: z.string().optional(),
    format: z.enum(['ONLINE', 'OFFLINE'], {
      required_error: 'Format ist erforderlich',
    }),
    meetingTypeNames: z
      .array(z.string().min(1, 'Art-Name darf nicht leer sein.'))
      .min(1, 'Mindestens eine Art ist erforderlich')
      .max(6, 'Maximal 5 Arten erlaubt'),
    location: z.string().optional(),
    dateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Ungültiges Datum/Uhrzeit',
    }),
    maxParticipants: z.coerce
      .number()
      .int()
      .positive('Muss positiv sein')
      .min(2, 'Mindestens 2 Teilnehmer')
      .max(100, 'Maximal 100 Teilnehmer')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.format === 'OFFLINE') {
        return !!data.location && data.location.trim() !== '';
      }
      return true;
    },
    {
      message: 'Ort ist für Offline-Meetings erforderlich',
      path: ['location'],
    }
  )
  .refine(
    (data) => {
      try {
        return new Date(data.dateTime) > new Date();
      } catch {
        return false;
      }
    },
    {
      message: 'Datum und Uhrzeit müssen in der Zukunft liegen',
      path: ['dateTime'],
    }
  );

type EditGroupFormData = z.infer<typeof editGroupSchema>;

const EditGroupDialog: React.FC<EditGroupDialogProps> = ({
  group,
  formatOptions,
  onGroupUpdated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    mutate: updateGroupMutate,
    isPending: isUpdating,
    error: submissionError,
  } = useUpdateGroup();

  const { data: interestOptionsData, isLoading: isLoadingInterests } = useInterestOptions();
  const artOptions: MultiSelectOption[] =
    interestOptionsData?.map((opt) => ({ value: opt.value, label: opt.label })) || [];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<EditGroupFormData>({
    resolver: zodResolver(editGroupSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      format: 'OFFLINE',
      meetingTypeNames: [],
      location: '',
      dateTime: '',
      maxParticipants: undefined,
    },
  });

  const selectedFormat = watch('format');

  useEffect(() => {
    if (!isOpen || !group) return;

    if (isLoadingInterests || artOptions.length === 0) return;

    const formData: Partial<EditGroupFormData> = {
      title: group.title || '',
      description: group.description || '',
      location: group.location || '',
      maxParticipants: group.maxParticipants || undefined,
      format: (group.format as 'ONLINE' | 'OFFLINE') || 'OFFLINE',
    };

    if (group.dateTime) {
      const parsedDate = parseIsoDateWithLocalTime(group.dateTime);
      formData.dateTime = formatDateForInput(parsedDate);
    }

    if (
      group.meetingTypeNames &&
      Array.isArray(group.meetingTypeNames) &&
      group.meetingTypeNames.length > 0
    ) {
      const matchingIds = group.meetingTypeNames
        .map((name) => {
          const match = artOptions.find((opt) => opt.label === name);
          return match ? match.value : null;
        })
        .filter((id): id is string => id !== null);

      formData.meetingTypeNames = matchingIds;
    } else {
      formData.meetingTypeNames = [];
    }

    reset(formData as EditGroupFormData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, group?.id, isLoadingInterests]);

  const onSubmit = (data: EditGroupFormData) => {
    if (!group.id) return;

    const localDateTime = data.dateTime ? new Date(data.dateTime) : undefined;
    const validOptions = Array.isArray(artOptions) ? artOptions : [];
    const meetingTypeNames = data.meetingTypeNames.map((artId) => {
      const option = validOptions.find((opt) => opt.value === artId);
      return option ? option.label : artId;
    });

    const groupData: UpdateGroupData = {
      title: data.title,
      description: data.description,
      location: data.location,
      maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : undefined,
      dateTime: localDateTime,
      format: data.format,
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
      }
    );
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isUpdating) {
      reset();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="mr-2 h-4 w-4" /> Meeting bearbeiten
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 scroll-container"
        >
          {submissionError && (
            <div className="col-span-4 mb-4 p-3 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {submissionError.message || 'Fehler beim Aktualisieren des Meetings.'}
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="title" className="text-right col-span-1">
              Name*
            </Label>
            <Input
              id="title"
              {...register('title')}
              className="col-span-3"
              placeholder="Titel des Meetings"
            />
            {errors.title && (
              <p className="col-start-2 col-span-3 text-destructive text-xs">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-start gap-x-4 gap-y-2">
            <Label htmlFor="description" className="text-right col-span-1 pt-2">
              Beschreibung
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              className="col-span-3"
              placeholder="Beschreibe dein Meeting..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="format" className="text-right col-span-1">
              Format*
            </Label>
            <Select
              value={selectedFormat}
              onValueChange={(value) => {
                setValue('format', value as 'ONLINE' | 'OFFLINE', { shouldValidate: true });
                if (value === 'ONLINE') {
                  setValue('location', '', { shouldValidate: true });
                }
              }}
            >
              <SelectTrigger id="format" className="col-span-3">
                <SelectValue placeholder="Format wählen..." />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(formatOptions) &&
                  formatOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.format && (
              <p className="col-start-2 col-span-3 text-destructive text-xs">
                {errors.format.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="meetingTypeNames" className="text-right col-span-1">
              Art/Kategorie*
            </Label>
            <MultiSelect
              id="meetingTypeNames"
              options={artOptions}
              selected={watch('meetingTypeNames') || []}
              onValueChange={(newValues) => {
                setValue('meetingTypeNames', newValues, { shouldValidate: true });
              }}
              placeholder={isLoadingInterests ? 'Laden...' : 'Art wählen...'}
              disabled={isLoadingInterests}
              className="col-span-3"
            />
            {errors.meetingTypeNames && (
              <p className="col-start-2 col-span-3 text-destructive text-xs">
                {errors.meetingTypeNames.message}
              </p>
            )}
          </div>

          {selectedFormat === 'OFFLINE' && (
            <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
              <Label htmlFor="location" className="text-right col-span-1">
                Ort*
              </Label>
              <Combobox
                id="location"
                options={LOCATION_OPTIONS as ComboboxOption[]}
                value={watch('location') || ''}
                onSelect={(value) => setValue('location', value, { shouldValidate: true })}
                placeholder="Ort wählen..."
                className="col-span-3"
              />
              {errors.location && (
                <p className="col-start-2 col-span-3 text-destructive text-xs">
                  {errors.location.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="dateTime" className="text-right col-span-1">
              Datum & Zeit*
            </Label>
            <Input
              id="dateTime"
              type="datetime-local"
              {...register('dateTime')}
              className="col-span-3"
            />
            {errors.dateTime && (
              <p className="col-start-2 col-span-3 text-destructive text-xs">
                {errors.dateTime.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-x-4 gap-y-2">
            <Label htmlFor="maxParticipants" className="text-right col-span-1">
              Max. Teilnehmer
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              min="2"
              max="100"
              {...register('maxParticipants')}
              className="col-span-3"
              placeholder="z.B. 25 (min. 2, max. 100)"
            />
            {errors.maxParticipants && (
              <p className="col-start-2 col-span-3 text-destructive text-xs">
                {errors.maxParticipants.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdating}>
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUpdating || !isValid}>
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
