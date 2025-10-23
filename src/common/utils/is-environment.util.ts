import { config as settings } from '@/src/core/config/config.schema';

export const isDevelopment = (): boolean => settings.NODE_ENV === 'development';
export const isProduction = (): boolean => settings.NODE_ENV === 'production';
export const isTest = (): boolean => settings.NODE_ENV === 'test';
export const isStaging = (): boolean => settings.NODE_ENV === 'staging';
