const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain"
    ].includes(file.mimetype) || /\.(pdf|docx|doc|txt)$/i.test(file.originalname);
    cb(ok ? null : new Error("Only PDF, DOC, DOCX or TXT files are allowed."), ok);
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

function cleanText(text) {
  return text.replace(/\r/g, " ").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
}

function analyze(text) {
  const t = text.toLowerCase();
  const skillMap = {
    "JavaScript": ["javascript", "js"],
    "React": ["react", "react.js"],
    "HTML": ["html"],
    "CSS": ["css"],
    "Node.js": ["node.js", "nodejs", "node "],
    "Express": ["express.js", "express"],
    "MongoDB": ["mongodb", "mongo db"],
    "SQL": ["sql", "mysql", "postgresql"],
    "Java": ["java"],
    "Python": ["python"],
    "Git": ["git", "github"],
    "REST API": ["rest api", "restful api", "restful"]
  };

  const skills = Object.entries(skillMap)
    .filter(([_, terms]) => terms.some(term => t.includes(term)))
    .map(([name]) => name);

  const sections = {
    "Contact information": /(email|e-mail|phone|mobile|linkedin)/i.test(text),
    "Education": /(education|degree|b\.?tech|bachelor|master|university|college)/i.test(text),
    "Experience": /(experience|employment|work history|internship|intern)/i.test(text),
    "Projects": /(projects|project)/i.test(text),
    "Skills": /(skills|technical skills|technologies)/i.test(text),
    "Certifications": /(certifications|certification|certificate)/i.test(text)
  };

  const presentSections = Object.values(sections).filter(Boolean).length;
  const sectionScore = Math.round((presentSections / Object.keys(sections).length) * 30);
  const skillScore = Math.min(30, skills.length * 3);
  const projectScore = /(projects|project)/i.test(text) ? 15 : 0;
  const experienceScore = /(experience|internship|intern)/i.test(text) ? 15 : 5;
  const lengthScore = text.length > 1000 ? 10 : text.length > 500 ? 7 : 3;
  const score = Math.min(100, sectionScore + skillScore + projectScore + experienceScore + lengthScore);

  const suggestions = [];
  if (!sections["Contact information"]) suggestions.push("Add clear contact information and a professional LinkedIn/GitHub link.");
  if (!sections["Education"]) suggestions.push("Add an Education section with degree, institution and graduation details.");
  if (!sections["Experience"]) suggestions.push("Add internship or project-based experience with measurable results.");
  if (!sections["Projects"]) suggestions.push("Add 2–3 relevant projects and briefly describe your contribution and technologies.");
  if (!sections["Skills"]) suggestions.push("Create a dedicated Skills section with technologies relevant to the target role.");
  if (skills.length < 5) suggestions.push("Add more job-relevant technical skills that you can confidently discuss.");
  if (!/(achieved|improved|increased|reduced|built|developed|implemented|created|designed)/i.test(text))
    suggestions.push("Use action verbs and measurable outcomes, such as percentages, users, time saved or performance improvements.");

  const strengths = [];
  if (skills.length >= 5) strengths.push(`Good technical coverage: ${skills.slice(0, 6).join(", ")}.`);
  if (sections["Projects"]) strengths.push("Projects section detected.");
  if (sections["Education"]) strengths.push("Education details detected.");
  if (sections["Experience"]) strengths.push("Experience/internship section detected.");
  if (!strengths.length) strengths.push("Your resume text was successfully extracted and is ready for improvement.");

  return {
    score,
    skills,
    sections,
    strengths,
    suggestions: suggestions.slice(0, 5),
    wordCount: text.split(/\s+/).filter(Boolean).length
  };
}

app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Please upload a resume." });

    let text = "";
    const ext = path.extname(req.file.originalname).toLowerCase();

    if (req.file.mimetype === "application/pdf" || ext === ".pdf") {
      const data = await pdfParse(req.file.buffer);
      text = data.text || "";
    } else if (
      req.file.mimetype.includes("wordprocessingml") ||
      ext === ".docx"
    ) {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value || "";
    } else {
      text = req.file.buffer.toString("utf8");
    }

    text = cleanText(text);

    if (text.length < 40) {
      return res.status(422).json({
        error: "The file was opened, but not enough readable text was found. If it is a scanned/image-only PDF, OCR is required."
      });
    }

    res.json({
      fileName: req.file.originalname,
      extractedCharacters: text.length,
      analysis: analyze(text)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Resume analysis failed." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message || "Upload failed." });
});

app.listen(PORT, () => {
  console.log(`Intervexa AI running at http://localhost:${PORT}`);
});
