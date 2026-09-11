import { Skeleton } from '@enonic/ui';

const SECTIONS = 3;

/** The details column while its item is on its way: header and sections in shimmer. */
export function DetailsSkeleton() {
  return (
    <div className="flex min-h-0 flex-col gap-5 overflow-hidden p-10" aria-busy="true">
      <Skeleton.Group className="flex items-center gap-5">
        <Skeleton shape="rectangle" className="size-12 shrink-0" />
        <div className="flex flex-col gap-2.5">
          <Skeleton shape="rectangle" className="h-7 w-52" />
          <Skeleton shape="rectangle" className="h-5 w-32" />
        </div>
      </Skeleton.Group>

      {Array.from({ length: SECTIONS }, (_, section) => (
        <Skeleton.Group key={section} className="flex flex-col gap-2.5">
          <Skeleton shape="rectangle" className="h-5 w-full" />
          <Skeleton shape="rectangle" className="h-4 w-40" />
          <Skeleton shape="rectangle" className="h-4 w-64" />
        </Skeleton.Group>
      ))}
    </div>
  );
}
