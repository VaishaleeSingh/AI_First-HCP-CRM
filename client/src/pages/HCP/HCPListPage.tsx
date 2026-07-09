import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/buttons/Button";
import { Avatar } from "../../components/common/Avatar";
import { Badge } from "../../components/common/Badge";
import { Card } from "../../components/common/Card";
import { Dropdown } from "../../components/inputs/Dropdown";
import { Input } from "../../components/inputs/Input";
import {
  fetchDoctors,
  selectDoctor,
  setPage,
  setSearch,
  setSort,
} from "../../redux/slices/doctorSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { formatShortDate } from "../../utils/formatters/date";

export const HCPListPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { doctors, error, loading, page, search, sort } = useAppSelector(
    (state) => state.doctor,
  );
  const urlSearch = searchParams.get("search") ?? "";
  const urlSort = searchParams.get("sort") ?? "last_visit_desc";

  useEffect(() => {
    if (urlSearch !== search) {
      dispatch(setSearch(urlSearch));
    }
    if (urlSort !== sort) {
      dispatch(setSort(urlSort));
    }
  }, [dispatch, search, sort, urlSearch, urlSort]);

  useEffect(() => {
    dispatch(fetchDoctors({ page, search, sort }));
  }, [dispatch, page, search, sort]);

  const filteredDoctors = doctors.filter((doctor) =>
    [doctor.fullName, doctor.specialization, doctor.city, doctor.hospital.name]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">HCP List</h1>
          <p className="mt-2 text-sm text-slate-500">
            Search, filter, sort, and open complete doctor profiles.
          </p>
        </div>
        <Button leftIcon={<Filter className="h-4 w-4" />} variant="secondary">
          Filters
        </Button>
      </div>

      <Card>
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_220px_120px]">
          <div className="relative">
            <Input
              className="pl-10"
              onChange={(event) => dispatch(setSearch(event.target.value))}
              placeholder="Search by doctor, hospital, city, specialization"
              value={search}
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          <Dropdown
            onChange={(event) => dispatch(setSort(event.target.value))}
            options={[
              { label: "Last visit: newest", value: "last_visit_desc" },
              { label: "Next follow-up", value: "follow_up_asc" },
              { label: "Name A-Z", value: "name_asc" },
            ]}
            value={sort}
          />
          <Dropdown
            options={[
              { label: "25 / page", value: "25" },
              { label: "50 / page", value: "50" },
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {loading && (
          <Card className="p-5 lg:col-span-3">
            <p className="text-sm font-semibold text-slate-500">
              Loading HCP panel...
            </p>
          </Card>
        )}
        {error && !loading && (
          <Card className="p-5 lg:col-span-3">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          </Card>
        )}
        {filteredDoctors.map((doctor) => (
          <Card className="p-5" key={doctor.id}>
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12" name={doctor.fullName} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-slate-950">
                  {doctor.fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {doctor.specialization}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {doctor.hospital.name}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>{doctor.city}</Badge>
              {doctor.productsPrescribed.map((product) => (
                <Badge key={product.id} tone="green">
                  {product.name}
                </Badge>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Last Visit
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {formatShortDate(doctor.lastVisitAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Next Follow-up
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {formatShortDate(doctor.nextFollowUpAt)}
                </p>
              </div>
            </div>
            <Link
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
              onClick={() => dispatch(selectDoctor(doctor.id))}
              to={`/hcp/${doctor.id}`}
            >
              Open profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {filteredDoctors.length} of {doctors.length} HCPs
        </p>
        <div className="flex gap-2">
          <Button
            disabled={page === 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => dispatch(setPage(page - 1))}
            variant="secondary"
          >
            Prev
          </Button>
          <Button
            onClick={() => dispatch(setPage(page + 1))}
            rightIcon={<ChevronRight className="h-4 w-4" />}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
