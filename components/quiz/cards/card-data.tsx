import { MatchResult } from "@/lib/quiz/generate-match";
import BaseCard from "./BaseCard"
import Image from "next/image";

const backgroundImageMapping = {
  "Purple C3": "/quiz/characters/purple/background.png",
  "Green Squiggle": "/quiz/characters/green/background.png",
  "Yellow Dorito": "/quiz/characters/yellow/background.png",
  "Blue Square": "/quiz/characters/blue/background.png",
  "Round Peach": "/quiz/characters/orange/background.png",
  "Pink Star": "/quiz/characters/pink/background.png",
}

const huddleImageMapping = {
  "Purple C3": "/quiz/characters/purple/huddle.png",
  "Green Squiggle": "/quiz/characters/green/huddle.png",
  "Yellow Dorito": "/quiz/characters/yellow/huddle.png",
  "Blue Square": "/quiz/characters/blue/huddle.png",
  "Round Peach": "/quiz/characters/orange/huddle.png",
  "Pink Star": "/quiz/characters/pink/huddle.png",
}

const hatImageMapping = {
  "Purple C3": "/quiz/characters/purple/hat.png",
  "Green Squiggle": "/quiz/characters/green/hat.png",
  "Yellow Dorito": "/quiz/characters/yellow/hat.png",
  "Blue Square": "/quiz/characters/blue/hat.png",
  "Round Peach": "/quiz/characters/orange/hat.png",
  "Pink Star": "/quiz/characters/pink/hat.png",
}

const angryImageMapping = {
  "Purple C3": "/quiz/characters/purple/angry.png",
  "Green Squiggle": "/quiz/characters/green/angry.png",
  "Yellow Dorito": "/quiz/characters/yellow/angry.png",
  "Blue Square": "/quiz/characters/blue/angry.png",
  "Round Peach": "/quiz/characters/orange/angry.png",
  "Pink Star": "/quiz/characters/pink/angry.png",
}

function Logo({ className }: { className?: string }) {
  return (
    <svg width="32" height="29" viewBox="0 0 32 29" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M8.41732 1.3458C10.6223 0.473206 12.8995 0.103174 14.7551 0.019224C15.7578 -0.0261392 16.5198 0.841679 16.4566 1.84341C16.3934 2.84514 15.5279 3.60291 14.5266 3.67279C13.1005 3.77232 11.3902 4.07837 9.7548 4.72555C7.3592 5.67358 5.2859 7.27958 4.31044 9.89127C3.02617 13.3298 3.69653 16.3862 5.30024 18.8439C6.94109 21.3584 9.54776 23.2092 11.96 24.0132C14.4877 24.8558 17.6758 25.2083 20.551 24.7364C23.4306 24.2638 25.7437 23.0186 26.9842 20.9136C27.6132 19.8461 27.7634 18.9466 27.6912 18.1962C27.6172 17.4263 27.2944 16.6742 26.7633 15.9535C26.0886 15.038 25.1459 14.2679 24.2297 13.7077C23.3499 13.1698 22.7735 12.1651 22.9872 11.1563C23.2009 10.1475 24.1392 9.42651 25.1483 9.21395C25.5399 9.13145 25.9555 9.01838 26.3631 8.86845C27.6488 8.39547 28.1924 7.81286 28.304 7.37035C28.4243 6.89308 28.3562 6.54709 28.1963 6.24167C28.0145 5.89474 27.6606 5.50878 27.0852 5.12452C26.3782 4.65249 25.4789 4.27788 24.5622 4.0151C23.5974 3.73851 22.887 2.83912 23.0135 1.84342C23.1401 0.847712 24.0535 0.134882 25.0274 0.377537C26.4086 0.721648 27.8769 1.28256 29.1035 2.1016C30.0033 2.70237 30.8656 3.5041 31.4161 4.55517C31.9884 5.64776 32.1686 6.91013 31.8285 8.25908C31.315 10.2954 29.5938 11.4502 28.1164 12.0817C28.6868 12.5922 29.2236 13.1651 29.6894 13.7972C30.5148 14.9174 31.1584 16.2804 31.3093 17.848C31.462 19.4353 31.0957 21.0958 30.1156 22.759C28.1377 26.1155 24.648 27.7473 21.1397 28.3231C17.6269 28.8997 13.8418 28.4719 10.8105 27.4615C7.66379 26.4126 4.37012 24.0697 2.2562 20.8302C0.105148 17.5338 -0.833639 13.2757 0.905403 8.61954C2.3486 4.75552 5.39535 2.54171 8.41732 1.3458Z" fill="currentColor"/>
      <path d="M17.788 20.3893C17.3215 21.278 16.2228 21.6202 15.3341 21.1537C14.4454 20.6871 14.1032 19.5885 14.5698 18.6998L15.4562 17.0112C15.9228 16.1225 17.0214 15.7803 17.9101 16.2469C18.7988 16.7135 19.141 17.8121 18.6745 18.7008L17.788 20.3893Z" fill="currentColor"/>
      <path d="M10.3997 16.6255C9.95644 17.4698 8.91259 17.795 8.06821 17.3517C7.22381 16.9084 6.89864 15.8645 7.34194 15.0201L8.18419 13.4158C8.62749 12.5714 9.67137 12.2463 10.5158 12.6896C11.3601 13.1329 11.6853 14.1767 11.242 15.0211L10.3997 16.6255Z" fill="currentColor"/>
    </svg>
  )
}

