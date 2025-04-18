"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import type { ReactNode } from "react"

interface SortableItemProps {
  id: string
  children: ReactNode
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative mb-2">
      <div className="flex items-stretch">
        {/* Drag handle - made more prominent */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center px-2 bg-gray-100 dark:bg-gray-800/40 rounded-l-lg border-y border-l border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
