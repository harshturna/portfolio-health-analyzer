interface DescriptionListProps {
  term: string;
  detail: string;
}

const DescriptionList = ({ term, detail }: DescriptionListProps) => {
  return (
    <dl>
      <dt className="text-sm uppercase text-muted-foreground tracking-wide font-semibold">
        {term}
      </dt>
      <dd className="text-4xl font-extrabold">{detail}</dd>
    </dl>
  );
};

export default DescriptionList;
