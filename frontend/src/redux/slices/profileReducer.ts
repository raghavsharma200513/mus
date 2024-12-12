import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store"; // Adjust the path based on your project structure

interface ProfileState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  token?: string; // Include other fields as per your API response
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>("profile/fetchProfile", async (_, thunkAPI) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/get_user_profile`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      return await response.json();
    } else {
      return thunkAPI.rejectWithValue("Failed to fetch profile");
    }
  } catch (error) {
    if (error instanceof Error) {
      return thunkAPI.rejectWithValue(
        error.message || "Failed to fetch profile"
      );
    }
    return thunkAPI.rejectWithValue("An unknown error occurred");
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    saveProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      if (action.payload.token) {
        localStorage.setItem("token", action.payload.token);
      }
    },
    removeProfile: (state) => {
      state.profile = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProfile.fulfilled,
        (state, action: PayloadAction<UserProfile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(
        fetchProfile.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to fetch profile";
        }
      );
  },
});

export const { saveProfile, removeProfile } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile.profile;

export default profileSlice.reducer;
