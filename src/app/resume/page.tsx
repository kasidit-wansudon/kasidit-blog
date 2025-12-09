// Resume page for Kasidit Wansudon
import { Metadata } from 'next';
import ResumeClient from './ResumeClient';

export const metadata: Metadata = {
  title: 'Resume | Kasidit Wansudon',
  description: 'Full-stack Developer with expertise in Flutter, Node.js, and Laravel.',
};

export default function ResumePage() {
  return <ResumeClient />;
}
