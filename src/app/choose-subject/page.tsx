import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SelectSubject() {
  const subjects = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Science" },
    { id: 3, name: "History" },
    { id: 4, name: "English" },
    { id: 5, name: "Computer Science" },
    { id: 6, name: "Geography" },
    // Add more subjects as needed
  ];

  return (
    <div
      className="container mx-auto px-4 py-8 min-h-screen relative"
      style={{
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Semi-transparent overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(200, 200, 200, 0.6)",
          pointerEvents: "none",
        }}
      ></div>

      {/* Content positioned above the overlay */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-6">Choose a Subject</h1>
        <div className="grid grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <Link
              href={`/game?subject=${encodeURIComponent(subject.name)}`}
              key={subject.id}
              className="w-full"
            >
              <Button
                className="font-medium py-8 px-6 rounded-lg w-full flex items-center justify-center  border-0 shadow-none bg-white"
                variant="outline"
              >
                {subject.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
