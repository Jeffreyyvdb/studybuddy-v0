"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";

type HistoricalEvent = {
  id: string;
  year: number;
  title: string;
  description: string;
};

type EventSet = {
  id: string;
  name: string;
  events: HistoricalEvent[];
};

export default function SortGame() {
  const eventSets: EventSet[] = [
    {
      id: "ancient",
      name: "Ancient Civilizations",
      events: [
        {
          id: "ancient-1",
          year: -3000,
          title: "Ancient Egypt Unification",
          description:
            "Upper and Lower Egypt were unified under the first pharaoh.",
        },
        {
          id: "ancient-2",
          year: -776,
          title: "First Olympic Games",
          description:
            "The first recorded Olympic Games were held in Olympia, Greece.",
        },
        {
          id: "ancient-3",
          year: -753,
          title: "Founding of Rome",
          description: "According to legend, Romulus founded the city of Rome.",
        },
        {
          id: "ancient-4",
          year: -332,
          title: "Alexander the Great Conquers Egypt",
          description:
            "Alexander the Great took control of Egypt from the Persians.",
        },
        {
          id: "ancient-5",
          year: 79,
          title: "Eruption of Mount Vesuvius",
          description:
            "The volcanic eruption destroyed the Roman cities of Pompeii and Herculaneum.",
        },
      ],
    }
  ];

  const [selectedSet] = useState<string>("ancient");
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showYears, setShowYears] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Only initialize the game on first render
    startNewGame(selectedSet);
    // Empty dependency array ensures this effect runs only once on mount
  }, []);

  const startNewGame = (setId: string) => {
    const currentSet = eventSets.find((set) => set.id === setId);
    if (currentSet) {
      // Shuffle the events
      const shuffledEvents = [...currentSet.events].sort(
        () => Math.random() - 0.5
      );
      setEvents(shuffledEvents);
      setIsCorrect(null);
      setShowYears(false);
      setGameComplete(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEvents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });

      // Reset the correctness state when the order changes
      setIsCorrect(null);
    }
  };

  const checkOrder = () => {
    // Sort the current events by year to get the correct order
    const correctOrder = [...events].sort((a, b) => a.year - b.year);

    // Check if the current order matches the correct order
    const isOrderCorrect = events.every(
      (event, index) => event.id === correctOrder[index].id
    );

    setIsCorrect(isOrderCorrect);
    setAttempts(attempts + 1);

    if (isOrderCorrect) {
      setScore(score + 1);
      setShowYears(true);
      setGameComplete(true);
    }
  };

  const handleReset = () => {
    startNewGame(selectedSet);
  };

  const formatYear = (year: number) => {
    return year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`;
  };

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={events.map((event) => event.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {events.map((event, index) => (
              <SortableItem key={event.id} id={event.id}>
                <div className="relative pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-r-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-200">
                        {event.title}
                        {showYears && (
                          <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                            ({formatYear(event.year)})
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isCorrect !== null && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center ${
            isCorrect
              ? "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200"
              : "bg-gray-100 dark:bg-gray-800/30 text-gray-800 dark:text-gray-200"
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
          ) : (
            <XCircle className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
          )}
          <span>
            {isCorrect
              ? "Correct! The events are in the right order."
              : "Not quite right. Try again!"}
          </span>
        </div>
      )}

      <div className="flex justify-center">
        {!gameComplete ? (
          <Button
            onClick={checkOrder}
          >
            Check Order
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Next Round
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
