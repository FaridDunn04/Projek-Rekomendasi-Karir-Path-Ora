import { validateAiResponse } from "../../utils/ai-schema-validator.js";
import type { AiGatewayAdapter, CvSource } from "./ai-gateway.adapter.js";
import type { AiAnalysisResult } from "./ai-response.schema.js";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const MOCK_PAYLOAD = {
  cv_id: "mock-cv-id",
  analyzed_at: new Date().toISOString(),
  predicted_category: "INFORMATION-TECHNOLOGY",
  confidence: 0.832,
  top_5_predictions: [
    { category: "INFORMATION-TECHNOLOGY", confidence: 0.832 },
    { category: "ENGINEERING", confidence: 0.075 },
    { category: "DIGITAL-MEDIA", confidence: 0.061 },
    { category: "BUSINESS-DEVELOPMENT", confidence: 0.052 },
    { category: "FINANCE", confidence: 0.051 },
  ],
  extracted_skills: [
    {
      category: "INFORMATION-TECHNOLOGY",
      matched_skills: [
        { skill: "Python", similarity: 0.92 },
        { skill: "TensorFlow", similarity: 0.89 },
        { skill: "PyTorch", similarity: 0.87 },
      ],
      missing_skills: [
        "Project Management",
        "Salesforce",
        "Financial Analysis",
      ],
    },
    {
      category: "ENGINEERING",
      matched_skills: [
        { skill: "Machine Learning", similarity: 0.85 },
        { skill: "Data Science", similarity: 0.8 },
      ],
      missing_skills: [
        "Civil Engineering",
        "Mechanical Design",
        "Electrical Systems",
      ],
    },
    {
      category: "DIGITAL-MEDIA",
      matched_skills: [
        { skill: "Data Visualization", similarity: 0.78 },
        { skill: "Big Data Analytics", similarity: 0.75 },
      ],
      missing_skills: ["Graphic Design", "Video Editing", "Content Writing"],
    },
    {
      category: "BUSINESS-DEVELOPMENT",
      matched_skills: [
        { skill: "Market Analysis", similarity: 0.65 },
        { skill: "Sales Strategy", similarity: 0.6 },
      ],
      missing_skills: [
        "Negotiation",
        "Customer Relationship Management",
        "Business Planning",
      ],
    },
    {
      category: "FINANCE",
      matched_skills: [
        { skill: "Financial Modeling", similarity: 0.55 },
        { skill: "Investment Analysis", similarity: 0.5 },
      ],
      missing_skills: ["Accounting", "Risk Management", "Financial Reporting"],
    },
  ],
  career_recommendations: [
    { category: "INFORMATION-TECHNOLOGY", match_score: 0.832 },
    { category: "ENGINEERING", match_score: 0.075 },
    { category: "DIGITAL-MEDIA", match_score: 0.061 },
    { category: "BUSINESS-DEVELOPMENT", match_score: 0.052 },
    { category: "FINANCE", match_score: 0.051 },
  ],
  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths " +
    "include roles such as Machine Learning Engineer, Data Scientist, and AI Researcher. " +
    "These roles leverage the strong skills in Python, TensorFlow, and PyTorch, which are " +
    "highly relevant in the Information Technology sector. Additionally, there are opportunities " +
    "in Engineering and Digital Media for roles that involve Machine Learning and Data " +
    "Visualization, respectively.",
};

