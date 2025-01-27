"use client";
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { Technician, Polygon, Coordinate } from '@/types/types';
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { useState, useEffect, useRef } from 'react';
import { apiService } from "@/services/api-service";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const styles = {
    map: {
        width: "100%",
        height: "80vh",
        overflow: "hidden",
        zIndex: "0",
    },
};

export default function Map() {
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [zoneSelected, setZoneSelected] = useState<Polygon | null>(null);
    const [technicians, setTechnicians] = useState<Technician[]>([]);

    // Référence pour le FeatureGroup
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const data = await apiService("zones", "GET");
                setPolygons(data);
            } catch (error) {
                console.error("Error fetching zones", error);
            }
        };
        fetchZones();
        const fetchTechnicians = async () => {
            try {
                const fetchedTechnicians = await apiService("users/ROLE_TECHNICIEN", "GET");
                setTechnicians(fetchedTechnicians);
            } catch (error) {
                console.error("Error fetching technicians", error);
            }
        };
        fetchTechnicians();
    }, []);

    const savePolygon = async (polygon: Polygon) => {
        try {
            const response = await apiService("zones", "POST", polygon);
            setPolygons((prevPolygons) => [...prevPolygons, { ...polygon, id: response.id }]);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de la zone :", error);
        }
    };

    const updatePolygon = async (polygon: Polygon) => {
        try {
            console.log(polygon);
            
            await apiService(`zones/${polygon.id}/edit`, "PUT", polygon);
            setPolygons((prevPolygons) =>
                prevPolygons.map((p) => (p.id === polygon.id ? polygon : p))
            );
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la zone ${polygon.id} :`, error);
        }
    };

    const deletePolygon = async (id: number) => {
        try {
            await apiService(`zones/${id}`, "DELETE");
            setPolygons((prevPolygons) => prevPolygons.filter((polygon) => polygon.id !== id));
        } catch (error) {
            console.error(`Erreur lors de la suppression de la zone ${id} :`, error);
        }
    };

    const _onCreate = (e: any) => {
        const newPolygon = e.layer.toGeoJSON();
        const coordinates = newPolygon.geometry.coordinates[0];

        const payload = {
            name: "Nom par défaut",
            colour: "#FF5733",
            coordinates: coordinates.map((coord: [number, number]) => ({ longitude: coord[0], latitude: coord[1] })),
            technician: null,
        };

        savePolygon(payload);
    };

    const _onEdited = (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
            const updatedPolygon = layer.toGeoJSON();
            const id = layer.options.id;
            const coordinates = updatedPolygon.geometry.coordinates[0];

            const payload = {
                id,
                name: "Nom modifié",
                colour: "#FF5733",
                coordinates: coordinates.map((coord: [number, number]) => ({ longitude: coord[0], latitude: coord[1] })),
                technician: null,
            };

            updatePolygon(payload);
        });
    };

    const _onDeleted = (e: any) => {
        const layers = e.layers;
        const idsToDelete: number[] = [];

        layers.eachLayer((layer: any) => {
            if (layer.options.id) {
                idsToDelete.push(layer.options.id);
            }
        });

        idsToDelete.forEach((id) => deletePolygon(id));
    };

    const addPolygonsToFeatureGroup = () => {
        const featureGroup = featureGroupRef.current;
        if (!featureGroup) return;

        featureGroup.clearLayers();
        polygons.forEach((polygon) => {
            if (!polygon.coordinates) {
                console.warn(`Les coordonnées sont indéfinies pour le polygon avec l'ID ${polygon.id}`);
                return;
            }
            const leafletPolygon = new L.Polygon(
                polygon.coordinates.map((p: Coordinate) => [p.latitude, p.longitude]),
                { color: polygon.colour, fillColor: polygon.colour, id: polygon.id } as any
            );

            leafletPolygon.on("click", () => {
                setZoneSelected(polygon);
            });

            featureGroup.addLayer(leafletPolygon);
        });
    };

    useEffect(() => {
        addPolygonsToFeatureGroup();
    }, [polygons]);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>{zoneSelected ? `Modifier la zone ${zoneSelected.name}` : "Aucune zone sélectionnée"}</CardTitle>
                </CardHeader>
                <CardContent>
                    {zoneSelected && (
                        <>
                            <Label htmlFor="zoneName">Nom de la zone</Label>
                            <Input
                                type="text"
                                id="zoneName"
                                value={zoneSelected.name}
                                onChange={(e) =>
                                    setZoneSelected((prev) => ({ ...prev, name: e.target.value }))
                                }
                            />
                            <Label htmlFor="zoneColor">Couleur de la zone</Label>
                            <Input
                                type="color"
                                id="zoneColor"
                                value={zoneSelected.colour}
                                onChange={(e) =>
                                    setZoneSelected((prev) => ({ ...prev, colour: e.target.value }))
                                }
                            />
                            <Label htmlFor="technicianSelect">Technicien</Label>
                            <Select
                                onValueChange={(value) =>
                                    setZoneSelected((prev) => ({
                                        ...prev,
                                        technician: value === "none" ? null : Number(value),
                                    }))
                                }
                                defaultValue={String(zoneSelected?.technician || "none")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir un technicien">
                                        {technicians.find((tech) => tech.id === zoneSelected.technician)?.email || "Aucun"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Aucun technicien</SelectItem>
                                    {technicians.map((tech) => {
                                        const isAssigned = polygons.some(
                                            (polygon) =>
                                                polygon.technician === tech.id &&
                                                polygon.id !== zoneSelected?.id
                                        );

                                        return (
                                            <SelectItem
                                                key={tech.id}
                                                value={String(tech.id)}
                                                disabled={isAssigned}
                                            >
                                                {tech.email} {isAssigned ? "(Assigné)" : ""}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={() => updatePolygon(zoneSelected)}
                                className="btn btn-primary mt-2"
                            >
                                Sauvegarder
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
            <MapContainer
                style={styles.map}
                center={[45.757704, 4.834099]}
                zoom={13}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onCreated={_onCreate}
                        onEdited={_onEdited}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: false,
                            polyline: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                        }}
                    />
                </FeatureGroup>
            </MapContainer>
        </>
    );
}
