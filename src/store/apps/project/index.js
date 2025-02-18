import { createSlice } from '@reduxjs/toolkit';

const project = createSlice({
  name: 'project',
  initialState: {
    projectData: null,
  },
  reducers: {
    setProject: (state, action) => {
      state.projectData = action.payload;
    },
  },
});

export const { setProject } = project.actions;

export default project.reducer;
