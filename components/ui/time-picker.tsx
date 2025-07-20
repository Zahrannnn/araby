"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
}

export function TimePicker({ value, onChange, placeholder = "Select time", className }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hours, setHours] = React.useState(() => value ? parseInt(value.split(':')[0]) : 8)
  const [minutes, setMinutes] = React.useState(() => value ? parseInt(value.split(':')[1]) : 0)

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const formattedHours = newHours.toString().padStart(2, '0')
    const formattedMinutes = newMinutes.toString().padStart(2, '0')
    const timeString = `${formattedHours}:${formattedMinutes}`
    onChange?.(timeString)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Hours</label>
              <Input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
            <div className="px-2 pt-6">:</div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Minutes</label>
              <Input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 15, 30, 45].map((min) => (
              <Button
                key={min}
                variant="outline"
                size="sm"
                onClick={() => setMinutes(min)}
                className={cn(
                  "py-1 px-2",
                  minutes === min && "bg-primary text-primary-foreground"
                )}
              >
                {min.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((hour) => (
              <Button
                key={hour}
                variant="outline"
                size="sm"
                onClick={() => setHours(hour)}
                className={cn(
                  "py-1 px-2",
                  hours === hour && "bg-primary text-primary-foreground"
                )}
              >
                {hour.toString().padStart(2, '0')}
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => handleTimeChange(hours, minutes)}
            className="w-full"
          >
            Set Time
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
} 