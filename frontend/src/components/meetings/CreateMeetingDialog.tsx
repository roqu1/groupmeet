import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { LOCATION_OPTIONS, MEETING_FORMAT_CREATION_OPTIONS } from '@/config/options';
import { MeetingFormat, MeetingCreationPayload } from '@/types/meeting';
import { useCreateMeeting } from '@/hooks/meetings/useCreateMeeting';
import { useInterestOptions } from '@/hooks/options/useInterestOptions';
import { Combobox, ComboboxOption } from '@/components/ui/comboBox';

const createMeetingSchema = z
  .object({
    title: z.string().min(1, 'Titel ist erforderlich').max(255, 'Titel zu lang'),
    description: z.string().optional(),
    format: z.enum(['ONLINE', 'OFFLINE'], {
      required_error: 'Format ist erforderlich',
    }) as z.ZodType<MeetingFormat>,
    meetingTypeNames: z
      .array(z.string().min(1, 'Art-Name darf nicht leer sein.'))
      .min(1, 'Mindestens eine Art ist erforderlich')
      .max(5, 'Maximal 5 Arten erlaubt'),
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

type CreateMeetingFormData = z.infer<typeof createMeetingSchema>;

const getDefaultDateTime = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T${String(tomorrow.getHours()).padStart(2, '0')}:${String(tomorrow.getMinutes()).padStart(2, '0')}`;
};

const CreateMeetingDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: createMeetingMutate, isPending: isSubmitting } = useCreateMeeting();

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
  } = useForm<CreateMeetingFormData>({
    resolver: zodResolver(createMeetingSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      description: '',
      format: 'OFFLINE',
      meetingTypeNames: [],
      location: '',
      dateTime: getDefaultDateTime(),
      maxParticipants: undefined,
    },
  });

  const selectedFormat = watch('format');

  const onSubmit = (data: CreateMeetingFormData) => {
    const payload: MeetingCreationPayload = {
      ...data,
      format: data.format as MeetingFormat,
      maxParticipants: data.maxParticipants ? Number(data.maxParticipants) : undefined,
    };
    createMeetingMutate(payload, {
      onSuccess: () => {
        reset();
        setIsOpen(false);
      },
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      reset();
    } else if (open) {
      reset({
        title: '',
        description: '',
        format: 'OFFLINE',
        meetingTypeNames: [],
        location: '',
        dateTime: getDefaultDateTime(),
        maxParticipants: undefined,
      });
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button>
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
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2 scroll-container"
        >
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
              placeholder="Beschreiben Sie Ihr Meeting..."
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
                setValue('format', value as MeetingFormat, { shouldValidate: true });
                if (value === 'ONLINE') {
                  setValue('location', '', { shouldValidate: true });
                }
              }}
            >
              <SelectTrigger id="format" className="col-span-3">
                <SelectValue placeholder="Format wählen..." />
              </SelectTrigger>
              <SelectContent>
                {MEETING_FORMAT_CREATION_OPTIONS.map((o) => (
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
              Art*
            </Label>
            <MultiSelect
              id="meetingTypeNames"
              options={artOptions}
              selected={watch('meetingTypeNames') || []}
              onValueChange={(newSelectedValues) => {
                setValue('meetingTypeNames', newSelectedValues, { shouldValidate: true });
              }}
              placeholder={isLoadingInterests ? 'Laden...' : 'Arten wählen...'}
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
              {...register('maxParticipants')}
              className="col-span-3"
              placeholder="z.B. 25"
            />
            {errors.maxParticipants && (
              <p className="col-start-2 col-span-3 text-destructive text-xs">
                {errors.maxParticipants.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Abbrechen
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !isValid}>
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
