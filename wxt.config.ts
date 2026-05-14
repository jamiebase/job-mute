import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Job Mute',
    description: 'Hide Wanted job postings locally in your browser.',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: ['https://wanted.co.kr/*', 'https://www.wanted.co.kr/*'],
    action: {
      default_title: 'Job Mute',
    },
  },
});
