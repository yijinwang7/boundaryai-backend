import { useCreateSurveyProvider } from "./CreateSurveyProvider";
import React, { useEffect, useState } from "react";
import { PlusIcon2 } from "./Icons";
import QuestionList from "./QuestionList";
import { motion } from "framer-motion";

const API_BASE  = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const API_TOKEN = process.env.REACT_APP_API_TOKEN || "dev-token";

const CreateSurvey = () => {

  const {
    questions,
    defaultQuestionType,
    setSurveyTitle,
    setSurveyDescription,
    surveyTitle,
    surveyDescription,
    addNewQuestion,
    loadSurveyFromBackend,
  } = useCreateSurveyProvider();

  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitleLength(surveyTitle?.length || 0);
    setDescriptionLength(surveyDescription?.length || 0);
  }, [surveyTitle, surveyDescription]);

  async function handleGenerate() {
    console.log("handleGenerate start", { API_BASE });
//const input = window.prompt("Enter a short survey description:");


    const input = window.prompt("Enter a short survey description:");
    console.log("User input:", input);
    console.log("POSTing to:", `${API_BASE}/api/surveys/generate`);
    if (!input || input.trim().length < 5) {
    alert("Please enter at least 5 characters.");
    return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/surveys/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({ description: input.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); // { id, title, questions: [...] }

      if (typeof loadSurveyFromBackend === "function") {
        loadSurveyFromBackend(data, input.trim());
      } else {
        // fallback: still fill title/description
        setSurveyTitle?.(data.title || "");
        setSurveyDescription?.(input.trim());
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate survey");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full font-switzer lg:overflow-auto scrollbar-style flex-col gap-4 sm:gap-6 sm:p-4">
      {/* Header + Generate button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create a New Survey</h1>
        {/*<button*/}
        {/*    type="button"*/}
        {/*  onClick={handleGenerate}*/}
        {/*  disabled={loading}*/}
        {/*  className="bg-[#6851a7] text-white px-4 py-2 rounded-md shadow-sm"*/}
        {/*>*/}
        {/*  {loading ? "Generating..." : "Generate Survey"}*/}
        {/*</button>*/}
        <button
         type="button"
         onClick={(e) => {           // add logs to verify it runs
         e.preventDefault();
         e.stopPropagation();
         console.log("Generate clicked");
         handleGenerate();
         }}
         disabled={loading}
         className="bg-[#6851a7] text-white px-4 py-2 rounded-md shadow-sm"
         >
         {loading ? "Generating..." : "Generate Survey"}
         </button>

      </div>

      {/* Title & Description group */}
      <div className="flex flex-col space-y-6">
        {/* Title Input */}
        <motion.div
          whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
          className="rounded-[12px] shadow-sm w-full border border-[#00000020] bg-white flex flex-col transition-all duration-300"
        >
          <motion.input
            type="text"
            maxLength={500}
            name="title"
            value={surveyTitle}
            onChange={(e) => {
              const value = e.target.value;
              setSurveyTitle(value);
              setTitleLength(value.length);
              setTitleError(value.length >= 500 ? "Title cannot exceed 500 characters." : "");
            }}
            placeholder="Enter survey title"
            className="text-[16px] px-5 pt-4 pb-1 text-primary outline-none border-none bg-transparent rounded-t-[12px] transition-all duration-200"
          />
          <div className="px-5 pb-3 text-right">
            <p className={`text-[10px] ${titleLength > 450 ? "text-amber-500" : "text-gray-400"}`}>
              {titleLength}/500
            </p>
            {titleError && <p className="text-red-500 text-sm">{titleError}</p>}
          </div>
        </motion.div>

        {/* Description Input */}
        <motion.div
          whileHover={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}
          className="rounded-[12px] shadow-sm w-full border border-[#00000020] bg-white flex flex-col transition-all duration-300"
        >
          <motion.input
            type="text"
            placeholder="Enter survey description"
            maxLength={100}
            name="description"
            value={surveyDescription}
            onChange={(e) => {
              const value = e.target.value;
              setSurveyDescription(value);
              setDescriptionLength(value.length);
              setDescriptionError(value.length >= 100 ? "Description cannot exceed 100 characters." : "");
            }}
            className="text-[16px] px-5 pt-4 pb-1 text-primary outline-none border-none bg-transparent rounded-t-[12px] transition-all duration-200"
          />
          <div className="px-5 pb-3 text-right">
            <p className={`text-[10px] ${descriptionLength > 90 ? "text-amber-500" : "text-gray-400"}`}>
              {descriptionLength}/100
            </p>
            {descriptionError && <p className="text-red-500 text-xs">{descriptionError}</p>}
          </div>
        </motion.div>
      </div>

      {/* Question List */}
      <div className="flex-1">
        <QuestionList questions={questions} />
      </div>

      {/* Add Question Button */}
      <motion.div
        whileHover={{ scale: 1.01, borderColor: "#6851a7" }}
        className="border-2 py-4 md:py-5 lg:py-6 rounded-[12px] flex justify-center border-dotted border-[#6851a7] bg-[#6851a7]/5 transition-all duration-300"
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(108, 93, 211, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => addNewQuestion(defaultQuestionType)}
          className="bg-[#6851a7] flex gap-2 items-center text-white py-3 px-6 rounded-full shadow-sm transition-all duration-300"
        >
          <PlusIcon2 className="h-4 w-4" />
          <span className="font-medium text-base">Add Question</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CreateSurvey;
