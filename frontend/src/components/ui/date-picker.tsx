// import { format } from 'date-fns';
// import { de } from 'date-fns/locale';
// import { Calendar as CalendarIcon } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// export interface DatePickerProps {
//   date: Date | undefined;
//   onDateChange: (date: Date | undefined) => void;
//   placeholder?: string;
//   className?: string;
//   popoverContentClassName?: string;
//   disabled?: (date: Date) => boolean;
//   id?: string;
//   [key: string]: any;
// }

// export function DatePicker({
//   date,
//   onDateChange,
//   placeholder = 'Datum wählen...',
//   className,
//   popoverContentClassName,
//   disabled,
//   id,
//   ...props
// }: DatePickerProps) {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button
//           id={id}
//           variant={'outline'}
//           className={cn(
//             'w-full justify-start text-left font-normal',
//             !date && 'text-muted-foreground',
//             className
//           )}
//           {...props}
//         >
//           <CalendarIcon className="mr-2 h-4 w-4" />
//           {date ? format(date, 'PPP', { locale: de }) : <span>{placeholder}</span>}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent
//         className={cn('w-auto p-0', 'w-auto p-0', popoverContentClassName)}
//         align="start"
//         sideOffset={4}
//       >
//         <Calendar
//           mode="single"
//           selected={date}
//           onSelect={onDateChange}
//           disabled={disabled}
//           initialFocus
//           locale={de}
//         />
//       </PopoverContent>
//     </Popover>
//   );
// }
