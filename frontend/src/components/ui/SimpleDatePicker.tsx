import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface SimpleDatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  label?: string;
  id?: string;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
  label,
  id,
  selectedDate,
  onDateChange,
  className,
  disabled,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      const [year, month, day] = value.split('-').map(Number);
      onDateChange(new Date(year, month - 1, day));
    } else {
      onDateChange(undefined);
    }
  };

  const formattedDate = selectedDate ? selectedDate.toLocaleDateString('en-CA') : '';

  return (
    <div>
      {label && id && (
        <label htmlFor={id} className="text-sm font-medium mb-1 block">
          {label}
        </label>
      )}
      <Input
        type="date"
        id={id}
        value={formattedDate}
        onChange={handleChange}
        className={cn('w-full', className)}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

export default SimpleDatePicker;
