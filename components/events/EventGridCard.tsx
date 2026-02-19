"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type Event } from "@/lib/schemas/events/event";

function getEventTags(event: Event): { label: string; color: string }[] {
  const tags: { label: string; color: string }[] = [];

  if (event.pricing.min > 0 || event.pricing.max > 0) {
    tags.push({ label: "Paid", color: "bg-red-400 text-white" });
  } else {
    tags.push({ label: "Free", color: "bg-teal-500 text-white" });
  }

  if (!event.isOnline) {
    tags.push({ label: "In-person", color: "bg-blue-400 text-white" });
  } else {
    tags.push({ label: "Online", color: "bg-cyan-400 text-white" });
  }

  if (event.category) {
    tags.push({
      label: event.category.split(/[_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      color: "bg-purple-400 text-white",
    });
  }

  return tags;
}

interface EventGridCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventGridCard({ event, onClick }: EventGridCardProps) {
  const router = useRouter();
  const tags = getEventTags(event);
  const visibleTags = tags.slice(0, 2);
  const extraTagCount = tags.length - visibleTags.length;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/events/${event.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-4 cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
        {event.thumbnail ? (
          <Image
            src={event.thumbnail}
            alt={event.name}
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-100">
            <span className="text-purple-300 text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <h3 className="font-semibold text-black text-sm leading-tight truncate group-hover:text-purple-600 transition-colors">
          {event.name}
        </h3>
        <p className="text-purple-500 text-xs mt-1">{event.category?.split(/[_\s]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</p>
        <p className="text-gray-400 text-xs mt-0.5">
          {new Date(event.start).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          ,{" "}
          {new Date(event.start).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {visibleTags.map((tag, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
          {extraTagCount > 0 && (
            <span className="text-purple-400 text-[10px] font-medium">
              + {extraTagCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
