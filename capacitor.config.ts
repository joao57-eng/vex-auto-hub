import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vexautohub.app',
  appName: 'VEX Auto Hub',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
