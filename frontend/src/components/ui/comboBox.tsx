import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type ComboboxOption = {
  value: string;
  label: string;
};

interface ComboboxProps {
  options: readonly ComboboxOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder = 'Wähle...',
  searchPlaceholder = 'Suchen...',
  emptyMessage = 'Nichts gefunden.',
  className,
  id,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = options.find(
    (option) => option.value.toLowerCase() === value?.toLowerCase()
  )?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={placeholder}
          className={cn('w-full justify-between', !value && 'text-muted-foreground', className)}
          disabled={disabled}
        >
          {selectedLabel ?? placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(currentLabel: string) => {
                    const selectedOption = options.find(
                      (opt) => opt.label.toLowerCase() === currentLabel.toLowerCase()
                    );
                    const newValue = selectedOption ? selectedOption.value : '';
                    onSelect(newValue.toLowerCase() === value?.toLowerCase() ? '' : newValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value?.toLowerCase() === option.value.toLowerCase()
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
