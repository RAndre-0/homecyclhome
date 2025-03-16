export interface Zone {
  id: number;
  name: string;
  color: string;
  coordinates: Coordinate[];
  technicien: Technicien | null;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Polygon {
  id?: number;
  name: string;
  color?: string;
  coordinates?: Coordinate[];
  technicien?: Technicien | null;
}

export interface Technicien {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
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
  fin: string | null;
  commentaire_client: string | null;
  photo: string | null;
  velo_categorie: string | null;
  velo_electrique: boolean | null;
  velo_modele: string | null;
  velo_marque: string | null;
  adresse: string | null;
  type_intervention: TypeIntervention | null;
  client: Client | null;
  technicien: Technicien | null;
}

export interface ModelePlanning {
  id: number;
  name: string;
}

export interface InterventionModel {
  id: number;
  interventionTime: string;
  typeIntervention: TypeIntervention;
}

export interface Model {
  id: number;
  name: string;
  modeleInterventions: InterventionModel[];
}