const MOCK_PAYLOAD_1 = {
  cv_id: "mock-cv-id-001",
  analyzed_at: new Date().toISOString(),
  predicted_category: "HEALTHCARE",
  confidence: 0.791,
  top_5_predictions: [
    { category: "HEALTHCARE", confidence: 0.791 },
    { category: "SCIENCE", confidence: 0.082 },
    { category: "EDUCATION", confidence: 0.058 },
    { category: "SOCIAL-WORK", confidence: 0.043 },
    { category: "BUSINESS-DEVELOPMENT", confidence: 0.026 },
  ],
  extracted_skills: [
    {
      category: "HEALTHCARE",
      matched_skills: [
        { skill: "Patient Care", similarity: 0.94 },
        { skill: "Medical Terminology", similarity: 0.91 },
        { skill: "Clinical Assessment", similarity: 0.88 },
      ],
      missing_skills: ["Surgery Assistance", "Radiology", "Pharmacology"],
    },
    {
      category: "SCIENCE",
      matched_skills: [
        { skill: "Laboratory Research", similarity: 0.76 },
        { skill: "Data Analysis", similarity: 0.72 },
      ],
      missing_skills: ["Molecular Biology", "Genetics", "Biochemistry"],
    },
    {
      category: "EDUCATION",
      matched_skills: [
        { skill: "Public Health Awareness", similarity: 0.69 },
        { skill: "Community Outreach", similarity: 0.63 },
      ],
      missing_skills: [
        "Curriculum Development",
        "E-Learning",
        "Teaching Methods",
      ],
    },
    {
      category: "SOCIAL-WORK",
      matched_skills: [
        { skill: "Counseling", similarity: 0.58 },
        { skill: "Case Management", similarity: 0.54 },
      ],
      missing_skills: ["Crisis Intervention", "Social Policy", "Advocacy"],
    },
    {
      category: "BUSINESS-DEVELOPMENT",
      matched_skills: [
        { skill: "Healthcare Administration", similarity: 0.47 },
        { skill: "Budget Planning", similarity: 0.41 },
      ],
      missing_skills: [
        "Sales Strategy",
        "Market Research",
        "Business Planning",
      ],
    },
  ],
  career_recommendations: [
    { category: "HEALTHCARE", match_score: 0.791 },
    { category: "SCIENCE", match_score: 0.082 },
    { category: "EDUCATION", match_score: 0.058 },
    { category: "SOCIAL-WORK", match_score: 0.043 },
    { category: "BUSINESS-DEVELOPMENT", match_score: 0.026 },
  ],
  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths " +
    "include roles such as Registered Nurse, Clinical Coordinator, and Healthcare Administrator. " +
    "These roles leverage strong competencies in Patient Care, Medical Terminology, and Clinical " +
    "Assessment, which are highly sought after in the Healthcare sector. Secondary opportunities " +
    "exist in scientific research and public health education for candidates with laboratory and " +
    "community outreach experience.",
};

const MOCK_PAYLOAD_2 = {
  cv_id: "mock-cv-id-002",
  analyzed_at: new Date().toISOString(),
  predicted_category: "DESIGN",
  confidence: 0.714,
  top_5_predictions: [
    { category: "DESIGN", confidence: 0.714 },
    { category: "DIGITAL-MEDIA", confidence: 0.121 },
    { category: "MARKETING", confidence: 0.079 },
    { category: "ARCHITECTURE", confidence: 0.053 },
    { category: "ARTS", confidence: 0.033 },
  ],
  extracted_skills: [
    {
      category: "DESIGN",
      matched_skills: [
        { skill: "Adobe Illustrator", similarity: 0.96 },
        { skill: "Figma", similarity: 0.93 },
        { skill: "UI/UX Design", similarity: 0.9 },
      ],
      missing_skills: ["Motion Graphics", "3D Modeling", "Design Systems"],
    },
    {
      category: "DIGITAL-MEDIA",
      matched_skills: [
        { skill: "Adobe Photoshop", similarity: 0.87 },
        { skill: "Content Creation", similarity: 0.81 },
      ],
      missing_skills: [
        "Video Editing",
        "Podcast Production",
        "SEO Optimization",
      ],
    },
    {
      category: "MARKETING",
      matched_skills: [
        { skill: "Brand Identity", similarity: 0.74 },
        { skill: "Social Media Design", similarity: 0.69 },
      ],
      missing_skills: [
        "Digital Advertising",
        "Campaign Management",
        "Analytics",
      ],
    },
    {
      category: "ARCHITECTURE",
      matched_skills: [
        { skill: "Spatial Design", similarity: 0.61 },
        { skill: "Wireframing", similarity: 0.57 },
      ],
      missing_skills: [
        "AutoCAD",
        "Structural Engineering",
        "Construction Planning",
      ],
    },
    {
      category: "ARTS",
      matched_skills: [
        { skill: "Typography", similarity: 0.52 },
        { skill: "Color Theory", similarity: 0.48 },
      ],
      missing_skills: ["Fine Arts", "Sculpture", "Art History"],
    },
  ],
  career_recommendations: [
    { category: "DESIGN", match_score: 0.714 },
    { category: "DIGITAL-MEDIA", match_score: 0.121 },
    { category: "MARKETING", match_score: 0.079 },
    { category: "ARCHITECTURE", match_score: 0.053 },
    { category: "ARTS", match_score: 0.033 },
  ],
  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths " +
    "include roles such as UI/UX Designer, Product Designer, and Brand Identity Specialist. " +
    "These roles leverage strong proficiency in Adobe Illustrator, Figma, and UI/UX Design, " +
    "which are core competencies in the Design sector. Additional opportunities exist in " +
    "Digital Media and Marketing for candidates with content creation and brand identity skills, " +
    "particularly in roles bridging visual design with digital communication.",
};

