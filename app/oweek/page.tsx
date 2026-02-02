import QuestionPage from '@/components/oweek/QuestionPage';
export default function Page() {
  const categories = ['Food', 'Animal', 'Plant', 'Mineral', 'Other'];
  const choices: string[] = [
    'Apple',
    'Banana',
    'Cherry',
    'Dog',
    'Cat',
    'Bird',
    'Fish',
    'Tree',
    'Rock',
    'Other',
  ];
  return (
    <div>
      {categories.map((category) => (
        <QuestionPage key={category} category={category} choices={choices} />
      ))}
    </div>
  );
}
