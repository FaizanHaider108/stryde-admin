type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, description, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-righteous text-2xl text-brown sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-brown/65">{description}</p>
        ) : null}
      </div>
      {action ? <MotionAction>{action}</MotionAction> : null}
    </div>
  );
}

function MotionAction({ children }: { children: React.ReactNode }) {
  return <div className="shrink-0">{children}</div>;
}
