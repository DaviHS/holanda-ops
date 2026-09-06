export type Employee = {
  id: string;
  name: string;
  cpf: string;
  rg?: string;
  pixKey?: string;
  address: string;
  sector: string;
  shift: 'diurno' | 'noturno';
  entryTime: string;
  exitTime: string;
  uniform: {
    shirt: boolean;
    pants: boolean;
    shoes: boolean;
    jacket?: boolean;
  };
  shirtSize: 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG';
  pantsSize: string;
  shoeSize: number;
  status: 'ativo' | 'inativo';
};