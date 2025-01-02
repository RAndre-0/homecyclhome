export interface Technician {
  id: number;
  email: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Polygon {
  id: number;
  name: string;
  colour: string;
  coordinates: Coordinate[];
  technician: number | null;
}

export interface Technicien {
  id: number;
  first_name: string;
  last_name: string;
}

export interface Client {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Intervention {
  client: Client | number;
  id: number;
  debut: string;
  type_intervention: {
    duree: string | number | Date | Dayjs | null | undefined;
    nom: string
  };
  technicien: { id: number };
}

export interface ModelePlanning {
  id: number;
  name: string;
}