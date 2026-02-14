import React, { useMemo, useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export const BackgroundRippleEffect = ({
  rows = 14,
  cols = 24,
  cellSize = 48,
}: {
  rows?: number;
  cols?: number;
  cellSize?: number;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [coverScale, setCoverScale] = useState(1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const gridWidth = cols * cellSize;
  const gridHeight = rows * cellSize;

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.max(vw / gridWidth, vh / gridHeight);
      setCoverScale(scale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [gridWidth, gridHeight]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'fixed inset-0 z-0 h-full w-full flex items-center justify-center overflow-hidden',
        '[--cell-border-color:var(--ripple-border)] [--cell-fill-color:var(--ripple-fill)] [--cell-shadow-color:hsl(var(--muted-foreground)/0.2)]',
      )}
    >
      <div
        className="relative flex items-center justify-center origin-center pointer-events-auto"
        style={{
          width: gridWidth,
          height: gridHeight,
          transform: `scale(${coverScale})`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className="background-ripple-mask opacity-90"
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ['--delay']?: string;
  ['--duration']?: string;
};

const DivGrid = ({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = 'hsl(var(--border))',
  fillColor = 'hsl(var(--muted))',
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: 'auto',
  };

  return (
    <div className={cn('relative z-[1]', className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0;
        const duration = 200 + distance * 80;

        const style: CellStyle = clickedCell
          ? {
              ['--delay']: `${delay}ms`,
              ['--duration']: `${duration}ms`,
            }
          : {};

        return (
          <div
            key={idx}
            className={cn(
              'cell relative border-[0.5px] opacity-70 transition-opacity duration-150 will-change-transform hover:opacity-100 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]',
              clickedCell && 'animate-cell-ripple [animation-fill-mode:none]',
              !interactive && 'pointer-events-none',
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
};
