import { FC } from "react";
import { PillButton, ButtonGroup } from "../../../../_design/Buttons";
import { Text } from "../../../../_design/Typography";

interface PoolPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PoolPagination: FC<PoolPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Build page numbers to display: first, last, current +-2, with ellipsis
  const pages: (number | "...")[] = [];
  const addPage = (n: number) => {
    if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
  };

  addPage(1);
  for (let i = page - 2; i <= page + 2; i++) addPage(i);
  addPage(totalPages);

  // Sort and insert ellipsis gaps
  pages.sort((a, b) => (a === "..." || b === "..." ? 0 : a - b));
  const withEllipsis: (number | "...")[] = [];
  for (let i = 0; i < pages.length; i++) {
    const curr = pages[i];
    if (i > 0 && typeof curr === "number" && typeof pages[i - 1] === "number" && curr - (pages[i - 1] as number) > 1) {
      withEllipsis.push("...");
    }
    withEllipsis.push(curr);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-3">
      <PillButton
        variant="primaryOutline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <Text variant="small">&lt;</Text>
      </PillButton>

      <ButtonGroup>
        {withEllipsis.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-1 text-sm text-gray-400">...</span>
          ) : (
            <PillButton
              key={p}
              variant="primaryOutline"
              isSelected={p === page}
              onClick={() => onPageChange(p)}
            >
              <Text variant="small">{p}</Text>
            </PillButton>
          ),
        )}
      </ButtonGroup>

      <PillButton
        variant="primaryOutline"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <Text variant="small">&gt;</Text>
      </PillButton>
    </div>
  );
};
