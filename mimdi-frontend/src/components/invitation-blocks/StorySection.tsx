// Blok generik untuk menampilkan cerita cinta

import { cn } from "@/lib/utils";

type StoryPart = {
  title: string;
  content: string;
};

type StorySectionProps = {
  story: StoryPart[];
  className?: string;
  titleClassName?: string;
};

export function StorySection({ story, className, titleClassName }: StorySectionProps) {
  return (
    <section className={cn("my-16", className)}>
      <h3 className="mb-8 text-center text-3xl font-bold">Our Love Story</h3>
      <div className="space-y-8">
        {story.map((storyPart, index) => (
          storyPart.title && storyPart.content && (
            <div key={index}>
              <h4 className={cn("text-2xl font-semibold", titleClassName)}>{storyPart.title}</h4>
              <p className="mt-2 whitespace-pre-line">{storyPart.content}</p>
            </div>
          )
        ))}
      </div>
    </section>
  );
}
