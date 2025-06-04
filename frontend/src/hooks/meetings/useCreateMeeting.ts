import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { createMeeting } from '@/api/meetings';
import { MeetingCardData, MeetingCreationPayload } from '@/types/meeting';
import { toast } from 'react-toastify';
import { ApiError } from '../useHttp';

type CreateMeetingError = ApiError;

export const useCreateMeeting = (): UseMutationResult<
  MeetingCardData,
  CreateMeetingError,
  MeetingCreationPayload
> => {
  const queryClient = useQueryClient();

  return useMutation<MeetingCardData, CreateMeetingError, MeetingCreationPayload>({
    mutationFn: (meetingData: MeetingCreationPayload) => createMeeting(meetingData),
    onSuccess: (data) => {
      toast.success(`Meeting "${data.title}" erfolgreich erstellt!`);
      queryClient.invalidateQueries({ queryKey: ['meetingsSearch'] });
    },
    onError: (error) => {
      console.error('Error creating meeting:', error);
      if (error.validationErrors) {
        // Korrekte Verarbeitung von validationErrors als Record<string, string[]>
        const errorMessages: string[] = [];

        // Extrahieren aller Fehlermeldungen aus den Arrays
        Object.entries(error.validationErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors)) {
            errors.forEach((errorMsg) => {
              errorMessages.push(`${field}: ${errorMsg}`);
            });
          }
        });

        // Zusammenfügen aller Fehlermeldungen
        const messages = errorMessages.join('\n');
        toast.error(`Fehler bei der Erstellung:\n${messages}`);
      } else {
        toast.error(`Fehler: ${error.message || 'Meeting konnte nicht erstellt werden.'}`);
      }
    },
  });
};
