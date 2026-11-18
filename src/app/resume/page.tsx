// Resume page for Kasidit Wansudon
import { Metadata } from 'next';
import ResumeClient from './ResumeClient';

export const metadata: Metadata = {
  title: 'Resume | Kasidit Wansudon',
  description: 'Full-stack developer & PM in Mexico City — Laravel, Vue.js, Go, Flutter, cloud infra, and the Kasidit AI coding framework.',
};

export default function ResumePage() {
  return <ResumeClient />;
}
