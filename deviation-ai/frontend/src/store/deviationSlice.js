import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  form: {
    site: "",
    date_of_occurrence: "",
    title: "",
    source: "",
    product: "",
    batch_number: "",
    description: "",
    impact: "",
    severity: "",
    reason: "",
  },

  inputText: "",
  uploadedFile: "",
  loading: false,
};

const deviationSlice = createSlice({
  name: "deviation",
  initialState,

  reducers: {
    updateField: (state, action) => {
      const { name, value } = action.payload;
      state.form[name] = value;
    },

    updateFormFromAI: (state, action) => {
      const data = action.payload;

      state.form = {
        site: data.site || "",
        date_of_occurrence: data.date_of_occurrence || "",
        title: data.title || "",
        source: data.source || "",
        product: data.product || "",
        batch_number: data.batch_number || "",
        description: data.description || "",
        impact: data.impact || "",
        severity: data.severity || "",
        reason: data.reason || "",
      };
    },

    setInputText: (state, action) => {
      state.inputText = action.payload;
    },

    setUploadedFile: (state, action) => {
      state.uploadedFile = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    resetForm: (state) => {
      state.form = initialState.form;
      state.inputText = "";
      state.uploadedFile = "";
    },
  },
});

export const {
  updateField,
  updateFormFromAI,
  setInputText,
  setUploadedFile,
  setLoading,
  resetForm,
} = deviationSlice.actions;

export default deviationSlice.reducer;