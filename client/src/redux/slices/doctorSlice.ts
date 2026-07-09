import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { doctorService } from "../../services/doctor/doctorService";
import { Doctor } from "../../types";

const seededDoctors: Doctor[] = [
  {
    id: 1,
    fullName: "Dr. Kavita Sharma",
    specialization: "Endocrinology",
    city: "Mumbai",
    hospital: { id: 1, name: "Apollo Health City", city: "Mumbai" },
    email: "kavita.sharma@apollo.example",
    phone: "+91 98765 11001",
    lastVisitAt: "2026-07-04T10:30:00",
    nextFollowUpAt: "2026-07-14T11:00:00",
    productsPrescribed: [
      { id: 1, name: "GlucoZen XR", therapeuticArea: "Diabetes" },
      { id: 5, name: "Immunova", therapeuticArea: "Immunology" },
    ],
  },
  {
    id: 2,
    fullName: "Dr. Rohan Iyer",
    specialization: "Cardiology",
    city: "Pune",
    hospital: { id: 2, name: "Fortis Heart Institute", city: "Pune" },
    email: "rohan.iyer@fortis.example",
    phone: "+91 98765 11002",
    lastVisitAt: "2026-07-02T15:00:00",
    nextFollowUpAt: "2026-07-18T12:30:00",
    productsPrescribed: [
      { id: 2, name: "CardiaPlus", therapeuticArea: "Cardiology" },
    ],
  },
  {
    id: 3,
    fullName: "Dr. Meera Nair",
    specialization: "Pulmonology",
    city: "Bengaluru",
    hospital: { id: 3, name: "Sanjeevani Medical Center", city: "Bengaluru" },
    email: "meera.nair@sanjeevani.example",
    phone: "+91 98765 11003",
    lastVisitAt: "2026-06-28T09:00:00",
    nextFollowUpAt: "2026-07-12T09:30:00",
    productsPrescribed: [
      { id: 3, name: "RespiraClear", therapeuticArea: "Pulmonology" },
    ],
  },
];

interface DoctorState {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  loading: boolean;
  error: string | null;
  search: string;
  sort: string;
  page: number;
}

const initialState: DoctorState = {
  doctors: seededDoctors,
  selectedDoctor: seededDoctors[0],
  loading: false,
  error: null,
  search: "",
  sort: "last_visit_desc",
  page: 1,
};

export const fetchDoctors = createAsyncThunk(
  "doctor/fetchDoctors",
  async (params: {
    search?: string;
    city?: string;
    sort?: string;
    page?: number;
  }) => {
    return doctorService.list(params);
  },
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    selectDoctor(state, action: PayloadAction<number>) {
      state.selectedDoctor =
        state.doctors.find((doctor) => doctor.id === action.payload) ??
        state.selectedDoctor;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<string>) {
      state.sort = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.items ?? action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Unable to load HCPs";
      });
  },
});

export const { selectDoctor, setPage, setSearch, setSort } =
  doctorSlice.actions;
export default doctorSlice.reducer;
