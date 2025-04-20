import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  CheckCircle,
  Lightbulb,
  BookOpen,
  Star,
  MoveRight,
  Zap,
  Bot,
  BrainCircuit,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-12">
            <div className="md:w-1/2 space-y-6 mb-8 md:mb-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                <Zap className="h-4 w-4 mr-2" />
                <span>AI-Powered Learning</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Learn Smarter with
                <span className="text-primary"> Study Buddy</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Your AI-powered study assistant that helps you master any
                subject with personalized tutoring, 24/7 homework help, and exam
                preparation.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link href="/chat">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2 font-medium"
                  >
                    Get Started
                    <MoveRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    <span className="text-primary font-bold">20k+</span>{" "}
                    students already learning
                  </p>
                </div>
              </div>
            </div>

            <div className="md:w-1/2 relative">
              <div className="relative h-[350px] md:h-[400px] w-full rounded-lg overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background/5 z-10 rounded-lg"></div>
                <Image
                  src="/images/study-buddy.png"
                  alt="Study Buddy AI"
                  fill
                  className="object-contain z-20"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent h-20 z-30"></div>

                {/* Floating Elements */}
                <div className="absolute top-10 right-10 animate-pulse bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-30">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                </div>
                <div className="absolute bottom-20 left-10 animate-bounce bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-30">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground">
              Study Buddy combines AI technology with proven learning methods to
              help you achieve academic success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: <BookOpen className="h-10 w-10 text-primary" />,
                title: "Personalized Learning",
                description:
                  "Get customized study plans and resources tailored to your learning style and goals.",
              },
              {
                icon: <Lightbulb className="h-10 w-10 text-primary" />,
                title: "24/7 Homework Help",
                description:
                  "Stuck on a problem? Get instant help with step-by-step explanations anytime.",
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-primary" />,
                title: "Exam Preparation",
                description:
                  "Ace your tests with targeted practice questions and review materials.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-background rounded-xl shadow-md p-6 border border-border hover:border-primary/50 transition-all duration-300"
              >
                <div className="bg-primary/10 p-3 rounded-lg inline-flex mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-12 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Students
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our community of learners has to say about Study Buddy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              {
                name: "Alex K.",
                role: "AP Physics Student",
                quote:
                  "Study Buddy helped me raise my grades from a C to an A in just one semester. The explanations are so clear!",
              },
              {
                name: "Maya R.",
                role: "College Freshman",
                quote:
                  "The exam prep features are incredible. I felt so much more confident going into my finals thanks to Study Buddy.",
              },
              {
                name: "Jamal T.",
                role: "High School Senior",
                quote:
                  "Having 24/7 access to help with my homework has been a game-changer. I never feel stuck anymore.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-muted/30 border border-border rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-lg mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-primary/10 rounded-3xl mx-4 my-8">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of students who have already improved their grades
            and confidence with Study Buddy.
          </p>
          <Link href="/chat">
            <Button size="lg" className="gap-2 font-medium px-8">
              Start Learning Now
              <MoveRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="rounded-full bg-primary/10 p-2 mr-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg">Study Buddy</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Study Buddy AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
