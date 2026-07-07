import { JOB_APPLICANTS } from "../data/applicants";

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

// Applicants for one of the poster's jobs. Later: Firestore query on
// applications where jobId == id.
export async function getApplicants(jobId) {
  await delay();
  return JOB_APPLICANTS[jobId] || [];
}

// Accept one applicant (others become rejected) or reject a single one. Mock
// only returns the new set; Firestore would write application + job status.
export async function decideApplicant(jobId, applicantId, decision) {
  await delay(150);
  const list = JOB_APPLICANTS[jobId] || [];
  return list.map(a => {
    if (decision === "accept") return { ...a, status: a.id === applicantId ? "accepted" : "rejected" };
    return a.id === applicantId ? { ...a, status: "rejected" } : a;
  });
}