const MOCK_PAYLOAD_3 = {
  cv_id: "mock-cv-id-003",
  analyzed_at: new Date().toISOString(),
  predicted_category: "LEGAL",
  confidence: 0.868,
  top_5_predictions: [
    { category: "LEGAL", confidence: 0.868 },
    { category: "BUSINESS-DEVELOPMENT", confidence: 0.064 },
    { category: "GOVERNMENT", confidence: 0.038 },
    { category: "FINANCE", confidence: 0.019 },
    { category: "EDUCATION", confidence: 0.011 },
    // { category: "EDUCATION", confidence: 0.011 },
  ],
  extracted_skills: [
    {
      category: "LEGAL",
      matched_skills: [
        { skill: "Legal Research", similarity: 0.97 },
        { skill: "Contract Drafting", similarity: 0.95 },
        { skill: "Litigation Support", similarity: 0.91 },
      ],
      missing_skills: ["International Law", "Intellectual Property", "Tax Law"],
    },
    {
      category: "BUSINESS-DEVELOPMENT",
      matched_skills: [
        { skill: "Negotiation", similarity: 0.82 },
        { skill: "Compliance Management", similarity: 0.78 },
      ],
      missing_skills: [
        "Sales Strategy",
        "Partnership Development",
        "Market Expansion",
      ],
    },
    {
      category: "GOVERNMENT",
      matched_skills: [
        { skill: "Regulatory Affairs", similarity: 0.71 },
        { skill: "Policy Analysis", similarity: 0.66 },
      ],
      missing_skills: [
        "Public Administration",
        "Legislative Drafting",
        "Government Relations",
      ],
    },
    {
      category: "FINANCE",
      matched_skills: [
        { skill: "Corporate Governance", similarity: 0.59 },
        { skill: "Due Diligence", similarity: 0.55 },
      ],
      missing_skills: [
        "Financial Modeling",
        "Investment Analysis",
        "Risk Assessment",
      ],
    },
    {
      category: "EDUCATION",
      matched_skills: [
        { skill: "Legal Writing", similarity: 0.49 },
        { skill: "Moot Court Training", similarity: 0.43 },
      ],
      missing_skills: [
        "Curriculum Design",
        "Academic Research",
        "Teaching Methods",
      ],
    },
  ],
  career_recommendations: [
    { category: "LEGAL", match_score: 0.868 },
    { category: "BUSINESS-DEVELOPMENT", match_score: 0.064 },
    { category: "GOVERNMENT", match_score: 0.038 },
    { category: "FINANCE", match_score: 0.019 },
    { category: "EDUCATION", match_score: 0.011 },
  ],
  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths " +
    "include roles such as Corporate Lawyer, Legal Consultant, and Compliance Officer. " +
    "These roles leverage exceptional strengths in Legal Research, Contract Drafting, and " +
    "Litigation Support, which form the backbone of the Legal sector. Supporting opportunities " +
    "exist in Business Development and Government for candidates whose negotiation, regulatory " +
    "affairs, and policy analysis skills complement a strong legal foundation.",
};

export class MockAiGateway implements AiGatewayAdapter {
  async analyze(_source: CvSource, cvId: string): Promise<AiAnalysisResult> {
    await sleep(200);
    const payload = { ...MOCK_PAYLOAD, cv_id: cvId };
    return validateAiResponse(payload);
  }
}
