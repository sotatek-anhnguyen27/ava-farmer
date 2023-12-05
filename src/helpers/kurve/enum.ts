export type SignatureData = {
  r: string;
  s: string;
  v: string;
  deadline: number;
};

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT'
}
