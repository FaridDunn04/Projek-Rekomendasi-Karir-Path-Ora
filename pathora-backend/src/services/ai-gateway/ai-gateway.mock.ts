import { validateAiResponse } from "../../utils/ai-schema-validator.js";
import type { AiGatewayAdapter, CvSource } from "./ai-gateway.adapter.js";
import type { AiAnalysisResult } from "./ai-response.schema.js";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const MOCK_AI_DELAY_MS = 4_000;

const MOCK_PAYLOAD_1 = {
  cv_id: "mock-cv-id-001",
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

const MOCK_PAYLOAD_2 = {
  cv_id: "11152490",
  analyzed_at: new Date().toISOString(),
  predicted_category: "EDUCATION-ADMINISTRATION",
  confidence: 0.874,
  top_5_predictions: [
    {
      category: "EDUCATION-ADMINISTRATION",
      confidence: 0.874,
    },
    {
      category: "HUMAN-RESOURCES",
      confidence: 0.071,
    },
    {
      category: "BUSINESS-OPERATIONS",
      confidence: 0.048,
    },
    {
      category: "FINANCE-FRAUD-ANALYSIS",
      confidence: 0.039,
    },
    {
      category: "INFORMATION-TECHNOLOGY",
      confidence: 0.031,
    },
  ],
  extracted_skills: [
    {
      category: "EDUCATION-ADMINISTRATION",
      matched_skills: [
        {
          skill: "Educational Leadership",
          similarity: 0.95,
        },
        {
          skill: "Instructional Strategies",
          similarity: 0.92,
        },
        {
          skill: "School Improvement Planning",
          similarity: 0.91,
        },
        {
          skill: "Staff Training",
          similarity: 0.89,
        },
        {
          skill: "Policy Development",
          similarity: 0.87,
        },
      ],
      missing_skills: [
        "Learning Management Systems",
        "Curriculum Technology Integration",
        "Educational Data Analytics",
      ],
    },
    {
      category: "HUMAN-RESOURCES",
      matched_skills: [
        {
          skill: "Employee Management",
          similarity: 0.88,
        },
        {
          skill: "Recruiting and Selection",
          similarity: 0.84,
        },
        {
          skill: "Performance Evaluation",
          similarity: 0.83,
        },
        {
          skill: "Employee Relations",
          similarity: 0.81,
        },
      ],
      missing_skills: [
        "HRIS Management",
        "Compensation Analytics",
        "Talent Acquisition Strategy",
      ],
    },
    {
      category: "BUSINESS-OPERATIONS",
      matched_skills: [
        {
          skill: "Budget Management",
          similarity: 0.82,
        },
        {
          skill: "Process Evaluation",
          similarity: 0.8,
        },
        {
          skill: "Program Development",
          similarity: 0.79,
        },
        {
          skill: "Grant Management",
          similarity: 0.77,
        },
      ],
      missing_skills: [
        "Operations Analytics",
        "Vendor Management",
        "Enterprise Resource Planning",
      ],
    },
    {
      category: "FINANCE-FRAUD-ANALYSIS",
      matched_skills: [
        {
          skill: "Fraud Analysis",
          similarity: 0.76,
        },
        {
          skill: "Risk Assessment",
          similarity: 0.72,
        },
        {
          skill: "Financial Data Confidentiality",
          similarity: 0.69,
        },
        {
          skill: "Suspicious Activity Reporting",
          similarity: 0.67,
        },
      ],
      missing_skills: [
        "SQL for Fraud Detection",
        "AML Compliance",
        "Statistical Fraud Modeling",
      ],
    },
    {
      category: "INFORMATION-TECHNOLOGY",
      matched_skills: [
        {
          skill: "Website Development Tools",
          similarity: 0.69,
        },
        {
          skill: "Web Support",
          similarity: 0.67,
        },
        {
          skill: "Microsoft Office Suite",
          similarity: 0.65,
        },
        {
          skill: "Dreamweaver",
          similarity: 0.61,
        },
      ],
      missing_skills: [
        "Modern Web Development",
        "Database Management",
        "Cloud Platforms",
      ],
    },
  ],
  career_recommendations: [
    {
      category: "EDUCATION-ADMINISTRATION",
      match_score: 0.874,
    },
    {
      category: "HUMAN-RESOURCES",
      match_score: 0.071,
    },
    {
      category: "BUSINESS-OPERATIONS",
      match_score: 0.048,
    },
    {
      category: "FINANCE-FRAUD-ANALYSIS",
      match_score: 0.039,
    },
    {
      category: "INFORMATION-TECHNOLOGY",
      match_score: 0.031,
    },
  ],
  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths include roles such as Deputy Principal, School Principal, Director of School Improvement, Education Program Manager, and Instructional Leadership Coordinator. The candidate has strong experience in educational leadership, school operations, staff training, performance evaluation, policy compliance, budget monitoring, and student achievement improvement. Additional career opportunities are also relevant in Human Resources and Business Operations because the CV shows experience in employee management, recruiting, training, process evaluation, grant administration, and organizational leadership. The candidate also has secondary strengths in fraud analysis and web support, but these areas are less dominant compared to the education administration background.",
};

const MOCK_PAYLOAD_3 = {
  cv_id: "11152490",
  analyzed_at: "2026-06-08T00:00:00.000Z",
  predicted_category: "EDUCATION-ADMINISTRATION",
  confidence: 0.874,
  top_5_predictions: [
    {
      category: "EDUCATION-ADMINISTRATION",
      confidence: 0.874,
    },
    {
      category: "HUMAN-RESOURCES",
      confidence: 0.071,
    },
    {
      category: "BUSINESS-OPERATIONS",
      confidence: 0.048,
    },
    {
      category: "FINANCE-FRAUD-ANALYSIS",
      confidence: 0.039,
    },
    {
      category: "INFORMATION-TECHNOLOGY",
      confidence: 0.031,
    },
  ],
  extracted_skills: [
    {
      category: "EDUCATION-ADMINISTRATION",
      matched_skills: [
        {
          skill: "Educational Leadership",
          similarity: 0.95,
        },
        {
          skill: "Instructional Strategies",
          similarity: 0.92,
        },
        {
          skill: "School Improvement Planning",
          similarity: 0.91,
        },
        {
          skill: "Staff Training",
          similarity: 0.89,
        },
        {
          skill: "Policy Development",
          similarity: 0.87,
        },
      ],
      missing_skills: [
        "Learning Management Systems",
        "Curriculum Technology Integration",
        "Educational Data Analytics",
      ],
    },
    {
      category: "HUMAN-RESOURCES",
      matched_skills: [
        {
          skill: "Employee Management",
          similarity: 0.88,
        },
        {
          skill: "Recruiting and Selection",
          similarity: 0.84,
        },
        {
          skill: "Performance Evaluation",
          similarity: 0.83,
        },
        {
          skill: "Employee Relations",
          similarity: 0.81,
        },
      ],
      missing_skills: [
        "HRIS Management",
        "Compensation Analytics",
        "Talent Acquisition Strategy",
      ],
    },
    {
      category: "BUSINESS-OPERATIONS",
      matched_skills: [
        {
          skill: "Budget Management",
          similarity: 0.82,
        },
        {
          skill: "Process Evaluation",
          similarity: 0.8,
        },
        {
          skill: "Program Development",
          similarity: 0.79,
        },
        {
          skill: "Grant Management",
          similarity: 0.77,
        },
      ],
      missing_skills: [
        "Operations Analytics",
        "Vendor Management",
        "Enterprise Resource Planning",
      ],
    },
    {
      category: "FINANCE-FRAUD-ANALYSIS",
      matched_skills: [
        {
          skill: "Fraud Analysis",
          similarity: 0.76,
        },
        {
          skill: "Risk Assessment",
          similarity: 0.72,
        },
        {
          skill: "Financial Data Confidentiality",
          similarity: 0.69,
        },
        {
          skill: "Suspicious Activity Reporting",
          similarity: 0.67,
        },
      ],
      missing_skills: [
        "SQL for Fraud Detection",
        "AML Compliance",
        "Statistical Fraud Modeling",
      ],
    },
    {
      category: "INFORMATION-TECHNOLOGY",
      matched_skills: [
        {
          skill: "Website Development Tools",
          similarity: 0.69,
        },
        {
          skill: "Web Support",
          similarity: 0.67,
        },
        {
          skill: "Microsoft Office Suite",
          similarity: 0.65,
        },
        {
          skill: "Dreamweaver",
          similarity: 0.61,
        },
      ],
      missing_skills: [
        "Modern Web Development",
        "Database Management",
        "Cloud Platforms",
      ],
    },
  ],
  career_recommendations: [
    {
      category: "EDUCATION-ADMINISTRATION",
      match_score: 0.874,
    },
    {
      category: "HUMAN-RESOURCES",
      match_score: 0.071,
    },
    {
      category: "BUSINESS-OPERATIONS",
      match_score: 0.048,
    },
    {
      category: "FINANCE-FRAUD-ANALYSIS",
      match_score: 0.039,
    },
    {
      category: "INFORMATION-TECHNOLOGY",
      match_score: 0.031,
    },
  ],
  description_career_recommendations:
    "Based on the predicted category and extracted skills, the most suitable career paths include roles such as Deputy Principal, School Principal, Director of School Improvement, Education Program Manager, and Instructional Leadership Coordinator. The candidate has strong experience in educational leadership, school operations, staff training, performance evaluation, policy compliance, budget monitoring, and student achievement improvement. Additional career opportunities are also relevant in Human Resources and Business Operations because the CV shows experience in employee management, recruiting, training, process evaluation, grant administration, and organizational leadership. The candidate also has secondary strengths in fraud analysis and web support, but these areas are less dominant compared to the education administration background.",
};

const MOCK_PAYLOAD_SEQUENCE = [MOCK_PAYLOAD_1, MOCK_PAYLOAD_2, MOCK_PAYLOAD_3];

type MockAiGatewayOptions = {
  delayMs?: number;
};

export class MockAiGateway implements AiGatewayAdapter {
  private nextPayloadIndex = 0;
  private readonly delayMs: number;

  constructor(options: MockAiGatewayOptions = {}) {
    this.delayMs = options.delayMs ?? MOCK_AI_DELAY_MS;
  }

  async analyze(_source: CvSource, cvId: string): Promise<AiAnalysisResult> {
    await sleep(this.delayMs);

    const template = MOCK_PAYLOAD_SEQUENCE[this.nextPayloadIndex];
    this.nextPayloadIndex =
      (this.nextPayloadIndex + 1) % MOCK_PAYLOAD_SEQUENCE.length;

    const payload = {
      ...JSON.parse(JSON.stringify(template)),
      cv_id: cvId,
      analyzed_at: new Date().toISOString(),
    };

    return validateAiResponse(payload);
  }
}
