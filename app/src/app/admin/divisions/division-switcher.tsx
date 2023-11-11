"use client";

import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/Avatar";
import { Button } from "~/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/Popover";

export default function DivisionSwitcher() {
  const [open, setOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string>();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label="Select a team"
          className="w-[200px] justify-between"
        >
          {selectedDivision}
          <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search division" />
            <CommandEmpty>No division found.</CommandEmpty>
            <CommandGroup>
              {["Open", "Undergraduate"].map((division) => (
                <CommandItem
                  key={division}
                  className="cursor-pointer"
                  onSelect={() => {
                    setOpen(false);
                  }}
                >
                  {division}
                  <CheckIcon className="ml-auto h-4 w-4" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                className="cursor-pointer"
                onSelect={() => {
                  setOpen(false);
                }}
              >
                <PlusCircledIcon className="mr-2 h-5 w-5" />
                Create Division
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
