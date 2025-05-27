import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clients: [],
  schedule: [],
  progress: {},
  programs: [],
};

const trainerSlice = createSlice({
  name: 'trainer',
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.clients = action.payload;
    },
    setSchedule: (state, action) => {
      state.schedule = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    setPrograms: (state, action) => {
      state.programs = action.payload;
    },
  },
});

export const { setClients, setSchedule, setProgress, setPrograms } = trainerSlice.actions;
export default trainerSlice.reducer;