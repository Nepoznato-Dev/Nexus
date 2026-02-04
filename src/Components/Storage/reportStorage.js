import { classifyReport, isReportLikelyValid } from '../I.R.I.S. — Intelligent Reasoning & Information Synthesizer/irisReportClassifier.js';

const INBOX_KEY = 'nexus_bug_reports_inbox';
const REVIEW_KEY = 'nexus_bug_reports_review';

const readList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const writeList = (key, list) => {
  localStorage.setItem(key, JSON.stringify(list));
};

const createId = () => `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const reportStorage = {
  getInbox() {
    return readList(INBOX_KEY);
  },

  getReviewQueue() {
    return readList(REVIEW_KEY);
  },

  submitReport(payload) {
    const text = payload?.description || payload?.message || payload?.title || '';
    const classification = classifyReport(text);
    const report = {
      id: createId(),
      createdAt: Date.now(),
      status: 'new',
      classification,
      ...payload
    };

    if (isReportLikelyValid(classification)) {
      const inbox = readList(INBOX_KEY);
      inbox.unshift(report);
      writeList(INBOX_KEY, inbox);
      return { route: 'inbox', report };
    }

    const review = readList(REVIEW_KEY);
    review.unshift(report);
    writeList(REVIEW_KEY, review);
    return { route: 'review', report };
  },

  approveReport(reportId) {
    const review = readList(REVIEW_KEY);
    const report = review.find(r => r.id === reportId);
    if (!report) return false;

    const inbox = readList(INBOX_KEY);
    inbox.unshift({ ...report, status: 'approved' });
    writeList(INBOX_KEY, inbox);

    const filtered = review.filter(r => r.id !== reportId);
    writeList(REVIEW_KEY, filtered);
    return true;
  },

  rejectReport(reportId) {
    const review = readList(REVIEW_KEY);
    const filtered = review.filter(r => r.id !== reportId);
    writeList(REVIEW_KEY, filtered);
    return true;
  },

  resolveReport(reportId) {
    const inbox = readList(INBOX_KEY);
    const updated = inbox.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r);
    writeList(INBOX_KEY, updated);
  },

  exportAll() {
    return {
      inbox: readList(INBOX_KEY),
      review: readList(REVIEW_KEY)
    };
  }
};

export default reportStorage;
