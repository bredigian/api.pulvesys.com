export type TEnvironment = 'development' | 'production' | 'beta' | 'tunnel';

export enum Hostname {
  development = 'localhost',
  production = '.pulvesys.com',
  beta = '.pulvesys.com',
  tunnel = '.brs.devtunnels.ms',
}
