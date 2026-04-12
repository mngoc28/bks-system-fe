import { Table, TableBody } from "@/components/ui/table";
import { Building, BuildingTableProps } from "@/dataHelper/building.dataHelper";
import BuildingTableHeader from "./BuildingTableHeader";
import BuildingTableRow from "./BuildingTableRow";
// import ScrollControls from "./ScrollControls";
import SortControls from "./SortControls";
import { useTableScroll } from "../hooks/useTableScroll";

const BuildingTable: React.FC<BuildingTableProps> = ({
  buildings,
  sort,
  getSortDirection,
  onToggleSort,
  onClearSort,
  onDelete,
  highlightTerms,
}) => {
  const hasSort = sort.length > 0;

  const {
    tableScrollRef,
    // canScrollLeft,
    // canScrollRight,
    // hasScroll,
    // handleScrollLeft,
    // handleScrollRight,
  } = useTableScroll([buildings]);

  return (
    <div className="flex flex-1 flex-col">
      {hasSort && (
        <div className="mb-2 flex flex-row items-center justify-between gap-2">
          <SortControls hasSort={hasSort} onClearSort={onClearSort} />
          {/* <ScrollControls
            hasScroll={hasScroll}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            onScrollLeft={handleScrollLeft}
            onScrollRight={handleScrollRight}
          /> */}
        </div>
      )}
      <div
        ref={tableScrollRef}
        className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm"
      >
        <Table className="min-w-max text-sm text-slate-700">
          <BuildingTableHeader
            getSortDirection={getSortDirection}
            onToggleSort={onToggleSort}
          />
          <TableBody>
            {buildings.map((building: Building) => (
              <BuildingTableRow
                key={building.id}
                building={building}
                onDelete={onDelete}
                highlightTerms={highlightTerms}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BuildingTable;

