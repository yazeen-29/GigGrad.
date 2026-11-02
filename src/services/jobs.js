import { jobsAPI } from "../lib/api";
export const getJobs = async (params) => (await jobsAPI.getAll(params)).jobs;
export const getJob = jobsAPI.getOne;
export const getMyPostedJobs = jobsAPI.getMine;
export const createJob = jobsAPI.create;
