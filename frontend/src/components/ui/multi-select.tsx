import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, ChevronsUpDown } from 'lucide-react';
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
import { Badge } from '@/components/ui/Badge';

export type MultiSelectOption = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onValueChange: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    { options, selected, onValueChange, className, placeholder = 'Wähle...', disabled = false, id },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (value: string) => {
      onValueChange((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    };

    const handleRemove = (value: string) => {
      onValueChange((prev) => prev.filter((v) => v !== value));
    };

    const selectedLabels = selected
      .map((value) => options.find((option) => option.value === value)?.label)
      .filter(Boolean) as string[];

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            ref={ref}
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between h-auto min-h-9', className)}
            onClick={() => setOpen(!open)}
            disabled={disabled}
          >
            <div className="flex gap-1 flex-wrap">
              {selected.length > 0 ? (
                selectedLabels.map((label, index) => (
                  <Badge
                    variant="secondary"
                    key={selected[index]}
                    className="mr-1 mb-1"
                    aria-label={`Entferne ${label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(selected[index]);
                    }}
                  >
                    {label}
                    <X className="ml-1 h-3 w-3 cursor-pointer" aria-hidden="true" />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Suchen..." />
            <CommandList>
              <CommandEmpty>Nichts gefunden.</CommandEmpty>
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
                      handleSelect(newValue);
                      setOpen(false);
                    }}
                    aria-selected={selected.includes(option.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                      )}
                      aria-hidden="true"
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
);

MultiSelect.displayName = 'MultiSelect';

export { MultiSelect };
