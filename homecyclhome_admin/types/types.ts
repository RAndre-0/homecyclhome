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
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

export interface Client {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

export interface TypeIntervention {
  nom: string;
  duree: string | number | Date | null | undefined;
  prix_depart: string | null;
}

export interface Intervention {
  id: number;
  debut: string;
  commentaire_client: string | null;
  photo: string | null;
  velo_categorie: string | null;
  velo_electrique: boolean | null;
  type_intervention: TypeIntervention | null;
  client: Client | null;
  technicien: Technicien | null;
}

export interface ModelePlanning {
  id: number;
  name: string;
}