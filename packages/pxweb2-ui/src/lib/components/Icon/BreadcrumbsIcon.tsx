import * as BreadcrumbsIcons from './BreadcrumbsIcons';

interface BreadcrumbsIconsProps {
  readonly className?: string;
}

function BreadcrumbsIcon({ className }: BreadcrumbsIconsProps) {
  const breadcrumbsIcon = BreadcrumbsIcons['ChevronRight'];

  if (!breadcrumbsIcon) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      {breadcrumbsIcon}
    </svg>
  );
}

export { BreadcrumbsIcon };
