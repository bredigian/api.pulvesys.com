export type TEnvironment = 'development' | 'production' | 'beta';

export enum Hostname {
  development = 'localhost',
  production = '.pulvesys.com',
  beta = '.pulvesys.com',
  tunnel = '.brs.devtunnels.ms',
}
