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
}) => {
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
      <div className="flex flex-row justify-between items-center gap-2 mb-2 sticky top-[2px] z-10">
        <SortControls hasSort={sort.length > 0} onClearSort={onClearSort} />
        {/* <ScrollControls
          hasScroll={hasScroll}
          canScrollLeft={canScrollLeft}
          canScrollRight={canScrollRight}
          onScrollLeft={handleScrollLeft}
          onScrollRight={handleScrollRight}
        /> */}
      </div>
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
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BuildingTable;

