import { MY_APPLICATIONS } from "../data/applications";

const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));

export async function getMyApplications() {
  await delay();
  return MY_APPLICATIONS;
}

export async function createApplication(data) {
  await delay();
  // Firestore addDoc(collection(db,"applications")) goes here later. Store
  // jobId/userId references rather than the embedded job object.
  return { id: `a${MY_APPLICATIONS.length + 1}`, status: "pending", appliedAgo: "just now", ...data };
}
