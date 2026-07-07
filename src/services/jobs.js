import { JOBS } from "../data/jobs";

// Simulated latency so the UI exercises real async loading states now. Swap the
// bodies for Firestore queries later (getDocs / getDoc / addDoc) and the call
// sites — getJobs()/getJob()/createJob() — won't change.
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export async function getJobs() {
  await delay();
  return JOBS;
}

export async function getJob(id) {
  await delay();
  return JOBS.find(j => j.id === id) || null;
}

// Jobs posted by a given user (the poster-side "My Jobs" view). Later: a
// Firestore query on jobs where poster.id == user.id.
export async function getMyPostedJobs(userId) {
  await delay();
  return JOBS.filter(j => j.poster.id === userId);
}

export async function createJob(data) {
  await delay();
  // Mock echo of a job-shaped object. Firestore addDoc(collection(db,"jobs"))
  // goes here later; the returned id would come from the created doc.
  return { id: `j${JOBS.length + 1}`, status: "open", applicants: 0, postedAgo: "just now", ...data };
}
