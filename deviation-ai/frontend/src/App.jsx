import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";

import {
  updateField,
  updateFormFromAI,
  setInputText,
  setUploadedFile,
  setLoading,
  resetForm,
} from "./store/deviationSlice";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const dispatch = useDispatch();

  // Get deviation data from Redux
  const form = useSelector((state) => state.deviation.form);
  const text = useSelector((state) => state.deviation.inputText);
  const loading = useSelector((state) => state.deviation.loading);
  const uploadedFile = useSelector(
    (state) => state.deviation.uploadedFile
  );

  // Deviations list can remain local for now
  const [deviations, setDeviations] = useState([]);

  // Load saved deviations
  const loadDeviations = async () => {
    try {
      const response = await axios.get(`${API_URL}/deviations`);
      setDeviations(response.data.data || []);
    } catch (error) {
      console.error("Failed to load deviations:", error);
    }
  };

  useEffect(() => {
    loadDeviations();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch(
      updateField({
        name,
        value,
      })
    );
  };

  // AI text analysis
  const analyzeDeviation = async () => {
    if (!text.trim()) {
      alert("Please enter deviation details first.");
      return;
    }

    try {
      dispatch(setLoading(true));

      const response = await axios.post(`${API_URL}/analyze`, {
        text,
      });

      dispatch(updateFormFromAI(response.data.data));
    } catch (error) {
      console.error("AI analysis failed:", error);
      alert("AI analysis failed. Please check the backend terminal.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Document upload + AI analysis
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    dispatch(setUploadedFile(file.name));

    try {
      dispatch(setLoading(true));

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(updateFormFromAI(response.data.data));

      alert("Document analyzed successfully!");
    } catch (error) {
      console.error("Document analysis failed:", error);
      alert(
        "Document analysis failed. Please check the backend terminal."
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Reset Redux state
  const handleReset = () => {
    dispatch(resetForm());
  };

  // Save deviation
  const saveDeviation = async () => {
    try {
      dispatch(setLoading(true));

      const response = await axios.post(`${API_URL}/save`, {
        site: form.site,
        date_of_occurrence: form.date_of_occurrence,
        title: form.title,
        source: form.source,
        product: form.product,
        batch_number: form.batch_number,
        description: form.description,
        impact: form.impact,
        severity: form.severity,
      });

      if (response.data.success) {
        alert(
          `Deviation saved successfully! ID: ${response.data.id}`
        );

        await loadDeviations();
      }
    } catch (error) {
      console.error("Failed to save deviation:", error);
      alert("Failed to save deviation. Please check the backend.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">
        <div className="logo">AIVOA</div>

        <div className="nav-links">
          <span>QMS</span>
          <span>Dashboard</span>
          <span className="active">Deviations</span>
          <span>CAPAs</span>
          <span>Change Control</span>
          <span>Audits</span>
          <span>Documents</span>
          <span>Reports</span>
        </div>
      </nav>

      {/* ================= MAIN ================= */}

      <main className="main-container">

        {/* ================= LEFT PANEL ================= */}

        <section className="left-panel">

          <div className="panel-header">
            <div>
              <h1>Log Deviation</h1>
              <p>
                Record and classify a new quality deviation
              </p>
            </div>
          </div>

          <div className="form-grid">

            {/* Site */}
            <div className="field">
              <label>Site / Plant</label>

              <input
                name="site"
                value={form.site}
                onChange={handleChange}
                placeholder="Enter site"
              />
            </div>

            {/* Date */}
            <div className="field">
              <label>Date of Occurrence</label>

              <input
                type="date"
                name="date_of_occurrence"
                value={form.date_of_occurrence}
                onChange={handleChange}
              />
            </div>

            {/* Title */}
            <div className="field full">
              <label>Title / Short Description</label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Deviation title"
              />
            </div>

            {/* Source */}
            <div className="field">
              <label>Source</label>

              <select
                name="source"
                value={form.source}
                onChange={handleChange}
              >
                <option value="">Select source</option>
                <option value="Manufacturing">
                  Manufacturing
                </option>
                <option value="Quality Control">
                  Quality Control
                </option>
                <option value="Quality Assurance">
                  Quality Assurance
                </option>
                <option value="Warehouse">
                  Warehouse
                </option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Product */}
            <div className="field">
              <label>Related Product / Material</label>

              <input
                name="product"
                value={form.product}
                onChange={handleChange}
                placeholder="Product / material"
              />
            </div>

            {/* Batch */}
            <div className="field">
              <label>Batch / Lot Number</label>

              <input
                name="batch_number"
                value={form.batch_number}
                onChange={handleChange}
                placeholder="Batch number"
              />
            </div>

            {/* Description */}
            <div className="field full">
              <label>Detailed Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed deviation description"
                rows="5"
              />
            </div>

            {/* Impact */}
            <div className="field full">
              <label>Initial Impact</label>

              <textarea
                name="impact"
                value={form.impact}
                onChange={handleChange}
                placeholder="AI-generated impact assessment"
                rows="3"
              />
            </div>

            {/* Severity */}
            <div className="field">
              <label>Initial Severity</label>

              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
              >
                <option value="">
                  Select severity
                </option>

                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
                <option value="Critical">
                  Critical
                </option>
              </select>
            </div>

            {/* AI Assessment */}

            {form.severity && (
              <div className="ai-assessment">

                <div className="assessment-header">

                  <div className="assessment-icon">
                    ✦
                  </div>

                  <div>
                    <h3>
                      AI Severity Assessment
                    </h3>

                    <p>
                      AI-generated assessment for review
                    </p>
                  </div>

                </div>

                <div className="assessment-severity">

                  <span>
                    Suggested Severity
                  </span>

                  <strong
                    className={`severity-badge ${form.severity.toLowerCase()}`}
                  >
                    {form.severity}
                  </strong>

                </div>

                {form.reason && (
                  <div className="assessment-reason">

                    <strong>Reason</strong>

                    <p>
                      {form.reason}
                    </p>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* Form Buttons */}

          <div className="form-actions">

            <button
              className="reset-btn"
              onClick={handleReset}
              disabled={loading}
            >
              Reset Form
            </button>

            <button
              className="save-btn"
              onClick={saveDeviation}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "Save Deviation"}
            </button>

          </div>

        </section>

        {/* ================= RIGHT AI PANEL ================= */}

        <section className="right-panel">

          <div className="ai-header">

            <div className="ai-icon">
              ✦
            </div>

            <div>
              <h2>
                AI Deviation Assistant
              </h2>

              <p>
                Extract deviation information automatically
              </p>
            </div>

          </div>

          {/* Upload */}

          <div className="upload-box">

            <div className="upload-icon">
              ↑
            </div>

            <h3>
              Upload Supporting Document
            </h3>

            <p>
              Select a PDF or TXT file
            </p>

            <small>
              Supported formats: PDF, TXT
            </small>

            <input
              type="file"
              className="file-input"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={loading}
            />

            {uploadedFile && (
              <div className="uploaded-file">
                ✓ {uploadedFile}
              </div>
            )}

          </div>

          <div className="or">
            OR
          </div>

          {/* Text Input */}

          <div className="ai-input-section">

            <label>
              Paste deviation details / notes
            </label>

            <textarea
              value={text}
              onChange={(e) =>
                dispatch(
                  setInputText(e.target.value)
                )
              }
              placeholder="Paste deviation information here..."
              rows="8"
              disabled={loading}
            />

          </div>

          {/* Analyze */}

          <button
            className="analyze-btn"
            onClick={analyzeDeviation}
            disabled={loading}
          >
            {loading
              ? "AI is analyzing..."
              : "✦ Analyze with AI"}
          </button>

          {/* AI Message */}

          <div className="ai-message">

            <div className="bot-avatar">
              AI
            </div>

            <div>

              <strong>
                AI Assistant
              </strong>

              <p>
                {loading
                  ? "Analyzing the deviation and extracting relevant information..."
                  : "Paste your deviation details or upload a document. I'll extract the relevant information and suggest an initial impact and severity."}
              </p>

            </div>

          </div>

        </section>

      </main>

      {/* ================= RECENT DEVIATIONS ================= */}

      <section className="history-section">

        <div className="history-header">

          <div>

            <h2>
              Recent Deviations
            </h2>

            <p>
              Previously logged quality deviations
            </p>

          </div>

          <button
            className="refresh-btn"
            onClick={loadDeviations}
          >
            ↻ Refresh
          </button>

        </div>

        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Site</th>
                <th>Batch</th>
                <th>Severity</th>
                <th>Date</th>
              </tr>

            </thead>

            <tbody>

              {deviations.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="empty-row"
                  >
                    No deviations recorded yet.
                  </td>

                </tr>

              ) : (

                deviations.map((deviation) => (

                  <tr key={deviation.id}>

                    <td>
                      #{deviation.id}
                    </td>

                    <td className="title-cell">
                      {deviation.title || "-"}
                    </td>

                    <td>
                      {deviation.site || "-"}
                    </td>

                    <td>
                      {deviation.batch_number || "-"}
                    </td>

                    <td>

                      <span
                        className={`severity ${
                          (deviation.severity || "").toLowerCase()
                        }`}
                      >
                        {deviation.severity || "-"}
                      </span>

                    </td>

                    <td>
                      {deviation.date_of_occurrence || "-"}
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default App;