// Applicants to a poster's jobs, keyed by jobId. This is the poster-side view
// (the flip side of MY_APPLICATIONS, which is the worker's own applications).
// Later: a Firestore query on applications where jobId == X.
export const JOB_APPLICANTS = {
  j1: [
    { id: "ap1", applicant: { id: "u1", name: "Muhammad Yazeen", role: "student", rating: 4.8, jobsDone: 9 }, status: "pending", appliedAgo: "1 day ago", coverNote: "I have experience in APA formatting from my research methodology course and can deliver within 2 days." },
    { id: "ap2", applicant: { id: "u7", name: "Aparna Menon",   role: "student", rating: 4.6, jobsDone: 5 }, status: "pending", appliedAgo: "1 day ago", coverNote: "I've formatted three journal submissions in APA 7th. Comfortable with references and ToC." },
    { id: "ap3", applicant: { id: "u8", name: "Rahul Dev",      role: "student", rating: 4.2, jobsDone: 2 }, status: "pending", appliedAgo: "2 days ago", coverNote: "Fast typist, detail-oriented, available this week." },
  ],
  j6: [
    { id: "ap4", applicant: { id: "u9",  name: "Sneha Pillai", role: "student", rating: 4.9, jobsDone: 12 }, status: "pending", appliedAgo: "5 hours ago", coverNote: "I've built OMR/MCQ graders in Python with OpenCV. Can handle image + PDF input and export a clean grades CSV." },
    { id: "ap5", applicant: { id: "u10", name: "Arjun Nair",   role: "student", rating: 4.4, jobsDone: 4 }, status: "pending", appliedAgo: "1 day ago", coverNote: "Comfortable with pandas + pdf parsing. Can deliver a tested script." },
  ],
  j3: [
    { id: "ap6", applicant: { id: "u11", name: "Nikhil Raj",   role: "student", rating: 4.7, jobsDone: 7 }, status: "pending", appliedAgo: "3 hours ago", coverNote: "I design event posters in Canva & Photoshop. Will match your blue/white brand and share editable files." },
  ],
};
