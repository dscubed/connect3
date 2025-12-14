"use client";

import { Character } from "@/components/characters";

export function AuthCharacters() {
  return (
    <div className="relative h-[320px] w-[260px] md:h-[360px] md:w-[320px]">
      {/* top-right peach circle */}
      <Character
        color="orange"
        expression="open"
        size={80}
        className="absolute right-4 top-0 drop-shadow-md"
      />
      {/* mid-left blue blob */}
      <Character
        color="blue"
        expression="open"
        size={76}
        className="absolute left-0 top-16 drop-shadow-md"
      />
      {/* mid-right purple blob */}
      <Character
        color="purple"
        expression="open"
        size={90}
        className="absolute right-2 bottom-4 drop-shadow-md"
      />
      {/* bottom-left pink star/blob */}
      <Character
        color="red"
        expression="open"
        size={80}
        className="absolute left-4 bottom-2 drop-shadow-md"
      />
      {/* small yellow triangle */}
      <Character
        color="yellow"
        expression="open"
        size={60}
        className="absolute right-20 bottom-[96px] drop-shadow-md"
      />
      {/* small green circle */}
      <Character
        color="green"
        expression="open"
        size={60}
        className="absolute left-10 bottom-[110px] drop-shadow-md"
      />
    </div>
  );
}