function CardFooter() {
  return (
    <div className="flex justify-between items-center gap-2 w-full">
      <Logo className="w-6 h-max" />
      <span className="font-medium leading-none">connect3.app/quiz</span>
    </div>
  )
}

function AnalysisCard({ data }: { data?: MatchResult }) {
  return (
    <BaseCard key={0} backgroundImage="/quiz/common-background/rainbow.png" className="text-[#222D56F3]">
      <div className="flex flex-col gap-6 justify-center items-center my-auto text-center">
        <Image src="/quiz/book.png" alt="Book Icon" width={150} height={150} className="w-38" />
        <div>
          <h2 className="text-2xl font-medium leading-none my-2">Based on our analysis</h2>
          <h2 className="text-2xl font-medium leading-none">3 things stood out...</h2>
        </div>
        <p className="max-w-xs text-lg leading-tight">
          {data?.standout}
        </p>
        <p className="bg-[#222D56F3] text-white rounded-full px-5 py-2 font-medium text-lg">
          Swipe to reveal
        </p>
      </div>
      <CardFooter />
    </BaseCard>
  );
}

function CharacterCard({ data }: { data?: MatchResult }) {
  if (!data) return null;
  const backgroundImage = backgroundImageMapping[data.name as keyof typeof backgroundImageMapping];
  const huddleImage = huddleImageMapping[data.name as keyof typeof huddleImageMapping];

  return (
    <BaseCard key={1} backgroundImage={backgroundImage} className="text-white">
      <div className="flex flex-col gap-6 justify-center items-center my-auto text-center">
        <Image src={huddleImage} alt="Book Icon" width={150} height={150} className="w-38" />
        <div>
          <p className="text-lg font-medium leading-none my-2">You are the</p>
          <h2 className="text-3xl font-semibold leading-none">{data?.alias}</h2>
        </div>
        <p className="max-w-xs text-lg leading-tight">
          {data?.summary}
        </p>
      </div>
      <CardFooter />
    </BaseCard>
  );
}

function SignatureTraitCard({ data }: { data?: MatchResult }) {
  if (!data) return null;
  const hatImage = hatImageMapping[data.name as keyof typeof hatImageMapping];

  return (
    <BaseCard key={2} backgroundImage="/quiz/common-background/blue.png" className="text-white">
      <div className="flex flex-col gap-6 justify-center items-center my-auto text-center">
        <Image src={hatImage} alt="Book Icon" width={150} height={150} className="w-48" />
        <div>
          <h2 className="text-lg font-medium leading-none">Signature Student Trait</h2>
        </div>
        <p className="px-2 font-semibold text-3xl leading-tight">
          {data?.trait}
        </p>
      </div>
      <CardFooter />
    </BaseCard>
  );
}

function StrengthCard({ data }: { data?: MatchResult }) {
  return (
    <BaseCard key={3} backgroundImage="/quiz/common-background/gray.png" className="text-white">
      <div className="flex flex-col gap-6 justify-center items-center my-auto text-center">
        <Image src="/quiz/plant.png" alt="Book Icon" width={150} height={150} className="w-38" />
        <div>
          <h2 className="text-lg font-medium leading-none">Top Strength</h2>
        </div>
        <p className="px-2 font-semibold text-3xl leading-tight">
          {data?.strength}
        </p>
      </div>
      <CardFooter />
    </BaseCard>
  );
}

function WeaknessCard({ data }: { data?: MatchResult }) {
  if (!data) return null;
  const angryImage = angryImageMapping[data.name as keyof typeof angryImageMapping];

  return (
    <BaseCard key={4} backgroundImage="/quiz/common-background/orange.png" className="text-white">
      <div className="flex flex-col gap-6 justify-center items-center my-auto text-center">
        <Image src={angryImage} alt="Book Icon" width={150} height={150} className="w-38" />
        <div>
          <h2 className="text-lg font-medium leading-none">Peak Weakness</h2>
        </div>
        <p className="px-2 font-semibold text-3xl leading-tight">
          {data?.weakness}
        </p>
      </div>
      <CardFooter />
    </BaseCard>
  );
}

function SeeMoreCard() {
  return (
    <BaseCard key={5} backgroundImage="/quiz/common-background/graphite.png" className="text-white">
      <div className="flex flex-col gap-6 justify-center items-center my-auto text-center">
        <Image src="/quiz/eyes.png" alt="Book Icon" width={300} height={300} className="w-full max-w-sm px-4 mb-16" />
        <div>
          <h2 className="text-2xl font-medium leading-none my-2">Want to know more?</h2>
        </div>
        <button 
          className="bg-white text-[#424242] rounded-full px-5 py-2 font-medium text-lg hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={() => window.location.href = '#'}
        >
          View all qualities
        </button>
      </div>
      <CardFooter />
    </BaseCard>
  )
}

export function createCards(data?: MatchResult): React.ReactNode[] {
  return [
    <AnalysisCard key={0} data={data} />,
    <CharacterCard key={1} data={data} />,
    <SignatureTraitCard key={2} data={data} />,
    <StrengthCard key={3} data={data} />,
    <WeaknessCard key={4} data={data} />,
    <SeeMoreCard key={5} />
  ];
}