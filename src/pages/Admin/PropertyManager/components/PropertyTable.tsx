import { Table, TableBody } from "@/components/ui/table";
import { Property, PropertyTableProps } from "@/dataHelper/property.dataHelper";
import PropertyTableHeader from "./PropertyTableHeader";
import PropertyTableRow from "./PropertyTableRow";
// import ScrollControls from "./ScrollControls";
import SortControls from "./SortControls";
import { useTableScroll } from "../hooks/useTableScroll";

const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
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
  } = useTableScroll([properties]);

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
        className="w-full overflow-auto rounded-xl border border-primary/10 bg-white shadow-sm"
      >
        <Table className="min-w-max text-sm text-slate-700">
          <PropertyTableHeader
            getSortDirection={getSortDirection}
            onToggleSort={onToggleSort}
          />
          <TableBody>
            {properties.map((property: Property) => (
              <PropertyTableRow
                key={property.id}
                property={property}
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

export default PropertyTable;


