import { getRelativeTimeStamp } from "../services/utils & integrations/utilityServicies";

export const testRelativeTimestamps = () => {
  const now = new Date();

  const dummyTimestamps = [
    { label: "Just now", date: new Date(now.getTime() - 30 * 1000) },
    { label: "5 minutes ago", date: new Date(now.getTime() - 5 * 60 * 1000) },
    { label: "2 hours ago", date: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    { label: "Yesterday", date: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    { label: "3 days ago", date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
  ];

  dummyTimestamps.forEach(({ label, date }) => {
    const result = getRelativeTimeStamp(date);
    console.log(`${label}: ${result}`);
  });
};
