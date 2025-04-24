import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function SelectSubject() {
  const subjects = [
    { id: 3, name: "History", imagePath: "/images/history.png" },
    { id: 4, name: "English", imagePath: "/images/english.png" },
    { id: 1, name: "Math", imagePath: "/images/math.png" },
    { id: 9, name: "French", imagePath: "/images/french.png" },
    { id: 2, name: "Science", imagePath: "/images/science.png" },

    { id: 6, name: "Geography", imagePath: "/images/geography.png" },
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
                className="font-medium py-4 px-2 rounded-lg w-full flex flex-col items-center justify-center border-0 shadow-none bg-white relative h-32"
                variant="outline"
              >
                <span className="absolute top-2 left-4 text-lg font-bold">
                  {subject.name}
                </span>
                <div className="relative w-full h-full mt-4">
                  <Image
                    src={subject.imagePath}
                    alt={subject.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
